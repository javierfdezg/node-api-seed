/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var validations = require('./validations'),
  ObjectID = require('mongodb').ObjectID;

module.exports.transform = function (obj, transf) {
  var prop, i;
  if (transf && transf.properties) {
    for (prop in transf.properties) {
      // Any transformation defined for current property?
      if (transf.properties[prop].transform !== undefined && typeof transf.properties[prop].transform === 'function' && obj[prop] !== undefined) {
        obj[prop] = transf.properties[prop].transform(obj[prop]);
      }
      // Nested object
      else if (transf.properties[prop].properties && obj[prop] !== undefined) {
        // Arrays
        if (Object.prototype.toString.call(obj[prop]) === '[object Array]') {
          for (i = 0; i < obj[prop].length; i++) {
            module.exports.transform(obj[prop][i], transf);
          }
        } else {
          module.exports.transform(obj[prop], transf.properties[prop]);
        }
      }
    }
  }
};

module.exports.mongoObjectID = function (obj) {
  if (validations.ObjectID(obj) || typeof obj !== 'string') {
    return obj;
  } else {
    return ObjectID(obj);
  }
};

module.exports.javascriptDate = function (obj) {
  if (typeof obj === 'string') {
    return new Date(obj);
  } else {
    return obj;
  }
};