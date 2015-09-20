require('source-map-support').install();

import chai from 'chai';
import chaiThings from 'chai-things';
import SnipersTableModel from '../src/snipers-table-model';
import {SniperSnapshot, SniperState} from '../src/auction-sniper';

const expect = chai.expect;
chai.use(chaiThings);

chai.Assertion.addMethod("row", function(num, id, cells) {
    const row = this._obj.rows[num];

    this.assert(
        row.id === id,
        "expected #{this} to be of type #{exp} but got #{act}",
        "expected #{this} to not be of type #{act}",
        id,
        row.id
    );

    cells.forEach(cell => {
        try {
            new chai.Assertion(row.cells).to.include.something.that.deep.equals(cell)
        } catch(e) {
            throw new chai.AssertionError(`expected cells ${JSON.stringify(row.cells)} to have a cell that matches ${JSON.stringify(cell)}`);
        }
    });
});

describe("the snipers table model", () => {
    let model;

    beforeEach("create a new table model", () => {
        model = new SnipersTableModel();
    })

    it("has a title row", () => {
        expect(model.table().title).to.eql(["Item Id", "Status", "Last Bid", "Last Price"]);
    });

    it("includes a new sniper", () => {
        const itemId = "some-item";
        const price = 1000;
        const bid = 15;
        const snapshot = new SniperSnapshot.joining(itemId).bidding(price, bid);

        model.addSniper(snapshot);

        expect(model.table()).to.have.row(0, itemId, [
            {className: "itemId", text: itemId},
            {className: "status", text: SniperState.Bidding},
            {className: "lastBid", text: bid},
            {className: "lastPrice", text: price}]);
    });


    it("updates correct sniper state", () => {
        const item1 = "some-item";
        const item2 = "some-other-item";
        const snapshot = SniperSnapshot.joining(item1);

        model.addSniper(snapshot);
        model.addSniper(SniperSnapshot.joining(item2));

        model.sniperStateChanged(snapshot.bidding(1, 2));

        expect(model.table()).to.have.row(0, item1, [{className: "status", text: SniperState.Bidding}])
            .and.to.have.row(1, item2, [{className: "status", text: SniperState.Joining}])
    });

    it("explodes if there's not sniper to updated", () => {
        expect(() => model.sniperStateChanged(SniperSnapshot.joining("some-item"))).to.throw();
    });
});
