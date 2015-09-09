export default {
    Join: function() {
        return {command: "Join"};
    },

    Close: function() {
        return {command: "Close"};
    },

    Price: function(currentPrice, increment, bidder) {
        return {command: "Price", currentPrice, increment, bidder}
    }
}