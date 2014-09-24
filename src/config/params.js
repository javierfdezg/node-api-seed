/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var path = require('path');

module.exports = exports = {
  appName: 'seed-node-api',
  clusterMode: true,
  activessl: true,
  appDir: path.normalize(__dirname + '/../../'),
  httpp: 4000, // http port
  httpsp: 4001, // https port
  sockettimeout: 20000, // idle socket timeout
  maxLag: 200, // Too Busy max lag (ms)
  cookiesSecret: "-Scrt_123.::;109",
  logging: {
    directory: path.normalize(__dirname + '/../../' + '/log/'),
    console: {
      level: 'debug',
      silent: false,
      colorize: true,
      timestamp: true
    },
    file: {
      filename: path.normalize(__dirname + '/../../' + '/log/') + 'retarget.log',
      level: 'warn',
      json: false,
      colorize: false,
      timestamp: true,
      maxsize: 1024 * 1024 * 5 // Log rotation 5MB
    }
  },
  api: {
    timeout: 2000
  },
  ssl: {
    serverkeypath: __dirname + '/../../ssl/server.key',
    servercrtpath: __dirname + '/../../ssl/server.crt',
    servercapath: __dirname + '/../../ssl/ca.crt'
  }
};