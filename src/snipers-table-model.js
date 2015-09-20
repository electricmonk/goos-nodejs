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
        this.snipers = [];
    }

    sniperStateChanged(sniper) {
        const index = _.findIndex(this.snipers, s => s.isForSameItemAs(sniper));

        if (~index) {
            this.snipers[index] = sniper;
        } else {
            throw new Error("No such sniper: " + sniper);
        }
    }

    addSniper(sniper) {
        this.snipers.push(sniper);
    }

    columns() {
        return Column.values;
    }

    renderColumn(column, row) {
        return `<td class=${column.className()}>${column.valueFor(row)}</td>`;
    }

    renderRow(row) {
        return `<tr id="auction-${row.itemId}">` + this.columns().map(column => this.renderColumn(column, row)).join("") + '</tr>';
    }

    renderTitle() {
        return '<tr>' + this.columns().map(column => `<th>${column.title}</th>`).join("") + '</tr>';
    }

    renderBody() {
        return this.snipers.map(sniper => this.renderRow(sniper)).join("\n");
    }

    render() {
        return `<table border="1">
                    <thead>
                        ${this.renderTitle()}
                    </thead>
                    <tbody>
                        ${this.renderBody()}
                    </tbody>
                </table>`;
    }

    _buildCell(column, sniper) {
        return {
            className: column.className(),
            text: column.valueFor(sniper)
        }
    }

    _buildRow(sniper) {
        return {
            id: sniper.itemId,
            cells: this.columns().map(column => this._buildCell(column, sniper))
        }
    }

    table() {
        return {
            title: this.columns().map(c => c.title),
            rows: this.snipers.map(sniper => this._buildRow(sniper))
        }
    }
}
