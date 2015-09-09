import express from 'express';
import Redis from 'then-redis';
import AuctionMessageTranslator from './auction-message-translator'
import Message from './message';

var debug = require('debug')('goos:Sniper');

const SniperStatus = {Joining: 'Joining', Lost: 'Lost', Bidding: 'Bidding'};

function main(itemId) {
    const Topic = `auction-${itemId}`;

    const app = express();
    let status = SniperStatus.Joining;
    function auctionClosed() {
        status = SniperStatus.Lost;
    }

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    debug("subscribing to auction", Topic);
    publisher.publish(Topic, JSON.stringify(Message.Join()));

    const translator = AuctionMessageTranslator(this);
    subscriber.subscribe(Topic);
    subscriber.on('message', translator.processMessage);

    app.get('/', function (req, res) {
      res.send(`<html><body><span id="sniper-status">${status}</span></body></html>`);
    });

    var server = app.listen(3000, function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Auction Sniper listening at http://%s:%s', host, port);
    });
}

export default {
    main,
    SniperStatus
}

