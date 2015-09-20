import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import Message from '../src/message';
import AuctionMessageTranslator from '../src/auction-message-translator'
import {PriceSource} from '../src/auction-sniper'

const expect = chai.expect;
chai.use(SinonChai);

const SniperId = "sniper";

describe("an auction message translator", () => {
    it("notifies the auction when a close message has been received", () => {
        const auctionClosed = sinon.spy();
        const translator = new AuctionMessageTranslator(SniperId, {auctionClosed});
        const message = Message.Close();

        translator.processMessage(message);

        expect(auctionClosed).to.have.been.called;
    });

    describe("notifies bid details when current price message received", () => {
        it("from other bidder", () => {
            const currentPrice = sinon.spy();
            const translator = new AuctionMessageTranslator(SniperId, {currentPrice});
            const message = Message.Price(192, 7, "Someone else");

            translator.processMessage(message);

            expect(currentPrice).to.have.been.calledWith(192, 7, PriceSource.FromOtherBidder);
        });

        it("from sniper", () => {
            const currentPrice = sinon.spy();
            const translator = new AuctionMessageTranslator(SniperId, {currentPrice});
            const message = Message.Price(192, 7, SniperId);

            translator.processMessage(message);

            expect(currentPrice).to.have.been.calledWith(192, 7, PriceSource.FromSniper);
        });
    });
});

