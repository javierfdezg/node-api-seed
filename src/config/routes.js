/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";

var express = require('express'),
  winston = require('winston'),
  timeout = require('connect-timeout'),
  toobusy = require('toobusy-js'),
  responseTime = require('response-time'),
  cors = require('cors'),
  cookieParser = require('cookie-parser'),
  util = require('../lib/util'),
  auth = require('../lib/security'),
  security = require('../middleware/security'),
  bodyParser = require('body-parser'),
  I18n = require('i18n-2'),
  i18nm = require('../middleware/i18n'),
  configMiddleware = require('../middleware/config'),
  path = require('path');

module.exports = function (app, config) {

  var router = express.Router(); // get an instance of the express Router
  var authenticateRouter = express.Router(); // get an instance of the express Router
  var testRouter = express.Router(); // get another instance of the express Router for testing routes

  // Attach the i18n property to the express request object and attach helper methods for use in templates
  I18n.expressBind(app, {
    // setup some locales - other locales default to en silently
    locales: ['en', 'es', 'pt'],
    directory: path.normalize(__dirname + '/../locales'),
    extension: '.js',
    query: true
  });

  // -------- Controllers ------
  var test = require('../controllers/test'); // TEST API services
  var authController = require('../controllers/auth'); // AUTH API services
  // Require here your api controllers 

  // -------- Routes --------

  // Amazon elb health check. This always return 200 status code because we are not using this 
  // to manage the auto launching.
  router.get('/elb-ping', timeout(5000), function (req, res) {
    util.sendResponse(req, res, 200, {
      ok: true
    });
  });

  // Add X-Response-Time header (response time) in every response
  app.use(responseTime());

  // Body parser
  router.use(bodyParser.json());
  authenticateRouter.use(bodyParser.json());
  testRouter.use(bodyParser.json());

  // User user/password middleware to validate user
  authenticateRouter.use(security.authentication('Basic'));

  // Use bearer middleware to validate bearer token if present / API Key
  router.use(security.authorization(['Bearer', 'WNS']));
  testRouter.use(security.authorization(['Bearer', 'WNS']));

  // Config
  router.use(configMiddleware(config));
  authenticateRouter.use(configMiddleware(config));
  testRouter.use(configMiddleware(config));

  // I18N
  router.use(i18nm);
  authenticateRouter.use(i18nm);
  testRouter.use(i18nm);

  // ------------------------- TEST ONLY SERVICES -------------------------
  testRouter.get('/timeout', timeout(1000), test.testTimeout); // test timeout middleware
  testRouter.get('/exception', timeout(1000), test.testUnhandledException); // test UnhandledException
  testRouter.get('/memory-leak', timeout(10000000), test.testMemoryLeak); // test Memory leak
  testRouter.get('/out-of-memory', timeout(10000000), test.testOutOfMemory); // test Out of Memory
  testRouter.get('/long-time', timeout(1000000), test.testLongTime); // test long time loading resource
  testRouter.get('/mongo-connection', timeout(2000), test.testMongoConnection); // test mongo connection
  testRouter.get('/public', timeout(2000), security.execAction('test', 'testPublic', auth.accessLevels.public)); // test public resource
  testRouter.get('/protected', timeout(2000), security.execAction('test', 'testProtected', auth.accessLevels.admin)); // test protected resource
  testRouter.get('/protected-root', timeout(2000), security.execAction('test', 'testProtected', auth.accessLevels.root)); // test protected root resource
  testRouter.get('/protected-readonly', timeout(2000), security.execAction('test', 'testProtected', auth.accessLevels.readonly)); // test protected read-only resource
  testRouter.get('/protected-apikey', timeout(2000), security.execAction('test', 'testProtectedApiKey', auth.accessLevels.admin)); // test protected resource
  testRouter.post('/protected-apikey', timeout(2000), security.execAction('test', 'testProtectedApiKey', auth.accessLevels.admin)); // test protected resource
  testRouter.put('/protected-apikey', timeout(2000), security.execAction('test', 'testProtectedApiKey', auth.accessLevels.admin)); // test protected resource
  testRouter["delete"]('/protected-apikey', timeout(2000), security.execAction('test', 'testProtectedApiKey', auth.accessLevels.admin)); // test protected resource
  testRouter.post('/user', timeout(2000), test.testCreateUser); // test create user
  testRouter.post('/organization', timeout(2000), test.testCreateOrganization); // test create oganization
  // ----------------------------------------------------------------------

  // --------------------------- AUTH SERVICES ----------------------------
  authenticateRouter.get('/token', timeout(2000), authController.token);
  // ----------------------------------------------------------------------

  // --------------------------- USERS SERVICES ----------------------------
  router.get('/users/:id', timeout(2000), security.checkOwnerAndExecAction('users', 'get', auth.accessLevels.admin));
  router.post('/users', timeout(2000), security.execAction('users', 'post', auth.accessLevels.admin));
  router.put('/users/:id', timeout(2000), security.checkOwnerAndExecAction('users', 'put', auth.accessLevels.admin));
  router["delete"]('/users/:id', timeout(2000), security.checkOwnerAndExecAction('users', 'del', auth.accessLevels.admin));
  // ----------------------------------------------------------------------

  // --------------------------- API ROUTES -------------------------------
  require('./apiRoutes')(app, config, router);
  // ----------------------------------------------------------------------

  // Use this before each middleware
  app.use(haltOnTimedout);

  // Static content routing
  app.use(express.static(__dirname + '/../../web/' + (app.get("production") ? "production" : "development")));

  app.use(haltOnTimedout);

  // Enable cors requests
  app.use(cors());

  // Use this before each middleware
  app.use(haltOnTimedout);

  // Cookie parser
  app.use(cookieParser(config.cookiesSecret));

  // Use this before each middleware
  app.use(haltOnTimedout);

  // Set maximum lag and configure toobusy middleware
  toobusy.maxLag(config.maxLag);
  app.use(function (req, res, next) {
    // check if we're toobusy()
    if (toobusy()) {
      winston.warn('[API TOOBUSY ERROR] %s -- %s %s', req.ip, req.method, req.path);
      util.sendResponse(req, res, 503, {
        error: "Server too busy"
      });
    } else {
      next();
    }
  });

  app.use(haltOnTimedout);

  // Main router
  app.use('/auth', authenticateRouter);

  app.use(haltOnTimedout);

  // Main router
  app.use(/^(?!(\/test\/|\/auth\/))/, router);

  app.use(haltOnTimedout);

  // If not in production, configure test routes
  if (!app.get("production")) {
    // Main router
    app.use('/test', testRouter);
    app.use(haltOnTimedout);
  }

  // 404 routes
  app.use(function (req, res, next) {
    winston.verbose('[API 404 ERROR] %s -- %s %s', req.ip, req.method, req.path);
    util.sendResponse(req, res, 404, {
      error: "Not found"
    });
  });

  app.use(haltOnTimedout);

  // Error handling
  app.use(function (err, req, res, next) {
    // Timeout
    if (err && err.status == 503) {
      winston.warn("[API TIMEOUT ERROR] %s -- %s %s", req.ip, req.method, req.path);
      res.jsonp(503, {
        error: "Service unavailable"
      });
    }
    // Unexpected exception handling
    else if (err) {
      var errorDesc = (err.stack) ? err.stack : JSON.stringify(err, null, '\t');
      winston.error("[API 500 ERROR] %s -- %s %s \n %s", req.ip, req.method, req.path, errorDesc);
      util.sendResponse(req, res, 500, {
        error: "Unknow error"
      });
    } else {
      util.sendResponse(req, res, 500, {
        error: "Unknow error"
      });
    }
  });

};

// See : https://github.com/expressjs/timeout/issues/11
function haltOnTimedout(req, res, next) {
  if (!req.timedout) {
    next();
  }
}