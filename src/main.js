import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'then-redis';
import AuctionMessageTranslator from './auction-message-translator';
import {AuctionSniper, SniperState, SniperSnapshot} from './auction-sniper';
import Auction from './auction';
import SnipersTableModel from './snipers-table-model';
import handlebars from 'express-handlebars';

const debug = require('debug')('goos:Sniper');
let server;

class Chat {
    constructor(publisher, subscriber, topic) {
        this.publisher = publisher;
        this.topic = topic;
        this.listeners = [];

        subscriber.subscribe(topic);
        subscriber.on('message', (channel, jsonMessage) => {
            debug("Got message", jsonMessage, "in channel", channel);

            if (channel == topic) this.listeners.forEach(listener => listener.processMessage(JSON.parse(jsonMessage)));
        });
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    sendMessage(message) {
        this.publisher.publish(this.topic, JSON.stringify(message));
    }
}

function main() {
    const sniperId = process.argv[2];

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const snipers = new SnipersTableModel();

    function joinAuction(itemId) {
        snipers.addSniper(SniperSnapshot.joining(itemId));

        const Topic = `auction-${itemId}`;

        const chat = new Chat(publisher, subscriber, Topic);

        const auction = new Auction(chat, sniperId);
        const auctionSniper = AuctionSniper(itemId, auction, snipers);
        debug(sniperId, "is joining auction for", itemId);
        auction.join();

        const translator = new AuctionMessageTranslator(sniperId, auctionSniper);
        chat.addListener(translator);
    }

    const app = express();
    const urlencodedParser = bodyParser.urlencoded({extended: false})
    app.engine('.handlebars', handlebars());
    app.set('view engine', '.handlebars');
    app.set('views', __dirname + '/views');

    app.get('/', function (req, res) {
        res.render('main', {table: snipers.table()});
    });

    app.post('/', urlencodedParser, function (req, res) {
        const itemId = req.body["new-item-id"];
        joinAuction(itemId);

        res.redirect("/");
    })

    server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Auction Sniper listening at http://%s:%s', host, port);
    });
}

export default {
    main,
}

