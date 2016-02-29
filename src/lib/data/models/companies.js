/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var BaseModel = require('../base-model'),
  inherits = require('util').inherits,
  winston = require('winston');

var Companies = module.exports = function (options, conf) {

  // Call Super constructor
  BaseModel.apply(this, arguments);
};

inherits(Companies, BaseModel);