import Message from './message';

export default class Auction {
    constructor(chat, bidder) {
        this.chat = chat;
        this.bidder = bidder;
    }

    bid(bid) {
        this.chat.sendMessage(Message.Bid(this.bidder, bid));
    }

    join() {
        this.chat.sendMessage(Message.Join(this.bidder));
    }
}