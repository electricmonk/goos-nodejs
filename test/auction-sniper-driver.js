import webdriverio from 'webdriverio';
import retry from 'qretry';

export default function AuctionSniperDriver(timeoutInMillis) {

    const options = { desiredCapabilities: { browserName: 'phantomjs' } };
    let client = webdriverio.remote(options);

    this.showsSniperStatus = function (statusText) {
        client = client.url("http://localhost:9000/");

        return retry(() => client.getText('#sniper-status')
            .then(text => expect(text).to.equal(statusText)));
    }

    this.stop = function() {
        return client.end();
    }

}