import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'then-redis';
import {AuctionSniper, SniperState, SniperSnapshot} from './auction-sniper';
import Auction from './auction';
import SnipersTableModel from './snipers-table-model';
import handlebars from 'express-handlebars';

const debug = require('debug')('goos:Sniper');
let server;

function main() {
    const sniperId = process.argv[2];

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    const snipers = new SnipersTableModel();

    function joinAuction(itemId) {
        snipers.addSniper(SniperSnapshot.joining(itemId));

        const auction = new Auction(publisher, subscriber, itemId, sniperId);
        const auctionSniper = AuctionSniper(itemId, auction, snipers);

        auction.addListener(auctionSniper);

        debug(sniperId, "is joining auction for", itemId);
        auction.join();
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

