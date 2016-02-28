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
 * Search for valid token, and then search and return the owner of that token.
 * Update validity of the found token
 * @param  {[type]} tk [description]
 * @param  {Function} cb [description]
 * @return {[type]} [description]
 */
Tokens.prototype.searchByBearerToken = function (tk, cb) {
  conn.collection(conf.tokenscollection, function (err, tokensCollection) {
    if (err) {
      cb(err);
    } else {
      tokensCollection.findAndModify({
        token: tk
      }, [], {
        $set: {
          updated_at: new Date(), // Increment time
        }
      }, {
        w: 1,
        new: false
      }, function (err, tokenObject) {
        if (err) {
          cb && cb(err);
        } else if (tokenObject) {
          // Get user
          module.exports.searchUserById(tokenObject.user, cb);
        } else {
          cb && cb(null, null);
        }
      });
    }
  });
};