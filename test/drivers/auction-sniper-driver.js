import webdriverio from 'webdriverio';
import retry from 'qretry';
import {Assertion, expect} from 'chai';
import Promise from 'bluebird';
var debug = require('debug')('goos:AuctionSniperDriver');

const options = { desiredCapabilities: { browserName: 'phantomjs'} };

export default function() {

    return {
        startBiddingFor(itemId) {
            const client = webdriverio.remote(options).init();

            return client.url("http://localhost:3000/")
                .setValue('#new-item-id', itemId)
                .click('#join-button')
                .call(() => client.end());
        },

        showsSniperStatus: function(statusText, itemId, lastPrice, lastBid) {
            function assertElement(description, selector, expected) {
                if (expected) {
                    return client.getText(selector)
                        .catch(e => { throw new Error(`failed locating element matching selector [${selector}]; ${e}`)})
                        .then(text => expect(text).to.equal(expected.toString(), description))

                } else {
                    return Promise.resolve();
                }
            }

            const rowId = "auction-" + itemId;

            const client = webdriverio.remote(options).init();
            return client.url("http://localhost:3000/")
                .then(() => assertElement("Item Status", `#${rowId} td.status`, statusText))
                .then(() => assertElement("Item Id", `#${rowId} td.itemId`, itemId))
                .then(() => assertElement("Last Price", `#${rowId} td.lastPrice`, lastPrice))
                .then(() => assertElement("Last Bid", `#${rowId} td.lastBid`, lastBid))
                .call(() => client.end())
            ;
        },

        stop: function() {
            return Promise.resolve();
        }

    }
}
