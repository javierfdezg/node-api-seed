/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";
var timeout = require('connect-timeout'),
  winston = require('winston'),
  path = require('path'),
  auth = require('../lib/security'),
  security = require('../middleware/security'),
  util = require('../lib/util');

/**
 * Dinamyc routing based on Accept-Version header
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @param  {[type]} router [description]
 * @return {[type]}        [description]
 */
module.exports = function (app, config, router) {

  // ------------------------- ROUTES -------------------------------------
  // Tasks
  router.get('/hello', timeout(2000), security.execAction('hello', 'get', auth.accessLevels.admin));
  // ----------------------------------------------------------------------

};