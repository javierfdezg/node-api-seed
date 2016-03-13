/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var revalidator = require('revalidator'),
  ObjectID = require('mongodb').ObjectID;

module.exports.validateSchema = function (obj, schema) {
  if (schema) {
    return revalidator.validate(obj, schema);
  } else {
    return {
      valid: true,
      errors: []
    };
  }
};

/**
 * Check if string is a valid hexadecimal representation of an ObjectID
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
module.exports.hexadecimalStringObjectID = function (obj) {
  var objectId;
  try {
    objectId = new ObjectID(obj);
    return objectId.toHexString() === obj;
  } catch (ex) {
    return false;
  }
};

/**
 * Check if the object is a valid MongoDB ObjectID
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
module.exports.ObjectID = function (obj) {
  if (obj.equals === undefined || typeof obj.equals !== 'function') return false;
  if (obj.generate === undefined || typeof obj.generate !== 'function') return false;
  if (obj.getTimestamp === undefined || typeof obj.getTimestamp !== 'function') return false;
  if (obj.toHexString === undefined || typeof obj.toHexString !== 'function') return false;
  return true;
};