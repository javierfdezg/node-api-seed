/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  util = require('../../lib/util');

/**
 * Get API version
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.info = function (req, res) {
  util.sendResponse(req, res, 200, {
    'version': 'v1'
  });
};

/**
 * Get API version
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.v1Info = function (req, res) {
  util.sendResponse(req, res, 200, {
    'version': 'v1'
  });
};