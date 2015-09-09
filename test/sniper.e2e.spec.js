require('source-map-support').install();

import ApplicationRunner from './application-runner';
import FakeAuctionServer from './fake-auction-server';

describe("the auction sniper", () => {
    var application = new ApplicationRunner();
    var auction = new FakeAuctionServer("item-54321");

    after("stop the auction server", () => auction.stop());
    after("stop the application", () => application.stop());

    it("joins an auction until auction closes", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFromSniper())

            //.then(() => auction.reportPrice(1000, 98, "other bidder"))
            .then(() => application.hasShownSniperIsBidding())

            .then(() => auction.hasReceivedBid(1098))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());
    });
});
