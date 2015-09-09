import Redis from 'then-redis';
import Promise from 'promise';
import retry from 'qretry';

export default function FakeAuctionServer(_itemId) {
    const itemId = _itemId;
    const sniperClient = Redis.createClient();
    const auctionHouseClient = Redis.createClient();

    let topic;

    let subscriptionCount = 0;
    sniperClient.on('subscribe', function(channel, count) {
        if (channel === topic) subscriptionCount = count;
    });

    this.startSellingItem = function() {
        topic = `auction-${itemId}`;
        return sniperClient.subscribe(topic);
    }

    this.announceClosed = function() {
        return auctionHouseClient.publish(topic, {});
    }

    this.hasReceivedJoinRequestFromSniper = function() {
        return retry(() => new Promise(function(resolve, reject) {
            if (!subscriptionCount)
                reject(new Error("Join request was not received"));
            else
                resolve();
        }));
    }

    this.stop = function() {
        return Promise.all([sniperClient.quit(), auctionHouseClient.quit()]);
    }
}
