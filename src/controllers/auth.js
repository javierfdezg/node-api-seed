/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  fs = require('fs'),
  path = require('path'),
  util = require('../lib/util'),
  Tokens = require('../lib/data').Tokens,
  _ = require('underscore');

/**
 * Creates and save a new bearer token for the current user
 * http://tools.ietf.org/html/rfc6750#section-1.2
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]} the generated token
 */
exports.token = function (req, res) {

  util.randomToken(function (err, token) {
    if (err) {
      util.sendResponse(req, res, 500, {
        error: 'Error generating access token'
      });
    } else {
      Tokens.create(token, req.user, function (err, tokenObject) {
        if (err) {
          util.sendResponse(req, res, 500, {
            error: 'Error saving access token'
          });
        } else {
          util.sendResponse(req, res, 200, {
            'token': tokenObject.token,
            'user': _.omit(req.user, ['password', 'salt'])
          });
        }
      });
    }
  });

};