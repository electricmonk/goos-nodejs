import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import AuctionSniper from '../src/auction-sniper';
import {PriceSource} from '../src/auction-message-translator';

const expect = chai.expect;
chai.use(SinonChai);

describe("The Auction Sniper", () => {
    it("reports lost when auction closes", () => {
        const sniperLost = sinon.spy();
        const sniper = AuctionSniper(null, {sniperLost});

        sniper.auctionClosed();

        expect(sniperLost).to.have.been.calledOnce;
    });

    it("bids higher and reports bidding when new price arrives", () => {
        const price = 1001;
        const increment = 25;
        const bid = sinon.spy();
        const sniperBidding = sinon.spy();
        const sniper = AuctionSniper({bid}, {sniperBidding});

        sniper.currentPrice(price, increment, PriceSource.FromOtherBidder);

        expect(sniperBidding).to.have.been.called;
        expect(bid).to.have.been.calledWith(price + increment);
    });

    it("reports winning when current price comes from sniper", () => {
        const sniperWinning = sinon.spy();
        const sniper = AuctionSniper({bid}, {sniperWinning});
        const bid = sinon.spy();

        sniper.currentPrice(123, 45, PriceSource.FromSniper);

        expect(sniperWinning).to.have.been.called;
        expect(bid).not.to.have.been.called;
    });
});