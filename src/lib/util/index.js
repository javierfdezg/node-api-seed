/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var crypto = require('crypto'),
  winston = require('winston'),
  security = require('../security'),
  changeCase = require('change-case');

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

/**
 * Has user this access level?
 * @param  {[type]} user        [description]
 * @param  {[type]} accessLevel [description]
 * @return {[type]}             [description]
 */
exports.allow = function (user, accessLevel) {
  var al = (accessLevel !== undefined) ? accessLevel : security.accessLevels.public;
  var role = (user && user.role !== undefined) ? user.role : security.userRoles.public;
  return ((al & role) > 0);
};

/**
 * Request user/app owns the entity?
 * @param  {[type]} req    [description]
 * @param  {[type]} entity [description]
 * @return {[type]}        [description]
 */
exports.owns = function (req, entity) {
  // Root access level OR user/app organization is the same than entity organization
  return ((req.user && module.exports.allow(req.user, security.accessLevels.root)) ||
    (entity.organization !== undefined && entity.organization.equals !== undefined &&
      entity.organization.equals(req.organization)));
};

/**
 * Remove last part in string based on delimiter. For example, it can remove extension from a file name
 * @param  {[type]} str       [description]
 * @param  {[type]} delimiter [description]
 * @return {[type]}           [description]
 */
exports.beforeLastIndex = function (str, delimiter) {
  return str.split(delimiter).slice(0, -1).join(delimiter) || str + "";
};

/**
 * Given a file name, returns its corresponding Collection Name
 * @param  {[type]} fileName [description]
 * @return {[type]}          [description]
 */
exports.fileToCollectionName = function (fileName) {
  return changeCase.snakeCase(module.exports.beforeLastIndex(fileName.toLowerCase(), '.'));
};

/**
 * Given a collection name, returns its corresponding class Name
 * @param  {[type]} collectionName [description]
 * @return {[type]}                [description]
 */
exports.collectionToClassName = function (collectionName) {
  return changeCase.pascalCase(collectionName);
};

/**
 * [stringToBase64 description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
exports.stringToBase64 = function (str) {
  return new Buffer(str).toString('base64');
};

exports.isEmptyObject = function (obj) {
  if (obj === undefined || obj === null) {
    return true;
  }
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
};

/**
 * Generates random integer between two number (including the two)
 * @param  {[type]} min [description]
 * @param  {[type]} max [description]
 * @return {[type]}     [description]
 */
exports.randomIntegerBetween = function (min, max)  {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random date from the past
 * @param  {[type]} seconds [optional] The date will be between (now - seconds) and now
 * @return {[type]}         [description]
 */
exports.randomOldDate = function (seconds)  {
  // If not provided, generate a random decrement between 0 and 1 year
  var secs = seconds ? seconds : module.exports.randomIntegerBetween(0, 31536000);
  var secondsDecrement = module.exports.randomIntegerBetween(0, secs);
  var date = new Date(Date.now() - (secondsDecrement * 1000));
  return date;
};

/**
 * Generates a random date from the future
 * @param  {[type]} seconds [optional] The date will be between now and (now + seconds)
 * @param  {[type]} increment [optional] If provided, sum this number of seconds to generated date
 * @return {[type]}           [description]
 */
exports.randomDateInFuture = function (increment, seconds)  {
  // If not provided, generate a random increment between 0 and 1 year
  var secs = seconds ? seconds : module.exports.randomIntegerBetween(0, 31536000);
  var secondsIncrement = module.exports.randomIntegerBetween(0, secs);
  var inc = increment ? increment : 0;
  var date = new Date(Date.now() + (secondsIncrement * 1000) + (inc * 1000));
  return date;
};

/**
 * Check if email domain == domain
 * @param  {[type]} email Must be a valid email with domain suffix
 * @param  {[type]} domain [description]
 * @return {[type]}        [description]
 */
exports.checkEmailDomain = function (email, domain)  {
  var parts;

  if (!email || !domain) {
    return false;
  } else {
    parts = email.split('@');
    if (parts.length < 2) {
      return false;
    } else {
      return domain === parts[1];
    }
  }
};