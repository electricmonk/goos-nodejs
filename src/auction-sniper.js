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
}

SniperSnapshot.joining = function(itemId) {
    return new SniperSnapshot(itemId, SniperState.Joining);
}

export default {
    PriceSource,
    SniperState,
    AuctionSniper: function(itemId, auction, sniperListener) {
        let snapshot = SniperSnapshot.joining(itemId);

        function notifyChange() {
            sniperListener.sniperStateChanged(snapshot);
        }

        return {
            auctionClosed: function() {
                snapshot = snapshot.closed();
                notifyChange();
            },

            currentPrice: function(price, increment, priceSource) {
                debug("currentPrice:", price, ", increment:", increment, ", price source", priceSource);

                switch (priceSource) {
                    case PriceSource.FromSniper:
                        snapshot = snapshot.winning(price);
                        break;

                    case PriceSource.FromOtherBidder:
                        const bid = price + increment;
                        auction.bid(bid);
                        snapshot = snapshot.bidding(price, bid);
                        break;
                }

                debug("current snapshot", snapshot);
                notifyChange();
            }
        }
    }
}