import Redis from 'then-redis';
import Auction from './auction';

export default class AuctionHouse {

    constructor(sniperId) {
        this._sniperId = sniperId;
        this.subscriber = Redis.createClient();
        this.publisher = Redis.createClient();
    }

    anAuctionFor(itemId) {
        return new Auction(this.publisher, this.subscriber, itemId, this._sniperId);
    }

    stop() {
        this.subscriber.quit();
        this.publisher.quit();
    }
}
