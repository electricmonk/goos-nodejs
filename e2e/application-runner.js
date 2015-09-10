import AuctionSniperDriver from './auction-sniper-driver';
import Main from '../src/main';
import Promise from 'bluebird';

export default function ApplicationRunner() {
    let driver;

    this.startBiddingIn = function(auction) {
        driver = new AuctionSniperDriver(1000);
        const main = Promise.promisify(Main.main);
        main(auction.itemId)
            .then(() => driver.showsSniperStatus(Main.SniperStatus.Joining));
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
        return Promise.all([driver.stop(), Main.stop()]);
    }

    this.bidderFor = function(itemId) {
        return Main.bidderFor(itemId);
    }
}
