require('source-map-support').install();

import Main from '../src/main';
import FakeAuctionServer from './fake-auction-server';
import AuctionSniperDriver from './auction-sniper-driver';

describe("the auction sniper", () => {
    var application = new ApplicationRunner();
    var auction = new FakeAuctionServer("item-54321");

    after("stop the auction server", () => auction.stop());
    after("stop the application", () => application.stop());

    it("joins an auction until auction closes", () => {
        return auction.startSellingItem()
            .then(() => application.startBiddingIn(auction))
            .then(() => auction.hasReceivedJoinRequestFromSniper())
            .then(() => auction.announceClosed())
            .then(() => application.showsSniperHasLostAuction());
    });
});

function ApplicationRunner() {
    let driver;

    this.startBiddingIn = function (auction) {
        Main.main(auction.itemId);
        driver = new AuctionSniperDriver(1000);
        return driver.showsSniperStatus(Main.SniperStatus.Joining);
    }

    this.showsSniperHasLostAuction = function () {
        return driver.showsSniperStatus(Main.SniperStatus.Lost);
    }

    this.stop = function () {
        driver && driver.stop();
    }
}
