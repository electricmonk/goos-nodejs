import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import AuctionMessageTranslator from '../src/auction-message-translator'

const expect = chai.expect;
chai.use(SinonChai);

describe("an auction message translator", () => {
    it("notifies the auction when a close message has been received", () => {
        const auctionClosedListener = sinon.spy();
        const translator = new AuctionMessageTranslator(auctionClosedListener);
        const message = {command: "Close"};

        translator.processMessage(null, message);

        expect(auctionClosedListener).to.have.been.called;
    });
});

