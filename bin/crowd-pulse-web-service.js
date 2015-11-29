#!/usr/bin/env node

'use strict';

var ws = require('../lib/app');

process.on('SIGINT', function() {
  console.log('Shutting down...');
  ws.crowdPulse.disconnect();
  console.log('See you in another life, brotha.');
});

ws.run();
