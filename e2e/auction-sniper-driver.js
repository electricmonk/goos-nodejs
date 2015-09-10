import webdriverio from 'webdriverio';
import retry from 'qretry';
import {expect} from 'chai';
import Promise from 'bluebird';
var debug = require('debug')('goos:AuctionSniperDriver');

const options = { desiredCapabilities: { browserName: 'phantomjs'} };

export default function() {
    return {
        showsSniperStatus: function(statusText) {
            const client = webdriverio.remote(options).init();
            return client.url("http://localhost:3000/")
                .getText('table tr td.sniper-status')
                .then(text => expect(text).to.equal(statusText, "Sniper Status"))
                .call(() => client.end())
            ;
        },

        stop: function() {
            return Promise.resolve();
        }

    }
}
