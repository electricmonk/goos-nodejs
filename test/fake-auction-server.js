import Redis from 'then-redis';
import Promise from 'promise';
import retry from 'qretry';

export default function FakeAuctionServer(_itemId) {
    const itemId = _itemId;
    const testClient = Redis.createClient();
    const auctionHouseClient = Redis.createClient();

    let topic;

    let subscriptionCount = 0;
    testClient.on('subscribe', function(channel, count) {
        if (channel === topic) subscriptionCount = count;
    });

    this.startSellingItem = function() {
        topic = `auction-${itemId}`;
        return auctionHouseClient.subscribe(topic);
    }

    this.announceClosed = function() {
        return auctionHouseClient.publish(topic, {});
    }

    this.hasReceivedJoinRequestFromSniper = function() {
        return retry(() => new Promise(function(resolve, reject) {
            if (subscriptionCount < 2)
                reject(new Error("Join request was not received"));
            else
                resolve();
        }));
    }

    this.stop = function() {
        return Promise.all([testClient.quit(), auctionHouseClient.quit()]);
    }
}
