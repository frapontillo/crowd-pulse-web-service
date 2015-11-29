#!/usr/bin/env node

'use strict';

require('../lib/app')()
  .then(function(ws) {
    process.on('SIGINT', function() {
      console.log('Shutting down...');
      ws.crowdPulse.disconnect();
      ws.server.close();
      console.log('See you in another life, brotha.');
    });
  });
