import Redis from 'then-redis';
import Promise from 'bluebird';
import retry from 'qretry';
import {SniperStatus} from '../src/main';
import {expect} from 'chai';
var debug = require('debug')('goos:FakeAuctionServer');

export default function FakeAuctionServer(_itemId) {
    this.itemId = _itemId;

    const subscriber = Redis.createClient();
    const publisher = Redis.createClient();

    let topic;

    var messages = [];
    subscriber.on('message', (channel, message) => {
        debug("received a message on channel", channel, message);
        if (channel === topic) messages.push(message);
        debug("messages: ", messages);
    });

    this.startSellingItem = function() {
        topic = `auction-${this.itemId}`;
        debug("subscribing to topic", topic);
        return subscriber.subscribe(topic);
    }

    this.announceClosed = function() {
        return publisher.publish(topic, SniperStatus.Lost);
    }

    this.hasReceivedJoinRequestFromSniper = function() {
        popAMessage().then(message => {
            debug("hasReceivedJoinRequestFromSniper: Popped a message: ", message);

            expect(message).to.equal("Join");
        });
    }

    this.stop = function() {
        return Promise.all([subscriber.quit(), publisher.quit()]);
    }

    function popAMessage() {
        return retry(() => new Promise((resolve, reject) => {
            if (!messages.length) reject(new Error("No messages received"));

            return resolve(messages.pop());
        }));
    }
}
