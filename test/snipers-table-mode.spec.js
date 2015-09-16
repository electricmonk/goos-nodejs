require('source-map-support').install();

import sinon from 'sinon';
import SinonChai from 'sinon-chai';
import chai from 'chai';
import SnipersTableModel from '../src/snipers-table-model';
import {SniperSnapshot, SniperState} from '../src/auction-sniper';

const model = new SnipersTableModel();

describe("the snipers table model", () => {
    it("sets sniper values in columns", () => {
        const snapshot = new SniperSnapshot("item", SniperState.Joining, 123, 45);

        model.sniperStateChanged(snapshot);


    });
});
