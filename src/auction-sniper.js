const debug = require('debug')('goos:AuctionSniper');

const PriceSource = {FromSniper: 'FromSniper', FromOtherBidder: 'FromOtherBidder'};

export default {
    PriceSource,
    AuctionSniper: function(itemId, auction, sniperListener) {
        let isWinning = false;

        return {
            auctionClosed: function() {
                isWinning ? sniperListener.sniperWon() : sniperListener.sniperLost();
            },

            currentPrice: function(price, increment, priceSource) {
                debug("currentPrice:", price, ", increment:", increment, ", price source", priceSource);

                isWinning = priceSource === PriceSource.FromSniper;

                if (isWinning) {
                    sniperListener.sniperWinning();

                } else {
                    const bid = price + increment;
                    auction.bid(bid);
                    sniperListener.sniperBidding({itemId, lastPrice: price, lastBid: bid});
                }
            }
        }
    }
}