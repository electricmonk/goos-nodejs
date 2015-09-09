export default function AuctionMessageTranslator(listener) {

    return {
        processMessage: function (topic, message) {
            if (message.command === 'Close') listener.auctionClosed()
            else if (message.command === 'Price') listener.currentPrice(message.currentPrice, message.increment);
        }
    }
}