export default function AuctionMessageTranslator(auctionClosedListener) {

    return {
        processMessage: function (topic, message) {
            if (message.command == 'Close') auctionClosedListener();
        }
    }
}