import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import {AuctionSniper, PriceSource} from '../src/auction-sniper';
import {SniperListener} from '../src/main'

const expect = chai.expect;
chai.use(SinonChai);

describe("The Auction Sniper", () => {

    const sandbox = sinon.sandbox.create();
    let auction;
    let listener;
    let sniper;

    beforeEach(() => {
        auction = {bid: sandbox.spy()};
        listener = sandbox.stub(SniperListener);
        sniper = AuctionSniper(auction, listener);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("reports lost", () => {
        it("if auction closes immediately", () => {
            sniper.auctionClosed();

            expect(listener.sniperLost).to.have.been.calledOnce;
        });

        it("if auction closes when bidding", () => {
            sniper.currentPrice(123, 45, PriceSource.FromOtherBidder);
            sniper.auctionClosed();

            expect(listener.sniperLost).to.have.been.calledOnce;
        });
    });

    it("reports won if auction closes when winning", () => {
        sniper.currentPrice(123, 45, PriceSource.FromSniper);
        sniper.auctionClosed();

        expect(listener.sniperWon).to.have.been.calledOnce;
    });

    it("bids higher and reports bidding when new price arrives", () => {
        const price = 1001;
        const increment = 25;

        sniper.currentPrice(price, increment, PriceSource.FromOtherBidder);

        expect(listener.sniperBidding).to.have.been.called;
        expect(auction.bid).to.have.been.calledWith(price + increment);
    });

    it("reports winning when current price comes from sniper", () => {
        sniper.currentPrice(123, 45, PriceSource.FromSniper);

        expect(listener.sniperWinning).to.have.been.called;
        expect(auction.bid).not.to.have.been.called;
    });
});