import express from 'express';
import Redis from 'then-redis';
import {AuctionMessageTranslator} from './auction-message-translator'
import {AuctionSniper, SniperState} from './auction-sniper'
import Auction from './auction'

const debug = require('debug')('goos:Sniper');
let server;

let currentState = {
    status: SniperState.Joining,
    lastPrice: undefined,
    lastBid: undefined,
    itemId: undefined
};

function setState(status) {
    currentState.status = status;

    debug("currentState is", currentState);
}

const SniperListener = {
    sniperLost: function () {
        setState(SniperState.Lost);
    },

    sniperStateChanged: function (newState) {
        currentState = newState;
    },

    sniperWon: function () {
        setState(SniperState.Won);
    }
};

function main(itemId) {
    const Topic = `auction-${itemId}`;

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const sniperId = bidderFor(itemId);
    const auction = Auction(Topic, publisher, sniperId);
    const translator = AuctionMessageTranslator(sniperId, AuctionSniper(itemId, auction, SniperListener));

    auction.join();

    subscriber.subscribe(Topic);
    subscriber.on('message', (topic, jsonMessage) => {
        translator.processMessage(topic, JSON.parse(jsonMessage));
    });

    const app = express();

    app.get('/', function (req, res) {
        res.send(`<html><body>
        <table>
            <tr>
                <td class="itemId">${currentState.itemId}</td>
                <td class="status">${currentState.status}</td>
                <td class="lastBid">${currentState.lastBid}</td>
                <td class="lastPrice">${currentState.lastPrice}</td>
            </tr>
        </table>
        </body></html>`);
    });

    server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Auction Sniper listening at http://%s:%s', host, port);
    });
}

function bidderFor(itemId) {
    return `${itemId}@localhost`;
}

export default {
    main,
    bidderFor,
    SniperListener
}

