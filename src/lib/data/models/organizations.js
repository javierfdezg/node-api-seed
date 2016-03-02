/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var BaseModel = require('../base-model'),
  inherits = require('util').inherits,
  winston = require('winston');

var Organizations = module.exports = function (options, conf) {

  // Collection indexes
  this.indexes = [{
    fieldOrSpec: 'delete_from',
    options: {
      expireAfterSeconds: conf.testobjectexpiration
    }
  }];

  // Call Super constructor
  BaseModel.apply(this, arguments);
};

Organizations.prototype.searchByAPIKey = function (key, cb) {
  var self = this;
  // Save the token
  self.aggregate([{
    $unwind: "$apiKeys"
  }, {
    $match: {
      "apiKeys.key": {
        $eq: key
      }
    }
  }], cb);
};

inherits(Organizations, BaseModel);