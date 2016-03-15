/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  objectPath = require("object-path"),
  hogan = require("hogan.js");

/**
 * Extract required params for template
 * @param  template
 * @return An array with params
 */
exports.extractParams = function (template) {
  var params = template.match(/{{\s*[\w\.]+\s*}}/g)
    .map(function (x) {
      return x.match(/[\w\.]+/)[0];
    });

  return params;
};

/**
 * Populates a template with provided params
 * @param template mustache template
 * @param payload object containing all required params
 * @return populated template
 */
exports.populate = function (template, payload) {
  var template = hogan.compile(template);
  return template.render(payload);
};

/**
 * Checks the inclusion of every param in object
 * @param  {[type]} obj Object to be checked
 * @param  {[type]} params Array of params to check (deep properties use path expression)
 * @return {[type]} True if all params are found in object, false otherwise
 */
exports.validateParams = function (obj, params) {
  var i;
  for (i = 0; i < params.length; i++) {
    if (!objectPath.has(obj, params[i])) {
      return false;
    }
  }
  return true;
};