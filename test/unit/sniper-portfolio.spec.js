require('source-map-support').install();

import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import SniperPortfolio from '../../src/sniper-portfolio';

const expect = chai.expect;
chai.use(SinonChai);

describe("The sniper portfolio", () => {
    it("notifies listeners when a sniper is added", () => {
        const portfolio = new SniperPortfolio();
        const listener = {
            sniperAdded: sinon.spy()
        };

        portfolio.addListener(listener);

        const sniper = {};
        portfolio.addSniper(sniper);

        expect(listener.sniperAdded).to.have.been.calledWith(sniper);
    });
});
