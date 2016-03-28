/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";
var winston = require('winston');

/**
 * Configure winston log transports
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
module.exports = function (app, config) {

  // Redefine Console transport
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, config.logging.console);
  // File transport for warn and error
  winston.add(winston.transports.File, config.logging.file);

};