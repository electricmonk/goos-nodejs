import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'then-redis';
import {AuctionSniper, SniperState, SniperSnapshot} from './auction-sniper';
import AuctionHouse from './auction-house';
import SnipersTableModel from './snipers-table-model';
import handlebars from 'express-handlebars';

const debug = require('debug')('goos:Sniper');
let server;

function main() {

    const snipers = new SnipersTableModel();
    const auctionHouse = new AuctionHouse(process.argv[2]);

    function joinAuction(itemId) {
        snipers.addSniper(SniperSnapshot.joining(itemId));

        const auction = auctionHouse.anAuctionFor(itemId);

        const auctionSniper = new AuctionSniper(itemId, auction);
        auctionSniper.addListener(snipers);

        auction.addListener(auctionSniper);
        auction.join();
    }

    const app = express();
    const urlencodedParser = bodyParser.urlencoded({extended: false});
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

