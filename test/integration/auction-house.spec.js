require('source-map-support').install();

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import FakeAuctionServer from '../drivers/fake-auction-server';
import Promise from 'bluebird';
import AuctionHouse from '../../src/auction-house';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe("an auction", () => {
    let auctionServer;
    const Bidder = "the sniper";
    const auctionHouse = new AuctionHouse(Bidder);

    before("start the auction server", () => {
        auctionServer = new FakeAuctionServer("item-12345");
        return auctionServer.startSellingItem();
    });

    after("stop the auction server", () => auctionServer.stop());

    after("stop the auction house", () => auctionHouse.stop());

    it("receives events from auction server after joining", () => {

        const auction = auctionHouse.anAuctionFor(auctionServer.itemId);
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