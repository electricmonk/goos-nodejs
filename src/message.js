export default {
    Join: function(bidder) {
        return {command: "Join", bidder};
    },

    Close: function() {
        return {command: "Close"};
    },

    Price: function(currentPrice, increment, bidder) {
        return {command: "Price", currentPrice, increment, bidder}
    },

    Bid: function(bidder, bid) {
        return {command: "Bid", bidder, bid}
    }
}