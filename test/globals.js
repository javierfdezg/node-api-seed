/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo */
/*jshint -W030 */
"use strict";

var supertest = require('supertest'),
  util = require('../src/lib/util'),
  validations = require('../src/lib/data/validations'),
  ObjectID = require('mongodb').ObjectID,
  sinon = require('sinon'),
  Chance = require('chance'),
  chai = require('chai');
chai.use(require('chai-datetime'));
chai.use(require('chai-subset'));

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
  createUserAndLogin: createUserAndLogin,
  createUserInOrganization: createUserInOrganization,
  createUser: createUser
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
}

function createUserInOrganization(role, organization, cb) {
  var chance = new Chance();
  var user;

  user = {
    organization: organization,
    fullName: chance.string({
      length: 8
    }),
    email: chance.email(),
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
        user._id = usr.body._id;
        user.organization = usr.body.organization;
        cb && cb(err, user);
      }
    });
}

function createUser(role, cb) {
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
        email: chance.email(),
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
            user._id = usr.body._id;
            cb && cb(err, user);
          }
        });
    }
  });
}

function createUserAndLogin(role, cb) {
  createUser(role, function (err, user) {
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

/**
 * Clone a plain JSON Object containing MongoDB ObjectIDs
 * @param  {[type]} add [description]
 * @return {[type]}     [description]
 */
function clone(item) {
  if (!item) {
    return item;
  } // null, undefined values check

  var types = [Number, String, Boolean],
    result;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function (type) {
    if (item instanceof type) {
      result = type(item);
    }
  });

  if (typeof result == "undefined") {
    // Is a MongoDB ObjectID?
    if (validations.ObjectID(item)) {
      result = ObjectID.createFromHexString(item.toString());
    } else if (Object.prototype.toString.call(item) === "[object Array]") {
      result = [];
      item.forEach(function (child, index) {
        result[index] = clone(child);
      });
    } else if (typeof item == "object") {
      // testing that this is DOM
      if (item.nodeType && typeof item.cloneNode == "function") {
        result = item.cloneNode(true);
      } else if (!item.prototype) { // check that this is a literal
        if (item instanceof Date) {
          result = new Date(item);
        } else {
          // it is an object literal
          result = {};
          for (var i in item) {
            result[i] = clone(item[i]);
          }
        }
      } else {
        // depending what you would like here,
        // just keep the reference, or create new object
        if (false && item.constructor) {
          // would not advice to do that, reason? Read below
          result = new item.constructor();
        } else {
          result = item;
        }
      }
    } else {
      result = item;
    }
  }

  return result;
}

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
}

// Global BDD functions
global.expect = chai.expect;
global.should = chai.should;