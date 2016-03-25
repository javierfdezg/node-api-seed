/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";
var timeout = require('connect-timeout'),
  auth = require('../lib/security'),
  security = require('../middleware/security');

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