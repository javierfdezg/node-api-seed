/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var util = require('../lib/util');

/**
 * Get a specific Business Unit from catalog by id
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.get = function (req, res) {
  util.sendResponse(req, res, 200, {
    message: req.i18n.__('Hello %s!!', req.user.fullName)
  });
};