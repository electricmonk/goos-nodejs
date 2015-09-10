import express from 'express';
import Redis from 'then-redis';
import {AuctionMessageTranslator} from './auction-message-translator'
import AuctionSniper from './auction-sniper'
import Auction from './auction'

const debug = require('debug')('goos:Sniper');
const SniperStatus = {Joining: 'Joining', Lost: 'Lost', Bidding: 'Bidding', Winning: 'Winning', Won: 'Won'};
let server;

function main(itemId) {
    const Topic = `auction-${itemId}`;

    let status = SniperStatus.Joining;

    const listener = {
        sniperLost: function() {
            debug("Setting status to Lost");
            status = SniperStatus.Lost;
        },

        sniperBidding: function() {
            debug("Setting status to Bidding");
            status = SniperStatus.Bidding;
        },

        sniperWinning: function() {
            debug("Setting status to Winning");
            status = SniperStatus.Winning;
        }
    };

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const sniperId = bidderFor(itemId);
    const auction = Auction(Topic, publisher, sniperId);
    const translator = AuctionMessageTranslator(sniperId, AuctionSniper(auction, listener));

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
    });
}

function stop() {
    server.close();
}

function bidderFor(itemId) {
    return `${itemId}@localhost`;
}

export default {
    main,
    bidderFor,
    stop,
    SniperStatus
}

