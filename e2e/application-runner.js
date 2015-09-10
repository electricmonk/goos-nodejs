import AuctionSniperDriver from './auction-sniper-driver';
import Main from '../src/main';
import Promise from 'bluebird';
import childProcess from 'child_process';
var debug = require('debug')('goos:ApplicationRunner');

export default function ApplicationRunner() {
    let driver;
    let process;

    this.startBiddingIn = function(auction) {
        driver = AuctionSniperDriver();

        process = childProcess.fork('./dist/src/index.js', [auction.itemId]);

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
        process.kill("SIGHUP");
        return driver.stop();
    }

    this.bidderFor = function(itemId) {
        return Main.bidderFor(itemId);
    }
}
