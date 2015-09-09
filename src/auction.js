import Message from './message';

export default function Auction(topic, publisher) {
    return {
        bid: function(bid) {
            sendMessage(Message.Bid(bid));
        },

        join: function() {
            sendMessage(Message.Join());
        }
    }

    function sendMessage(message) {
        publisher.publish(topic, JSON.stringify(message));
    }
}