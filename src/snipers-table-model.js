import {SniperSnapshot} from './auction-sniper';

class Column {
    constructor(name, title) {
        this.name = name;
        this.title = title;
    }

    className() {
        return this.name;
    }

    valueFor(state) {
        return state[this.name] || '';
    }
}

Column.itemId = new Column('itemId', 'Item Id');
Column.status = new Column('status', 'Status');
Column.lastBid = new Column('lastBid', 'Last Bid');
Column.lastPrice = new Column('lastPrice', 'Last Price');
Column.values = [Column.itemId, Column.status, Column.lastBid, Column.lastPrice];

export default class SnipersTableModel {

    constructor() {
        this.currentState = SniperSnapshot.joining();
    }

    sniperStateChanged(newState) {
        this.currentState = newState;
    }

    columns() {
        return Column.values;
    }

    renderColumn(column, row) {
        return `<td class=${column.className()}>${column.valueFor(row)}</td>`;
    }

    renderRow(row) {
        return '<tr>' + this.columns().map(column => this.renderColumn(column, row)).join("") + '</tr>';
    }

    renderTitle() {
        return '<tr>' + this.columns().map(column => `<th>${column.title}</th>`).join("") + '</tr>';
    }

    render() {
        return `<table border="1">
                    <thead>
                        ${this.renderTitle()}
                    </thead>
                    <tbody>
                        ${this.renderRow(this.currentState)}
                    </tbody>
                </table>`;
    }
}
