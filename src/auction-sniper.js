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
}

SniperSnapshot.joining = function(itemId) {
    return new SniperSnapshot(itemId, SniperState.Joining);
}

export default {
    PriceSource,
    SniperState,
    AuctionSniper: function(itemId, auction, sniperListener) {
        let snapshot = SniperSnapshot.joining(itemId);
        let isWinning = false;

        return {
            auctionClosed: function() {
                isWinning ? sniperListener.sniperWon() : sniperListener.sniperLost();
            },

            currentPrice: function(price, increment, priceSource) {
                debug("currentPrice:", price, ", increment:", increment, ", price source", priceSource);

                isWinning = priceSource === PriceSource.FromSniper;

                if (isWinning) {
                    snapshot = snapshot.winning(price);

                } else {
                    const bid = price + increment;
                    auction.bid(bid);
                    snapshot = snapshot.bidding(price, bid);
                }

                debug("current snapshot", snapshot);
                sniperListener.sniperStateChanged(snapshot);
            }
        }
    }
}