require('source-map-support').install();

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import FakeAuctionServer from '../drivers/fake-auction-server';
import Auction from '../../src/auction';
import Redis from 'then-redis';
import Promise from 'bluebird';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("an auction", () => {
    let auctionServer;
    const subscriber = Redis.createClient();
    const publisher = Redis.createClient();

    before("start the auction server", () => {
        auctionServer = new FakeAuctionServer("item-12345");
        return auctionServer.startSellingItem();
    });

    after("stop the auction server", () => auctionServer.stop());

    after("close the Redis clients", () => {
        subscriber.quit();
        publisher.quit();
    })

    it("receives events from auction server after joining", () => {
        const Bidder = "the sniper";

        const auction = new Auction(publisher, subscriber, auctionServer.itemId, Bidder);
        const listener = new latchingListener();
        auction.addListener(listener);

        auction.join();
        auctionServer.hasReceivedJoinRequestFrom(Bidder);

        auctionServer.announceClosed();
        return listener.gotClosedEvent();
    });

    function latchingListener() {
        let _resolve;
        const message = "resolved";
        const promise = new Promise(function(resolve) {
            _resolve = resolve;
        });

        this.auctionClosed = () => _resolve(message);

        this.gotClosedEvent = () => expect(promise).to.eventually.equal(message);
    }
});