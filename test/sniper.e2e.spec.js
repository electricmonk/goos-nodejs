import Main from '../src/main';
import FakeAuctionServer from './fake-auction-server';
import AuctionSniperDriver from './auction-sniper-driver';

const SniperStatus = {Joining: 'Joining', Lost: 'Lost'};

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
    const SNIPER_ID = "sniper";
    const SNIPER_PASSWORD = "sniper";

    let driver;

    this.startBiddingIn = function (auction) {
        Main(SNIPER_ID, SNIPER_PASSWORD, auction.itemId);
        driver = new AuctionSniperDriver(1000);
        driver.showsSniperStatus(SniperStatus.Joining);
    }

    this.showsSniperHasLostAuction = function () {
        return driver.showsSniperStatus(SniperStatus.Lost);
    }

    this.stop = function () {
        driver && driver.stop();
    }
}
