import AuctionSniperDriver from './auction-sniper-driver';
import Main from '../src/main';

export default function ApplicationRunner() {
    let driver;

    this.startBiddingIn = function(auction) {
        Main.main(auction.itemId);
        driver = new AuctionSniperDriver(1000);
        return driver.showsSniperStatus(Main.SniperStatus.Joining);
    }

    this.showsSniperHasLostAuction = function () {
        return driver.showsSniperStatus(Main.SniperStatus.Lost);
    }

    this.hasShownSniperIsBidding = function () {
        return driver.showsSniperStatus(Main.SniperStatus.Bidding);
    }

    this.hasShownSniperIsWinning = function () {
        return driver.showsSniperStatus(Main.SniperStatus.Winning);
    }

    this.showsSniperHasWonAuction = function () {
        return driver.showsSniperStatus(Main.SniperStatus.Won);
    }

    this.stop = function () {
        driver && driver.stop();
        Main.stop();
    }

    this.bidderFor = function(itemId) {
        return Main.bidderFor(itemId);
    }
}
