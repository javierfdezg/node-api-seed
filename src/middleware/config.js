/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var winston = require("winston");

/**
 * Config middleware.
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
module.exports = function (config) {
  return (function (req, res, next) {
    if (req && req.config === undefined) {
      req.config = config;
    } else {
      winston.warn("Trying to attach config to req object. Config is already attached");
    }
    next();
  });
};