import {PriceSource} from '../src/auction-sniper'
const debug = require('debug')('goos:AuctionMessageTranslator');

export default class {
    constructor(sniperId, listener) {
        this.sniperId = sniperId;
        this.listener = listener;
    }

    _isFromSniper(message) {
        return message.bidder === this.sniperId ? PriceSource.FromSniper : PriceSource.FromOtherBidder;
    }

    processMessage(message) {
        if (message.command === 'Close') {
            this.listener.auctionClosed();

        } else if (message.command === 'Price') {
            this.listener.currentPrice(message.currentPrice, message.increment, this._isFromSniper(message));
        }
    }
}