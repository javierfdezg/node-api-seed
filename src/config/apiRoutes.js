/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";
var timeout = require('connect-timeout'),
  winston = require('winston'),
  path = require('path'),
  security = require('../lib/security'),
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
  router.get('/tasks/:id', timeout(2000), exports.execAction('tasks', 'get', security.accessLevels.loggedin));
  // ----------------------------------------------------------------------

};

/**
 * Execute action based on controler/action names
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
exports.execAction = function (controller, action, accessLevel) {
  var ctrl = require('./../controllers/' + controller);
  return (function (req, res, next) {

    try {
      // Test if actions exists
      if (ctrl[action] === undefined) throw "No action found";
      // Access gra nted
      if (util.allow(req.user, accessLevel)) {
        ctrl.get(req, res, next);
      }
      // Unauthorized access
      else {
        winston.warn("------------------------------------------------------");
        winston.warn("%s, Role %s , required: %d", req.path, (req.user && req.user.role) ? req.user.role : 'not identified', accessLevel);
        winston.warn("------------------------------------------------------");
        util.sendResponse(req, res, 401, {
          error: req.i18n.__('Unauthorized')
        });
      }
    } catch (e) {
      winston.error("No controller/action found: %s/%s %s", controller, action, e.toString());
      next();
    }

  });
};