/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  util = require('../lib/util'),
  Users = require('../lib/data').Users;

/**
 * Bearer token middleware
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
module.exports.bearer = function (req, res, next) {

  var token = null;

  // If Authorization header is present
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];
      // Bearer token schema
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
        // Search for token in database
        Users.searchByBearerToken(token, function (err, user) {
          if (err) {
            winston.error("[API 500 ERROR] Error searching for bearer token %s: %s ", token, err);
            util.sendResponse(req, res, 500, {
              error: "Unknown error"
            });
          } else if (user) {
            // User found
            req.user = user;
            next();
          } else {
            // No valid token found
            util.sendResponse(req, res, 401, {
              error: 'Invalid token'
            });
          }
        });
      }
      // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown authorization header. Only bearer token is supported'
        });
      }
    }
    // If unknown authentication header
    else {
      util.sendResponse(req, res, 403, {
        error: 'Unknown authorization header. Only bearer token is supported'
      });
    }
  }
  // If no authorization, anonymous user
  else {
    req.user = null;
    next();
  }

};

/**
 * HTTP Auth Basic authentication middleware
 * http://www.ietf.org/rfc/rfc2617.txt
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports.userPassword = function (req, res, next) {

  var email = null;
  var password = null;

  // If Authorization header is present
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1],
        decodedCredentials,
        parts, user, password;
      // HTTP Basic schema
      if (/^Basic$/i.test(scheme)) {
        // decode and parse credentials
        decodedCredentials = new Buffer(credentials, 'base64').toString();
        parts = decodedCredentials.split(/:/);
        user = parts[0];
        password = parts[1];

        // Search for user in database
        Users.getByEmail(user, function (err, usr) {
          if (err) {
            winston.error("[API 500 ERROR] Error searching for user %s: %s ", user, err);
            util.sendResponse(req, res, 500, {
              error: "Unknown error"
            });
          } else if (usr) {
            util.validatePassword(password, usr.password, usr.salt, function (err, valid) {
              if (err || !valid) {
                util.sendResponse(req, res, 401, {
                  error: 'Invalid password'
                });
              } else {
                // User found
                req.user = usr;
                next();
              }
            });
          } else {
            // No user found
            util.sendResponse(req, res, 401, {
              error: 'User not found'
            });
          }
        });
      }
      // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown authorization header. Only Basic HTTP Auth is supported'
        });
      }
    }
    // If unknown authentication header
    else {
      util.sendResponse(req, res, 403, {
        error: 'Unknown authorization header. Only Basic HTTP Auth is supported'
      });
    }
  }
  // If no authorization 401 error with Auth Basic request
  else {
    res.setHeader('WWW-Authenticate', 'Basic realm="ACER Secure Area"');
    util.sendResponse(req, res, 401, {
      error: 'Not Authorized'
    });
  }
};