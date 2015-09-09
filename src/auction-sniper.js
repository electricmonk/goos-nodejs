const debug = require('debug')('goos:AuctionSniper');

export default function(auction, sniperListener) {
    return {
        auctionClosed: function() {
            sniperListener.sniperLost();
        },

        currentPrice: function(price, increment) {
            debug("currentPrice:", price, ", increment:", increment);
            auction.bid(price + increment);
            sniperListener.sniperBidding();
        }
    }
}