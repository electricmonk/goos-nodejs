const debug = require('debug')('goos:AuctionSniper');

const PriceSource = {FromSniper: 'FromSniper', FromOtherBidder: 'FromOtherBidder'};

export default {
    PriceSource,
    AuctionSniper: function(auction, sniperListener) {
        return {
            auctionClosed: function() {
                sniperListener.sniperLost();
            },

            currentPrice: function(price, increment, priceSource) {
                debug("currentPrice:", price, ", increment:", increment, ", price source", priceSource);

                switch (priceSource) {
                    case PriceSource.FromOtherBidder:
                        auction.bid(price + increment);
                        sniperListener.sniperBidding();
                        break;

                    case PriceSource.FromSniper:
                        sniperListener.sniperWinning();
                }
            }
        }
    }
}