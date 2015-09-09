import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import Message from '../src/message';
import AuctionMessageTranslator from '../src/auction-message-translator'

const expect = chai.expect;
chai.use(SinonChai);

describe("an auction message translator", () => {
    it("notifies the auction when a close message has been received", () => {
        const auctionClosed = sinon.spy();
        const translator = new AuctionMessageTranslator({auctionClosed});
        const message = Message.Close();

        translator.processMessage(null, message);

        expect(auctionClosed).to.have.been.called;
    });

    it("notifies bid details when current price message received", () => {
        const currentPrice = sinon.spy();
        const translator = new AuctionMessageTranslator({currentPrice});
        const message = Message.Price(192, 7, "Someone else");

        translator.processMessage(null, message);

        expect(currentPrice).to.have.been.calledWith(192, 7);
    });
});

