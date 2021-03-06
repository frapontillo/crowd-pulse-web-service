/*
 * Copyright 2015 Francesco Pontillo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require('path');

var http = require('http');
var socket = require('socket.io');
var express = require('express');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
var bodyParser = require('body-parser');

var CrowdPulse = require('crowd-pulse-data');

var bootstrapMeMaybe = require('./../bootstrap/bootstrap');
var oAuthSetup = require('./../oauth2/setup');

var endpointProjects = require('./../endpoint/projects');
var endpointDatabases = require('./../endpoint/databases');
var endpointTerms = require('./../endpoint/terms');
var endpointStats = require('./../endpoint/stats');
var endpointProfiles = require('./../endpoint/profiles');
var endpointLanguages = require('./../endpoint/languages');
var socketLogs = require('./../sockets/logs');

var config = require('./config');

// the main server
var server = undefined;
// the express application
var app = {};
// the websocket server
var io = undefined;

var crowdPulse = new CrowdPulse();

var connect = function() {
  return crowdPulse.connect(config.database.url, config.database.db);
};

var webServiceSetup = function(crowdPulse) {
  // create the application and bind it to a server
  app = express();
  server = http.createServer(app);

  // setup middlewares
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(logger('dev'));
  // app.use(session(config.session));
  app.use(cors());

  // TODO: add more endpoints here
  var API = '/api';
  app.use(API, endpointProjects(crowdPulse));
  app.use(API, endpointDatabases(crowdPulse));
  app.use(API, endpointTerms(crowdPulse));
  app.use(API, endpointStats(crowdPulse));
  app.use(API, endpointProfiles(crowdPulse));
  app.use(API, endpointLanguages(crowdPulse));

  return crowdPulse;
};

var webSocketSetup = function() {
  io = socket(server);
  socketLogs(io, crowdPulse)
};

module.exports = function() {
  return connect()
    .then(function() {
      return bootstrapMeMaybe(crowdPulse, config);
    })
    .then(function() {
      return webServiceSetup(crowdPulse);
    })
    .then(function() {
      return webSocketSetup(crowdPulse);
    })
    .then(function() {
      return oAuthSetup(crowdPulse, app);
    })
    .then(function() {
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'ejs');
      app.use(express.static(path.join(__dirname, 'public')));

      app.get('/', app.oAuth.authorise(), function(req, res) {
        res.send('Secret area');
      });

      app.set('port', config.port || process.env.PORT || 5000);

      server.listen(app.get('port'), function() {
        console.log('Crowd Pulse Web Service listening at %s:%s...',
          server.address().address, server.address().port);
        console.log('Press CTRL+C to quit.');
      });

      return {
        app: app,
        io: io,
        server: server,
        crowdPulse: crowdPulse
      };
    })
    .catch(function(err) {
      console.error(err.stack);
    });
};