/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var express = require('express');
var winston = require('winston');
var timeout = require('connect-timeout');
var toobusy = require('toobusy');
var responseTime = require('response-time');
var cors = require('cors');
var cookieParser = require('cookie-parser');

module.exports = function (app, config) {

  var router = express.Router(); // get an instance of the express Router
  var testRouter = express.Router(); // get another instance of the express Router for testing routes

  // -------- Controllers ------
  var test = require('../controllers/test'); // TEST API services
  // Require here your api controllers 

  // -------- Routes --------

  // Amazon elb health check. This always return 200 status code because we are not using this 
  // to manage the auto launching.
  router.get('/elb-ping', timeout(5000), function (req, res) {
    res.json({
      ok: true
    });
  });

  // ------------------------- TEST ONLY SERVICES -------------------------
  testRouter.get('/timeout', timeout(1000), test.testTimeout); // test timeout middleware
  testRouter.get('/exception', timeout(1000), test.testUnhandledException); // test UnhandledException
  testRouter.get('/memory-leak', timeout(10000000), test.testMemoryLeak); // test Memory leak
  testRouter.get('/out-of-memory', timeout(10000000), test.testOutOfMemory); // test Out of Memory
  testRouter.get('/long-time', timeout(1000000), test.testLongTime); // test long time loading resource
  testRouter.get('/js-long-long-time', timeout(1000000), test.testJsLongLongTime); // test long time loading resource
  // ----------------------------------------------------------------------

  // Define here your api routes

  // Add X-Response-Time header (response time) in every response
  app.use(responseTime());

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

  // Use this router for any request from root path
  app.use(function (req, res, next) {
    // check if we're toobusy()
    if (toobusy()) {
      winston.warn('[API TOOBUSY ERROR] %s -- %s %s', req.ip, req.method, req.path);
      res.jsonp(503, {
        error: "Server too busy"
      });
    } else {
      next();
    }
  });

  app.use(haltOnTimedout);

  // Main router
  app.use('/', router);

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
    res.jsonp(404, {
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
      res.jsonp(500, {
        error: "Unknow error"
      });
    } else {
      res.jsonp(500, {
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
};