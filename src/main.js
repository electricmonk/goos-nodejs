import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'then-redis';
import {AuctionSniper, SniperState, SniperSnapshot} from './auction-sniper';
import AuctionHouse from './auction-house';
import SnipersTableModel from './snipers-table-model';
import handlebars from 'express-handlebars';

const debug = require('debug')('goos:Sniper');
let server;

class SniperLauncher {
    constructor(sniperId) {
        this.snipers = new SnipersTableModel();
        this.auctionHouse = new AuctionHouse(sniperId);
    }

    joinAuction(itemId) {

        const auction = this.auctionHouse.anAuctionFor(itemId);
        const sniper = new AuctionSniper(itemId, auction);

        sniper.addListener(this.snipers);
        auction.addListener(sniper);
        this.snipers.addSniper(sniper);

        auction.join();
    }
}

function main() {

    const sniperLauncher = new SniperLauncher(process.argv[2]);

    const app = express();
    const urlencodedParser = bodyParser.urlencoded({extended: false});
    app.engine('.handlebars', handlebars());
    app.set('view engine', '.handlebars');
    app.set('views', __dirname + '/views');

    app.get('/', function (req, res) {
        res.render('main', {table: sniperLauncher.snipers.table()});
    });

    app.post('/', urlencodedParser, function (req, res) {
        const itemId = req.body["new-item-id"];
        sniperLauncher.joinAuction(itemId);

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

