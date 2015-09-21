import {SniperSnapshot} from './auction-sniper';
import _ from 'lodash';

class Column {
    constructor(name, title) {
        this.name = name;
        this.title = title;
    }

    className() {
        return this.name;
    }

    valueFor(state) {
        return state[this.name] || '0';
    }
}

Column.itemId = new Column('itemId', 'Item Id');
Column.status = new Column('status', 'Status');
Column.lastBid = new Column('lastBid', 'Last Bid');
Column.lastPrice = new Column('lastPrice', 'Last Price');
Column.values = [Column.itemId, Column.status, Column.lastBid, Column.lastPrice];

export default class SnipersTableModel {

    constructor() {
        this.snapshots = [];
    }

    sniperStateChanged(snapshot) {
        const index = _.findIndex(this.snapshots, s => s.isForSameItemAs(snapshot));

        if (~index) {
            this.snapshots[index] = snapshot;
        } else {
            throw new Error("No such snapshot: " + snapshot);
        }
    }

    addSniper(sniper) {
        this.snapshots.push(sniper.snapshot);
    }

    columns() {
        return Column.values;
    }

    _buildCell(column, snapshot) {
        return {
            className: column.className(),
            text: column.valueFor(snapshot)
        }
    }

    _buildRow(snapshot) {
        return {
            id: snapshot.itemId,
            cells: this.columns().map(column => this._buildCell(column, snapshot))
        }
    }

    table() {
        return {
            title: this.columns().map(c => c.title),
            rows: this.snapshots.map(snapshot => this._buildRow(snapshot))
        }
    }
}
