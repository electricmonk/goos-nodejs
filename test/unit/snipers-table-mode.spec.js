require('source-map-support').install();

import chai from 'chai';
import chaiThings from 'chai-things';
import SnipersTableModel from '../../src/snipers-table-model';
import {SniperSnapshot, AuctionSniper, SniperState} from '../../src/auction-sniper';

const expect = chai.expect;
chai.use(chaiThings);

chai.Assertion.addMethod("row", function(num, id, cells) {
    const row = this._obj.rows[num];

    this.assert(
        row.id === id,
        `expected ${JSON.stringify(row)} to have id ${id} but got ${row.id}`,
        `expected ${JSON.stringify(row)} to not have id ${id} but got ${row.id}`
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
    let sniper;
    const itemId = "some-item";

    beforeEach("create a new table model", () => model = new SnipersTableModel());
    beforeEach("create a new sniper", () => sniper = new AuctionSniper("item-1234"));

    it("has a title row", () => {
        expect(model.table().title).to.eql(["Item Id", "Status", "Last Bid", "Last Price"]);
    });

    it("includes a new sniper", () => {
        const price = 1000;
        const bid = 15;

        model.addSniper(sniper);
        model.sniperStateChanged(sniper.snapshot.bidding(price, bid));

        expect(model.table()).to.have.row(0, sniper.itemId, [
            {className: "itemId", text: sniper.itemId},
            {className: "status", text: SniperState.Bidding},
            {className: "lastBid", text: bid},
            {className: "lastPrice", text: price}]);
    });


    it("updates correct sniper state", () => {
        const sniper2 = new AuctionSniper("some-other-item");

        model.addSniper(sniper);
        model.addSniper(sniper2);

        model.sniperStateChanged(sniper.snapshot.bidding(1, 2));

        expect(model.table()).to.have.row(0, sniper.itemId, [{className: "status", text: SniperState.Bidding}])
            .and.to.have.row(1, sniper2.itemId, [{className: "status", text: SniperState.Joining}])
    });

    it("explodes if there's not sniper to updated", () => {
        expect(() => model.sniperStateChanged(SniperSnapshot.joining("some-item"))).to.throw();
    });
});
