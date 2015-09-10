import {PriceSource} from '../src/auction-sniper'
const debug = require('debug')('goos:AuctionMessageTranslator');

export default {
  AuctionMessageTranslator: function(sniperId, listener) {

      function isFromSniper(message) {
          return message.bidder === sniperId ? PriceSource.FromSniper : PriceSource.FromOtherBidder;
      }

      return {
          processMessage: function (topic, message) {
              debug("Got message", message, "in topic", topic);

              if (message.command === 'Close') {
                  listener.auctionClosed();

              } else if (message.command === 'Price') {
                  listener.currentPrice(message.currentPrice, message.increment, isFromSniper(message));
              }
          }
      }
  }
}