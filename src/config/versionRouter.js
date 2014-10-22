/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";
var timeout = require('connect-timeout'),
  winston = require('winston'),
  path = require('path'),
  util = require('../lib/util');

// define all the available api versions and its controllers
exports.VERSIONS = {
  'v1': {
    info: require('../controllers/v1/info')
  },
  'v2': {
    info: require('../controllers/v2/info')
  }
};

/**
 * Dinamyc routing based on Accept-Version header
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @param  {[type]} router [description]
 * @return {[type]}        [description]
 */
module.exports = function (app, config, router) {

  // ------------------------- ROUTES -------------------------------------
  // The next route matchs with /info   /info/   /v1/info   /v2/info   /v1/info/   etc...
  router.get('/:version/info', timeout(2000), exports.execAction('info', 'info'));
  // ----------------------------------------------------------------------

};

/**
 * Execute action based on controler/action names
 * @param {[type]} req [description]
 * @return {[type]} [description]
 */
exports.execAction = function (controller, action) {
  return (function (req, res, next) {
    var vs = exports.version(req);
    if (vs && vs[controller] !== undefined && vs[controller][action] !== undefined) {
      vs[controller][action](req, res, next);
    } else {
      next();
    }
  });
};

/**
 * Get API version based on URI. If not defined return default version
 * @param {[type]} req [description]
 * @return {[type]} [description]
 */
exports.version = function (req) {
  var parts = null;
  if (/^\/v[0-9]+\//i.test(req.path)) {
    parts = req.path.split('\/');
    // Version available
    if (exports.VERSIONS[parts[1]] !== undefined) {
      return exports.VERSIONS[parts[1]];
    } else {
      return null;
    }
  }
  return null;
};