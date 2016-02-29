/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var BaseModel = require('../base-model'),
  inherits = require('util').inherits,
  winston = require('winston');

var Tokens = module.exports = function (options, conf) {

  // Collection indexes
  this.indexes = [{
    fieldOrSpec: 'updated_at',
    options: {
      expireAfterSeconds: conf.tokenexpiration
    }
  }];

  // Call Super constructor
  BaseModel.apply(this, arguments);
};

inherits(Tokens, BaseModel);

/**
 * Associte a given token to the user
 * @param  {[type]}   tkn [description]
 * @param  {[type]}   usr   [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
Tokens.prototype.create = function (tkn, usr, cb) {
  var self = this;
  // Save the token
  self.insertOne({
    user: usr._id,
    token: tkn,
    created_at: new Date(),
    updated_at: new Date()
  }, {
    w: 1
  }, function (err, tokenObject) {
    if (err) {
      cb && cb(err);
    } else if (!tokenObject || tokenObject.ops === undefined || tokenObject.ops.length == 0) {
      cb && cb('Unknown error');
    } else {
      cb && cb(err, tokenObject.ops[0]);
    }
  });
};