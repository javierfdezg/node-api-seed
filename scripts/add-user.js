/*
 * Copyright (c) Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";

var app = {},
  winston = require('winston'),
  config = require('../src/config/params'),
  security = require('../src/lib/security'),
  commandLineArgs = require("command-line-args");

var cli = commandLineArgs([{
  name: "createUser",
  alias: "c",
  type: String,
  defaultValue: "yes"
}, {
  name: "fullName",
  alias: "n",
  type: String
}, {
  name: "email",
  alias: "e",
  type: String
}, {
  name: "password",
  alias: "p",
  type: String
}]);

var user = cli.parse();

if (user.createUser === 'yes') {
  delete user.createUser;
  user.role = security.userRoles.admin;
  require('../src/lib/data')(app, config.data, function (err, data) {
    var Users = require('../src/lib/data').Users;
    // No data connection available
    if (err) {
      winston.error(err.toString());
    } else {
      winston.info("Mongo connection established");
      Users.create(user, function (err) {
        if (err) {
          winston.error(err);
          process.exit(1);
        } else {
          winston.info("User successfully created");
          process.exit(0);
        }
      });
    }
  });
}

// process event handlers
process.on('uncaughtException', function (err) {
  // handle the error safely
  winston.error('Uncaught Exception. Stack trace:\n%s', err.stack);
  process.exit(1);
});