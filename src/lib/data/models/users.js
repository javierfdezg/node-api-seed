/*
 * Copyright (c) Why Not Soluciones, S.L.
 * http://exploringjs.com/es6/ch_classes.html
 */

/*jslint node: true */
"use strict";

var BaseModel = require('../base-model'),
  util = require('../../util'),
  security = require('../../security'),
  inherits = require('util').inherits,
  winston = require('winston'),
  ObjectID = require('mongodb').ObjectID,
  Tokens = require('../').Tokens;

var Users = module.exports = function (options, conf) {

  // Collection indexes
  this.indexes = [{
    fieldOrSpec: 'delete_from',
    options: {
      expireAfterSeconds: conf.testobjectexpiration
    }
  }];

  // Collection JSON Schema
  this.schema = {
    properties: {
      organization: {
        type: 'object',
        required: true,
        conform: function (objID) {
          return util.isObjectID(objID);
        }
      }, //Type
      fullName: {
        type: 'string',
        minLength: 3,
        required: true
      },
      password: {
        type: 'string',
        minLength: 8,
        required: true
      },
      email: {
        type: 'string',
        format: 'email',
        required: true
      },
      role: {
        type: 'integer',
        required: true,
        enum: security.rolesList()
      }
    }
  };

  // Call Super constructor
  BaseModel.apply(this, arguments);
};

module.exports.collectionName = 'users';
inherits(Users, BaseModel);

/**
 * Creates a new user
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
Users.prototype.create = function (usr, cb) {
  var self = this;
  if (usr.password) {
    self.find({
      email: usr.email
    }).limit(1).next(function (err, userExists) {
      if (err) {
        winston.error('Error searching for %s in database (User.create): %s', usr.email, err.message);
        cb({
          key: 'Error searching for this email in Database',
          status: 500
        });
      } else if (userExists) {
        cb({
          key: 'This email already exists',
          status: 400
        });
      } else {
        // Encrypt password and save with salt
        util.hasher({
          plainText: usr.password
        }, function (err, opts) {
          if (err) {
            winston.error('Error encrypting password for %s', usr.email);
            cb && cb({
              key: 'Error encrypting password',
              status: 500
            });
          } else {
            usr.password = opts.key;
            usr.salt = opts.salt;
            // Insert new user in collection
            self.insert(usr, {
              w: 1
            }, function (err, userObject) {
              cb && cb(err, userObject);
            });
          }
        });
      }
    });
  } else {
    cb({
      key: 'You must provide a password',
      status: 400
    });
  }
};

/**
 * Search for valid token, and then search and return the owner of that token.
 * Update validity of the found token
 * @param  {[type]} tk [description]
 * @param  {Function} cb [description]
 * @return {[type]} [description]
 */
Users.prototype.searchByBearerToken = function (tk, cb) {
  var self = this;
  // Find token and modify updated_at field with current time
  Tokens.findOneAndUpdate({
    token: tk
  }, {
    $set: {
      updated_at: new Date(), // Increment time
    }
  }, {
    'upsert': false,
    'new': true
  }, function (err, tokenObject) {
    if (err) {
      cb && cb(err);
    } else if (tokenObject && tokenObject.value) {
      // Get user with id stored in token's record
      self.find({
        _id: ObjectID(tokenObject.value.user)
      }).limit(1).next(function (err, userObject) {
        cb && cb(err, userObject);
      });
    } else {
      cb && cb(null, null);
    }
  });
};