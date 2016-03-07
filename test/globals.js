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
  sinon = require('sinon'),
  Chance = require('chance');

var sendResponseCallbackSpy = sinon.spy(); // Tip: reset in beforeEach zoo.sendResponseCallbackSpy.reset() if necesary

global.zoo = {
  protocol: 'http', // API protocol
  host: '127.0.0.1', // API host
  port: '4000', // API port
  security: require('../src/lib/security'),
  clone: clone,
  getReq: getReq,
  sendResponseStub: sinon.stub(util, "sendResponse", sendResponseCallbackSpy),
  sendResponseCallbackSpy: sendResponseCallbackSpy,
  createOrganization: createOrganization,
  createUserAndLogin: createUserAndLogin
};

// Create supertest instance
global.zoo.api = supertest(global.zoo.protocol + '://' + global.zoo.host + ':' + global.zoo.port);

/**
 * Creates an orga
 * @return {[type]} [description]
 */
function createOrganization(cb) {
  var pair1 = {};
  var pair2 = {};
  var organization;
  var chance = new Chance();

  // Generate 2 API key/secret pairs and random name
  zoo.security.generateRandomKeySignature(20, function (err, str) {
    pair1.key = str;
    zoo.security.generateRandomKeySignature(20, function (err, str) {
      pair2.key = str;
      zoo.security.generateRandomKeySignature(40, function (err, str) {
        pair1.secret = str;
        zoo.security.generateRandomKeySignature(40, function (err, str) {
          pair2.secret = str;

          organization = {
            name: chance.word(),
            apiKeys: [pair1, pair2]
          };

          // Create organization
          zoo.api.post('/test/organization')
            .send(organization)
            .end(function (err, res) {
              cb && cb(err, res.body);
            });
        });
      });
    });
  });
};

function createUserAndLogin(role, cb) {
  var chance = new Chance();
  var user;

  createOrganization(function (err, org) {
    if (err) {
      cb && cb(err);
    } else {
      user = {
        organization: org._id,
        fullName: chance.string({
          length: 8
        }),
        email: chance.email({
          domain: "example.com"
        }),
        password: chance.string({
          length: 10
        }),
        role: role
      };
      zoo.api.post('/test/user')
        .send(user)
        .end(function (err, usr) {
          if (err) {
            cb && cb(err);
          } else {
            zoo.api.get('/auth/token')
              .auth(user.email, user.password)
              .end(function (err, token) {
                if (err) {
                  cb && cb(err);
                } else {
                  cb && cb(null, token.body.user, token.body.token);
                }
              });
          }
        });
    }
  });

};

/**
 * Clone a plain JSON Object containing MongoDB ObjectIDs
 * @param  {[type]} add [description]
 * @return {[type]}     [description]
 */
function clone(add) {
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
};

/**
 * Mock express request
 * @return {[type]} [description]
 */
function getReq() {
  return {
    i18n: {
      __: function (str) {
        return str;
      }
    }
  };
};

// Global BDD functions
global.expect = require('chai').expect;
global.should = require('chai').should;