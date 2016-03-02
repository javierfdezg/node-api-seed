/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var util = require('../util'),
  winston = require('winston'),
  crypto = require('crypto');

// Remember to update also in app/www/js/services/user.js
var userRoles = {
  public: 0x01, // 000000001: public user
  admin: 0x02 // 0000000010 
};

// Remember to update also in app/www/js/services/user.js
var accessLevels = {
  // Public level
  public: userRoles.public | userRoles.admin,
  // Logged in level
  loggedin: userRoles.admin
};

module.exports.userRoles = userRoles;
module.exports.accessLevels = accessLevels;

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
  var buffer = new Buffer(str);
  var keyBuffer = new Buffer(key);
  return crypto.createHmac('sha1', key).update(str).digest('hex');
};

module.exports.generateRandomKeySignature = function (length, cb) {
  crypto.randomBytes(length, function (ex, buf) {
    cb && cb(ex, buf.toString('base64').replace(/:/g, '-'));
  });
};