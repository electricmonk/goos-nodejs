export default function(sniperListener) {
    return {
        auctionClosed: function() {
            sniperListener.sniperLost();
        },

        currentPrice: function(price, increment) {

        }
    }
}