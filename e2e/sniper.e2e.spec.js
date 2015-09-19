require('source-map-support').install();

import ApplicationRunner from './application-runner';
import FakeAuctionServer from './fake-auction-server';

describe("the auction sniper", () => {
    let application;
    let auction, auction2;

    beforeEach("start the application", () => {
        application = new ApplicationRunner();
    });

    beforeEach("start the auction server(s)", () => {
        auction = new FakeAuctionServer("item-54321")
        auction2 = new FakeAuctionServer("item-65432")
    });

    afterEach("stop the auction server", () => auction.stop());
    afterEach("stop the application", () => application.stop());

    it("joins an auction until auction closes", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFrom(application.SniperId))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());

    });

    it("makes a higher bid but loses", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFrom(application.SniperId))

            .then(() => auction.reportPrice(1000, 98, "other bidder"))
            .then(() => application.hasShownSniperIsBidding(auction, 1000, 1098))

            .then(() => auction.hasReceivedBid(1098, application.SniperId))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());
    });

    it("wins an auction by bidding higher", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFrom(application.SniperId))

            .then(() => auction.reportPrice(1000, 98, "other bidder"))
            .then(() => application.hasShownSniperIsBidding(auction, 1000, 1098))

            .then(() => auction.hasReceivedBid(1098, application.SniperId))

            .then(() => auction.reportPrice(1098, 97, application.SniperId))
            .then(() => application.hasShownSniperIsWinning(1098))

            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasWonAuction(1098));
    });
    //
    //it("bids for multiple items", () => {
    //    return auction.startSellingItem()
    //        .then(() => auction2.startSellingItem())
    //
    //        .then(() => application.startBiddingIn(auction, auction2))
    //        .then(() => auction.hasReceivedJoinRequestFrom(application.SniperId))
    //
    //        .then(() => auction.reportPrice(1000, 98, "other bidder"))
    //        .then(() => application.hasShownSniperIsBidding(auction, 1000, 1098))
    //
    //        .then(() => auction.hasReceivedBid(1098, application.SniperId))
    //
    //        .then(() => auction.reportPrice(1098, 97, application.SniperId))
    //        .then(() => application.hasShownSniperIsWinning(1098))
    //
    //        .then(() => auction.announceClosed())
    //        .then(() => application.showsSniperHasWonAuction(1098));
    //});
});
