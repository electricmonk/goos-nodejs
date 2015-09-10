import Message from './message';

export default function Auction(topic, publisher, bidder) {
    return {
        bid: function(bid) {
            sendMessage(Message.Bid(bidder, bid));
        },

        join: function() {
            sendMessage(Message.Join(bidder));
        }
    }

    function sendMessage(message) {
        publisher.publish(topic, JSON.stringify(message));
    }
}