/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server;

// MongoDB connection instance
var conn;

module.exports = function (app, config, cb) {

  // Allready have a connection, don't connect again
  if (conn) {
    cb && cb(null, conn);
  }
  // No connection established
  else {
    // try to connect to the database
    var db = new Db(config.name, new Server(config.host,
      config.port || Connection.DEFAULT_PORT, {
        auto_reconnect: true,
        poolSize: config.poolsize
      }), config.options);
    // Open connection
    db.open(function (error, databaseConnection) {
      if (error) {
        cb && cb(error);
      } else {
        conn = databaseConnection;
        cb && cb(null, databaseConnection);
      }
    });
  }

};