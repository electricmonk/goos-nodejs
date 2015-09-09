import express from 'express';
import Redis from 'then-redis';
var debug = require('debug')('goos:Sniper');

const SniperStatus = {Joining: 'Joining', Lost: 'Lost'};

function main(itemId) {
    const Topic = `auction-${itemId}`;

    const app = express();
    let status = SniperStatus.Joining;

    let subscriber = Redis.createClient();
    let publisher = Redis.createClient();

    debug("subscribing to auction", Topic);
    publisher.publish(Topic, "Join");

    subscriber.subscribe(Topic);
    subscriber.on('message', (channel, message) => {
        debug("received a message on channel", channel, message);
        if(channel === Topic && message in SniperStatus) status = message;
    })

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