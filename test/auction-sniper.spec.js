import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import AuctionSniper from '../src/auction-sniper';

const expect = chai.expect;
chai.use(SinonChai);

describe("The Auction Sniper", () => {
    it("reports lost when auction closes", () => {
        const sniperLost = sinon.spy();
        const sniper = AuctionSniper({sniperLost});

        sniper.auctionClosed();

        expect(sniperLost).to.have.been.called;
    });
});