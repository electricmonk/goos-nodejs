import {PriceSource} from '../src/auction-sniper'
const debug = require('debug')('goos:AuctionMessageTranslator');

export default class {
    constructor(sniperId) {
        this.sniperId = sniperId;
        this.listeners = [];
    }

    _isFromSniper(message) {
        return message.bidder === this.sniperId ? PriceSource.FromSniper : PriceSource.FromOtherBidder;
    }

    processMessage(message) {
        if (message.command === 'Close') {
            this.listeners.forEach(listener => listener.auctionClosed());

        } else if (message.command === 'Price') {
            this.listeners.forEach(listener => listener.currentPrice(message.currentPrice, message.increment, this._isFromSniper(message)));
        }
    }

    addListener(listener) {
        this.listeners.push(listener);
    }
}