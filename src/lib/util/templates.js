/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var objectPath = require("object-path"),
  _ = require('lodash'),
  hogan = require("hogan.js");

/**
 * Extract required params for templates. Each param (can take n params) is considered as a template
 * @return An array with params
 */
exports.extractParams = function () {
  var i, params;

  for (i = 0; i < arguments.length; i++) {
    params = _.union(params, arguments[i].match(/{{\s*[\w\.]+\s*}}/g)
      .map(function (x) {
        return x.match(/[\w\.]+/)[0];
      }));
  }

  return params;
};

/**
 * Populates a template with provided params
 * @param template mustache template
 * @param payload object containing all required params
 * @return populated template
 */
exports.populate = function (template, payload) {
  var tpl = hogan.compile(template);
  return tpl.render(payload);
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