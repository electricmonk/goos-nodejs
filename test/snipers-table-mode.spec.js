require('source-map-support').install();

import {expect} from 'chai';
import SnipersTableModel from '../src/snipers-table-model';
import {SniperSnapshot, SniperState} from '../src/auction-sniper';

describe("the snipers table model", () => {
    let model;

    beforeEach("create a new table model", () => {
        model = new SnipersTableModel();
    })

    it("renders a new sniper", () => {
        const itemId = "some-item";
        const snapshot = SniperSnapshot.joining(itemId);

        model.addSniper(snapshot);

        expect(model.render()).to.include(itemId);
    });

    it("renders all columns of a sniper", () => {
        const itemId = "some-item";
        const price = 1000;
        const bid = 15;
        const snapshot = new SniperSnapshot.joining(itemId).bidding(price, bid);

        model.addSniper(snapshot);

        expect(model.render()).to.include(itemId);
        expect(model.render()).to.include(price);
        expect(model.render()).to.include(bid);
        expect(model.render()).to.include(SniperState.Bidding);
    });

    it("updates correct sniper state", () => {
        const itemId = "some-item";
        const snapshot = SniperSnapshot.joining(itemId);

        model.addSniper(snapshot);
        model.addSniper(SniperSnapshot.joining("some-other-item"));

        model.sniperStateChanged(snapshot.bidding(1, 2));

        const table = model.render();
        console.log(table);
        expect(table).to.include(SniperState.Bidding).and.to.include(SniperState.Joining);
    });

    it("explodes if there's not sniper to updated", () => {
        expect(() => model.sniperStateChanged(SniperSnapshot.joining("some-item"))).to.throw();
    });
});
