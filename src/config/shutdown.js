/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";
var winston = require('winston'),
  toobusy = require('toobusy-js');

module.exports = function (app, config) {

  // Capture nodemon restart (SIGUSR2) of the app to make a graceful shutdown
  // This listener must be executed once to prevent infinite loops :)
  process.once('SIGUSR2', function () {
    shutdown('SIGUSR2');
  });

  // Capture Ctrl+C signal to make a graceful shutdown
  process.on('SIGINT', function () {
    shutdown('SIGINT');
  });

  // Capture SIGHUP signal to make a graceful shutdown
  process.on('SIGHUP', function () {
    shutdown('SIGHUP');
  });

  // Capture SIGQUIT signal to make a graceful shutdown
  process.on('SIGQUIT', function () {
    shutdown('SIGQUIT');
  });

  // Capture SIGABRT signal to make a graceful shutdown
  process.on('SIGABRT', function () {
    shutdown('SIGABRT');
  });

  // Capture SIGTERM signal to make a graceful shutdown
  process.on('SIGTERM', function () {
    shutdown('SIGTERM');
  });
};

/**
 * Perform a graceful shutdown
 * @param  {[string]}   signal   Signal name
 * @return {[void]}
 */
var shutdown = function (signal) {

  // Use try/catch in order to close/free/terminate resources.
  // It is not safe not capture an exception during shutdown because
  // we need to reach the process.kill invocation

  winston.warn('Received %s Signal. Graceful shutdown', signal);

  // free resources
  try {
    toobusy.shutdown();
  } catch (e) {
    winston.error("Error closing data wrapper: %s", e.toString());
  }

  // Signal treatment
  // SIGUSR2 is received from nodemon only
  if (signal == 'SIGUSR2') {
    winston.warn('Restarting due to nodemon watch');
    process.kill(process.pid, 'SIGUSR2');
  }
  // We should receive only SIGINT/SIGTERM signals apart from SIGUSR2
  else {
    winston.warn('shutdown complete');
    process.exit();
  }

};