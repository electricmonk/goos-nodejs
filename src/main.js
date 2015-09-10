import express from 'express';
import Redis from 'then-redis';
import {AuctionMessageTranslator} from './auction-message-translator'
import {AuctionSniper} from './auction-sniper'
import Auction from './auction'

const debug = require('debug')('goos:Sniper');
const SniperStatus = {Joining: 'Joining', Lost: 'Lost', Bidding: 'Bidding', Winning: 'Winning', Won: 'Won'};
let server;

let status = SniperStatus.Joining;

const SniperListener = {
    sniperLost: function () {
        debug("Setting status to Lost");
        status = SniperStatus.Lost;
    },

    sniperBidding: function () {
        debug("Setting status to Bidding");
        status = SniperStatus.Bidding;
    },

    sniperWinning: function () {
        debug("Setting status to Winning");
        status = SniperStatus.Winning;
    },

    sniperWon: function () {
        debug("Setting status to Won");
        status = SniperStatus.Won;
    }
};

function main(itemId, started) {
    const Topic = `auction-${itemId}`;

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const sniperId = bidderFor(itemId);
    const auction = Auction(Topic, publisher, sniperId);
    const translator = AuctionMessageTranslator(sniperId, AuctionSniper(auction, SniperListener));

    auction.join();

    subscriber.subscribe(Topic);
    subscriber.on('message', (topic, jsonMessage) => {
        translator.processMessage(topic, JSON.parse(jsonMessage));
    });

    const app = express();

    app.get('/', function (req, res) {
        res.send(`<html><body><span id="sniper-status">${status}</span></body></html>`);
    });

    server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Auction Sniper listening at http://%s:%s', host, port);

        started();
    });
}

function stop() {
    return server.close();
}

function bidderFor(itemId) {
    return `${itemId}@localhost`;
}

export default {
    main,
    bidderFor,
    stop,
    SniperListener,
    SniperStatus
}

