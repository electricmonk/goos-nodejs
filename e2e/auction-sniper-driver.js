import webdriverio from 'webdriverio';
import retry from 'qretry';
import {expect} from 'chai';
import Promise from 'bluebird';

export default function AuctionSniperDriver() {

    const options = { desiredCapabilities: { browserName: 'phantomjs'} };

    this.showsSniperStatus = function (statusText) {
        const client = webdriverio.remote(options).init();
        return client.url("http://localhost:3000/")
            .getText('#sniper-status')
            .then(text => expect(text).to.equal(statusText, "Sniper Status"))
            .finally(() => client.end())
        ;
    }

    this.stop = function() {
        //return client.end();
        return Promise.resolve();
    }

}