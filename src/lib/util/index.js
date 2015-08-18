/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var crypto = require('crypto'),
  winston = require('winston'),
  security = require('../security');

/**
 * Wrapper for response.jsonp to avoid write responses when timeout has just happened
 * @param  {[type]} req    [description]
 * @param  {[type]} res    [description]
 * @param  {[type]} status [description]
 * @param  {[type]} obj    [description]
 * @return {[type]}        [description]
 */
exports.sendResponse = function (req, res, status, obj) {
  if (!req.timedout) {
    if (obj !== undefined) {
      res.status((status) ? status : 200).jsonp(obj);
    } else {
      res.status(status).end();
    }
  }
};

/**
 * Strong password hashing function
 * @param  {Object} opts:
 *     - plainText:  The password to be hashed. If it is not provided, an 8 character base64
 *     password will be randomly generated.
 *     - salt: A string or Buffer with the salt. If not provided, a 512-bit salt will be
 *     randomly generated.
 * @param  {Function} callback Callback function will receive 2 params: err and opts.
 * Generated key available in opts.key and generate salt in opts.salt.
 */
exports.hasher = function (opts, callback) {

  // if no password is provided then generate one random 8 character base64 password
  if (opts.plainText === undefined) {
    return crypto.randomBytes(6, function (err, buf) {
      if (err) {
        callback(err);
      } else {
        opts.plainText = buf.toString('base64');
        return module.exports.hasher(opts, callback);
      }
    });
  }
  // Generate random 512 bit salt if non provided
  else if (opts.salt === undefined) {
    return crypto.randomBytes(64, function (err, buf) {
      if (err) {
        callback(err);
      } else {
        opts.salt = buf.toString('base64');
        return module.exports.hasher(opts, callback);
      }
    });
  }
  // Hash password
  else {
    opts.hash = 'sha1';
    opts.iterations = opts.iterations || 10000;
    crypto.pbkdf2(opts.plainText, opts.salt, opts.iterations, 64, function (err, key) {
      if (err) {
        callback(err);
      } else {
        opts.key = new Buffer(key).toString('base64');
        return callback(null, opts);
      }
    });
  }

};

/**
 * Validate provided password with encripted password and salt
 * @param  {[type]} password          [description]
 * @param  {[type]} encriptedPassword [description]
 * @param  {[type]} slt              [description]
 * @return {[type]}                   [description]
 */
exports.validatePassword = function (password, encriptedPassword, slt, cb) {

  module.exports.hasher({
    plainText: password,
    salt: slt
  }, function (err, opts) {
    if (err) {
      cb && cb(err);
    } else {
      cb && cb(null, opts.key === encriptedPassword);
    }
  });

};

/**
 * Generate a random token
 * @return {[type]} [description]
 */
exports.randomToken = function (cb) {
  crypto.randomBytes(48, function (ex, buf) {
    if (ex) {
      cb && cb(ex);
    } else {
      cb && cb(null, buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-'));
    }
  });
};

exports.allow = function (user, accessLevel) {
  var al = (accessLevel !== undefined) ? accessLevel : security.accessLevels.public;
  var role = (user && user.role !== undefined) ? user.role : security.userRoles.public;
  winston.info("Role %s Access Level %s : %s", role, al, al & role);
  return (al & role);
};