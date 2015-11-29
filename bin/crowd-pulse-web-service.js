#!/usr/bin/env node

'use strict';

var ws = require('../lib/app');

var gracefulExit = function() {
  console.log('Shutting down...');
  ws.crowdPulse.disconnect();
  console.log('See you in another life, brotha.');
};

process.on('SIGTERM', gracefulExit);

ws.run();
