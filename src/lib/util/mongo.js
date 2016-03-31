/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var ObjectID = require('mongodb').ObjectID;

/**
 * Get string array and returns Mongo ObjectID array
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
exports.toObjectIDArray = function (arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    result.push(ObjectID(arr[i]));
  }
  return result;
};

/**
 * Get a Mongo ObjectId array and returns ObjectID hexadecimal string representation of that array
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
exports.toHexadecimalStringObjectIDArray = function (arr) {
  var i, result = [];
  for (i = 0; i < arr.length; i++) {
    result.push(arr[i].toString());
  }
  return result;
};