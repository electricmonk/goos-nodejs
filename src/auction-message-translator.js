const debug = require('debug')('goos:AuctionMessageTranslator');

export default function AuctionMessageTranslator(listener) {

    return {
        processMessage: function (topic, message) {
            debug("Got message", message, "in topic", topic);

            if (message.command === 'Close') {
                listener.auctionClosed();

            } else if (message.command === 'Price') {
                listener.currentPrice(message.currentPrice, message.increment);
            }
        }
    }
}