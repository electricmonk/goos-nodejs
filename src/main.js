import express from 'express';
import Redis from 'then-redis';
import {AuctionMessageTranslator} from './auction-message-translator';
import {AuctionSniper, SniperState, SniperSnapshot} from './auction-sniper';
import Auction from './auction';
import SnipersTableModel from './snipers-table-model';

const debug = require('debug')('goos:Sniper');
let server;

function main(args) {
    const sniperId = process.argv[2];
    const itemId = process.argv[3];
    const Topic = `auction-${itemId}`;

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const auction = Auction(Topic, publisher, sniperId);
    const snipers = new SnipersTableModel();
    const translator = AuctionMessageTranslator(sniperId, AuctionSniper(itemId, auction, snipers));

    debug(sniperId, "is joining auction for", itemId);
    auction.join();

    subscriber.subscribe(Topic);
    subscriber.on('message', (topic, jsonMessage) => {
        translator.processMessage(topic, JSON.parse(jsonMessage));
    });

    const app = express();

    app.get('/', function (req, res) {
        const table = snipers.render();

        debug("rendered table", table);

        res.send(`<html><body>${table}</body></html>`);
    });

    server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Auction Sniper listening at http://%s:%s', host, port);
    });
}

export default {
    main,
}

