require('source-map-support').install();

import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import {AuctionSniper, PriceSource, SniperState} from '../src/auction-sniper';
import {SniperListener} from '../src/main'

const expect = chai.expect;
chai.use(SinonChai);

describe("The Auction Sniper", () => {
    const ItemId = "item";

    const sandbox = sinon.sandbox.create();
    let auction;
    let listener;
    let sniper;

    beforeEach(() => {
        auction = {bid: sandbox.spy()};
        listener = sandbox.stub(SniperListener);
        sniper = AuctionSniper(ItemId, auction, listener);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("reports lost", () => {
        it("if auction closes immediately", () => {
            sniper.auctionClosed();

            expect(listener.sniperStateChanged).to.have.been.calledWithMatch({status: SniperState.Lost, itemId: ItemId});
        });

        it("if auction closes when bidding", () => {
            sniper.currentPrice(123, 45, PriceSource.FromOtherBidder);
            sniper.auctionClosed();

            expect(listener.sniperStateChanged).to.have.been.calledWithMatch({status: SniperState.Lost, itemId: ItemId});
        });
    });

    it("reports won if auction closes when winning", () => {
        sniper.currentPrice(123, 45, PriceSource.FromSniper);
        sniper.auctionClosed();

        expect(listener.sniperStateChanged).to.have.been.calledWithMatch({status: SniperState.Won, itemId: ItemId});
    });

    it("bids higher and reports bidding when new price arrives", () => {
        const price = 1001;
        const increment = 25;
        const bid = price + increment;

        sniper.currentPrice(price, increment, PriceSource.FromOtherBidder);

        expect(listener.sniperStateChanged).to.have.been.calledWithMatch({status: SniperState.Bidding, itemId: ItemId, lastPrice: price, lastBid: bid});
        expect(auction.bid).to.have.been.calledWith(bid);
    });

    it("reports winning when current price comes from sniper", () => {
        sniper.currentPrice(123, 12, PriceSource.FromOtherBidder);
        expect(auction.bid).to.have.been.calledOnce;

        sniper.currentPrice(135, 45, PriceSource.FromSniper);
        expect(listener.sniperStateChanged).to.have.been.calledWithMatch({status: SniperState.Winning, itemId: ItemId, lastPrice: 135, lastBid: 135});
    });
});