require('source-map-support').install();

import ApplicationRunner from './application-runner';
import FakeAuctionServer from './fake-auction-server';

describe("the auction sniper", () => {
    const ItemId = "item-54321";
    let application;
    let auction;
    let sniper;

    beforeEach("start the application", () => {
        application = new ApplicationRunner();
        sniper = application.bidderFor(ItemId);
    });
    beforeEach("start the auction server", () => auction = new FakeAuctionServer(ItemId));

    afterEach("stop the auction server", () => auction.stop());
    afterEach("stop the application", () => application.stop());

    it("joins an auction until auction closes", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFrom(sniper))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());

    });

    it("makes a higher bid but loses", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFrom(sniper))

            .then(() => auction.reportPrice(1000, 98, "other bidder"))
            .then(() => application.hasShownSniperIsBidding())

            .then(() => auction.hasReceivedBid(1098, sniper))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());
    });
});
