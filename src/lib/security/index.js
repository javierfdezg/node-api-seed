/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";

var util = require('../util'),
  crypto = require('crypto');

// Remember to update also in app/www/js/services/user.js
var userRoles = {
  root: 0x100, // 100000000
  public: 0x01, // 000000001: public user
  admin: 0x02, // 0000000010 
  readonly: 0x04 // 000000100
};

// Remember to update also in app/www/js/services/user.js
var accessLevels = {
  // Root
  root: userRoles.root,
  // Logged in level
  admin: userRoles.admin | userRoles.root,
  // Read-only
  readonly: userRoles.admin | userRoles.root | userRoles.readonly,
  // Public level
  public: userRoles.public | userRoles.admin | userRoles.root | userRoles.readonly
};

module.exports.userRoles = userRoles;
module.exports.accessLevels = accessLevels;

/**
 * Returns an array of available roles
 * @return {[type]} [description]
 */
module.exports.rolesList = function () {
  var role, list = [];

  for (role in userRoles) {
    list.push(userRoles[role]);
  }
  return list;
};

/**
 * [checkSignature description]
 * @param  {[type]} req       [description]
 * @param  {[type]} signature [description]
 * @param  {[type]} secret    [description]
 * @return {[type]}           [description]
 */
module.exports.checkSignature = function (req, signature, secret) {
  return (module.exports.sign(req, secret) === signature);
};

/**
 * Calculate HTTP request signature. 
 *   base64(hmac-sha1(request.hostname + request.originalUrl))
 * @param  {[type]} req       [description]
 * @param  {[type]} signature [description]
 * @param  {[type]} secret    [description]
 * @return {[type]}           [description]
 */
module.exports.sign = function (req, secret) {
  var hostname = req.hostname || "";
  var originalUrl = req.originalUrl || "";
  var body = util.isEmptyObject(req.body) ? "" : JSON.stringify(req.body);
  var payload = hostname + originalUrl + body;

  return util.stringToBase64(module.exports.hmacsha1(payload, secret));
};

module.exports.hmacsha1 = function (str, key) {
  var buffer = new Buffer(str, 'utf8');
  var keyBuffer = new Buffer(key, 'utf8');
  return crypto.createHmac('sha1', keyBuffer).update(buffer).digest('hex');
};

module.exports.generateRandomKeySignature = function (length, cb) {
  crypto.randomBytes(length, function (ex, buf) {
    cb && cb(ex, buf.toString('base64').replace(/:/g, '-'));
  });
};