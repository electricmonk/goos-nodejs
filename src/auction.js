import Message from './message';
import AuctionMessageTranslator from './auction-message-translator';

const debug = require('debug')('goos:Auction');

export default class Auction {
    constructor(publisher, subscriber, itemId, bidder) {
        const Topic = `auction-${itemId}`;

        this.bidder = bidder;
        this.chat = new Chat(publisher, subscriber, Topic);
        this.translator = new AuctionMessageTranslator(bidder);
        this.chat.addListener(this.translator);
    }

    bid(bid) {
        this.chat.sendMessage(Message.Bid(this.bidder, bid));
    }

    join() {
        this.chat.sendMessage(Message.Join(this.bidder));
    }

    addListener(listener) {
        this.translator.addListener(listener);
    }
}


class Chat {
    constructor(publisher, subscriber, topic) {
        this.publisher = publisher;
        this.topic = topic;
        this.listeners = [];

        subscriber.subscribe(topic);
        subscriber.on('message', (channel, jsonMessage) => {
            debug("Got message", jsonMessage, "in channel", channel);

            if (channel == topic) this.listeners.forEach(listener => listener.processMessage(JSON.parse(jsonMessage)));
        });
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    sendMessage(message) {
        this.publisher.publish(this.topic, JSON.stringify(message));
    }
}