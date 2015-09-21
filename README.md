# goos-nodejs
A Node.js implementation of the [Growing Object-Oriented Software, Guided By Tests](http://growing-object-oriented-software.com) project

## Overview
This project can be seen as a re-interpretation of the GOOS Auction Sniper in Node.js using [EcmaScript 2015](http://www.ecma-international.org/ecma-262/6.0/). Some design alterations have been made to better fit this project to the JavaScript way of thinking or the ecosystem:
* The UI is HTML and served over HTTP using an [express](http://expressjs.com) app.
* XMPP was abandoned, in favor of [Redis](http://redis.io/) as a message broker, to reduce complexity and use a tool more familiar to JS developer.

As of September 2015, I have finished the project up to and including chapter 17 of GOOS.

## Running
1) Install dependencies:
```sh
$ npm install
$ npm install -g gulp
```

2) Start a local redis server using default configuration:
```sh
$ redis-server &
```

3) Run the test suite:
```sh
$ gulp e2e
```

## A voyage through time
The commit history tries to follow the book chronologically. In some places I violated the [YAGNI](http://martinfowler.com/bliki/Yagni.html) principle and the commit log reflects this.
