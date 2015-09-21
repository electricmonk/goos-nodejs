import AuctionSniperDriver from './auction-sniper-driver';
import Main from '../../src/main';
import {SniperState} from '../../src/auction-sniper';
import Promise from 'bluebird';
import childProcess from 'child_process';
var debug = require('debug')('goos:ApplicationRunner');

export default function ApplicationRunner() {
    let driver;

    this.SniperId = "sniper@localhost";

    this.startSniper = function() {
        this.process = childProcess.fork('./dist/src/index.js', [this.SniperId]);
    }

    this.startBiddingIn = function(...auctions) {
        const items = auctions.map(a => a.itemId);

        driver = AuctionSniperDriver();
        this.startSniper();

        return Promise.all(items.map(item =>
            driver.startBiddingFor(item)
                .then(() => driver.showsSniperStatus(SniperState.Joining, item))
        ));
    }

    this.showsSniperHasLostAuction = function (auction) {
        return driver.showsSniperStatus(SniperState.Lost, auction.itemId);
    }

    this.hasShownSniperIsBidding = function (auction, lastPrice, lastBid) {
        return driver.showsSniperStatus(SniperState.Bidding, auction.itemId, lastPrice, lastBid);
    }

    this.hasShownSniperIsWinning = function (auction, winningBid) {
        return driver.showsSniperStatus(SniperState.Winning, auction.itemId, winningBid, winningBid);
    }

    this.showsSniperHasWonAuction = function (auction, lastPrice) {
        return driver.showsSniperStatus(SniperState.Won, auction.itemId, lastPrice, lastPrice);
    }

    this.stop = function () {
        this.process.kill("SIGHUP");
        return driver.stop();
    }
}
