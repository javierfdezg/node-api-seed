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
  data = require('../lib/data');

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
      data.createToken(token, req.user, function (err, tokenObject) {
        if (err) {
          util.sendResponse(req, res, 500, {
            error: 'Error saving access token'
          });
        } else {
          util.sendResponse(req, res, 200, {
            'token': token
          });
        }
      });
    }
  });

};