import Redis from 'then-redis';
import Promise from 'promise';
import retry from 'qretry';
import {SniperStatus} from '../src/main';
var debug = require('debug')('goos:FakeAuctionServer');

export default function FakeAuctionServer(_itemId) {
    this.itemId = _itemId;

    const subscriber = Redis.createClient();
    const publisher = Redis.createClient();

    let topic;

    let messageCount = 0;
    subscriber.on('message', (channel, message) => {
        debug("received a message on channel", channel, message);
        if (channel === topic) messageCount++;
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
        return retry(() => new Promise(function(resolve, reject) {
            if (!messageCount)
                reject(new Error("Join request was not received"));
            else
                resolve();
        }));
    }

    this.stop = function() {
        return Promise.all([subscriber.quit(), publisher.quit()]);
    }
}
