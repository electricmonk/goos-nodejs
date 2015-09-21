import _ from 'lodash';

const debug = require('debug')('goos:AuctionSniper');

const PriceSource = {FromSniper: 'FromSniper', FromOtherBidder: 'FromOtherBidder'};
const SniperState = {Joining: 'Joining', Lost: 'Lost', Bidding: 'Bidding', Winning: 'Winning', Won: 'Won'};

class SniperSnapshot {
    constructor(itemId, status, lastPrice, lastBid) {
        this.itemId = itemId;
        this.status = status;
        this.lastPrice = lastPrice;
        this.lastBid = lastBid;
    }

    winning(price) {
        return new SniperSnapshot(this.itemId, SniperState.Winning, price, this.lastBid);
    }

    bidding(price, bid) {
        return new SniperSnapshot(this.itemId, SniperState.Bidding, price, bid);
    }

    closed() {
        const state = this.status === SniperState.Winning ? SniperState.Won : SniperState.Lost;
        return new SniperSnapshot(this.itemId, state, this.lastPrice, this.lastBid);
    }

    isForSameItemAs(other) {
        return this.itemId === other.itemId;
    }
}

SniperSnapshot.joining = function(itemId) {
    return new SniperSnapshot(itemId, SniperState.Joining);
}

class AuctionSniper {
    constructor(itemId, auction) {
        this.snapshot = SniperSnapshot.joining(itemId);
        this.auction = auction;
        this.listeners = [];

        this._notifyChange();
    }

    _notifyChange() {
        this.listeners.forEach(listener => listener.sniperStateChanged(this.snapshot));
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    auctionClosed() {
        this.snapshot = this.snapshot.closed();
        this._notifyChange();
    }

    currentPrice(price, increment, priceSource) {
        debug("currentPrice:", price, ", increment:", increment, ", price source", priceSource);

        switch (priceSource) {
            case PriceSource.FromSniper:
                this.snapshot = this.snapshot.winning(price);
                break;

            case PriceSource.FromOtherBidder:
                const bid = price + increment;
                this.auction.bid(bid);
                this.snapshot = this.snapshot.bidding(price, bid);
                break;
        }

        debug("current snapshot", this.snapshot);
        this._notifyChange();
    }


}

export default {
    SniperSnapshot,
    PriceSource,
    SniperState,
    AuctionSniper
}