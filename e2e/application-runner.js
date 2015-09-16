import AuctionSniperDriver from './auction-sniper-driver';
import Main from '../src/main';
import {SniperState} from '../src/auction-sniper';
import Promise from 'bluebird';
import childProcess from 'child_process';
var debug = require('debug')('goos:ApplicationRunner');

export default function ApplicationRunner() {
    let driver;
    let process;
    let itemId;

    this.startBiddingIn = function(auction) {
        itemId = auction.itemId;

        driver = AuctionSniperDriver();
        process = childProcess.fork('./dist/src/index.js', [itemId]);

        return driver.showsSniperStatus(SniperState.Joining);
    }

    this.showsSniperHasLostAuction = function () {
        return driver.showsSniperStatus(SniperState.Lost);
    }

    this.hasShownSniperIsBidding = function (lastPrice, lastBid) {
        return driver.showsSniperStatus(SniperState.Bidding, itemId, lastPrice, lastBid);
    }

    this.hasShownSniperIsWinning = function (winningBid) {
        return driver.showsSniperStatus(SniperState.Winning, itemId, winningBid, winningBid);
    }

    this.showsSniperHasWonAuction = function (lastPrice) {
        return driver.showsSniperStatus(SniperState.Won, itemId, lastPrice, lastPrice);
    }

    this.stop = function () {
        process.kill("SIGHUP");
        return driver.stop();
    }

    this.bidderFor = function(itemId) {
        return Main.bidderFor(itemId);
    }
}
