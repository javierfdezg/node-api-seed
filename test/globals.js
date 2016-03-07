/*
 * Copyright (c) Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var supertest = require('supertest'),
  util = require('../src/lib/util'),
  ObjectID = require('mongodb').ObjectID,
  sinon = require('sinon');

var sendResponseCallbackSpy = sinon.spy(); // Tip: reset in beforeEach zoo.sendResponseCallbackSpy.reset() if necesary

global.zoo = {
  protocol: 'http', // API protocol
  host: '127.0.0.1', // API host
  port: '4000', // API port
  security: require('../src/lib/security'),
  clone: function (add) {
    var origin = {};
    // Don't do anything if add isn't an object
    if (!add || typeof add !== 'object') return origin;
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      // Is a MongoDB ObjectID?
      if (util.isObjectID(add[keys[i]])) {
        origin[keys[i]] = ObjectID.createFromHexString(add[keys[i]].toString());
      } else {
        origin[keys[i]] = add[keys[i]];
      }
    }
    return origin;
  },
  getReq: function () {
    return {
      i18n: {
        __: function (str) {
          return str;
        }
      }
    };
  },
  sendResponseStub: sinon.stub(util, "sendResponse", sendResponseCallbackSpy),
  sendResponseCallbackSpy: sendResponseCallbackSpy
};

// Create supertest instance
global.zoo.api = supertest(global.zoo.protocol + '://' + global.zoo.host + ':' + global.zoo.port);

global.expect = require('chai').expect;
global.should = require('chai').should;