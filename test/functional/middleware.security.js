/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo, expect */
/*jshint -W030 */
"use strict";

var util = require('../../src/lib/util'),
  ObjectID = require('mongodb').ObjectID,
  proxyquire = require('proxyquire').noCallThru(),
  UsersControllerStub = {
    test: function (req, res) {
      util.sendResponse(req, res, 200);
    }
  },
  UsersStub = {
    find: function (query) {
      var user = {
        name: "User name"
      };
      if (query._id.toString() === '447f191e810c19729de86044') {
        user = null;
      }
      if (query._id.toString() === '447f191e810c19729de860ea') {
        user.organization = ObjectID("507f191e810c19729de860ea");
      } else if (user) {
        user.organization = ObjectID("307f191e810c19729de86000");
      }
      return {
        limit: function () {
          return {
            next: function (cb) {
              cb && cb(null, user);
            }
          };
        }
      };
    }
  },
  data = {
    'Users': UsersStub,
    getModel: function (collectionName) {
      if (collectionName === 'users') {
        return UsersStub;
      } else {
        return undefined;
      }
    }
  },
  security = proxyquire('../../src/middleware/security', {
    '../lib/data/models/users': UsersStub,
    '../lib/data': data,
    './../controllers/users': UsersControllerStub
  }),
  test = require('../../src/controllers/test'),
  sinon = require('sinon');

describe('Security middleware Unit Tests', function () {

  var spyUtilAllow = sinon.spy(util, 'allow');
  var req = null;

  describe('execAction', function () {

    var spy = sinon.spy(test, 'testProtectedApiKey');

    beforeEach(function () {
      req = zoo.getReq();
      spy.reset();
      spyUtilAllow.reset();
      zoo.sendResponseCallbackSpy.reset();
    });

    it('Should execute controller/action when organization is present in request', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.admin);
      req.organizationObject = {};
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(1);

      done();

    });

    it('Should call util.allow when organization not present in request and not execute protected action and return HTTP status 401', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.admin);
      req.user = {};
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(spyUtilAllow.callCount).to.equal(1);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(401);

      done();

    });

    it('Should not execute controller/action and return HTTP status 401 when no organization or user present in request', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(401);

      done();

    });

    it('Should execute public controller/action when no organization or user present in request', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.public);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(1);

      done();

    });

  });

  describe('checkOwnerAndExecAction', function () {

    var spy = sinon.spy(UsersControllerStub, 'test');

    beforeEach(function () {
      req = zoo.getReq();
      spy.reset();
      spyUtilAllow.reset();
      zoo.sendResponseCallbackSpy.reset();
    });

    it('Should fail (HTTP status 500) trying to route url that doesn\'t match any existing model', function (done) {
      req.path = "/model/447f191e810c19729de86000";
      req.organization = ObjectID("507f191e810c19729de860ea");
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(500);

      done();
    });

    it('Should fail (HTTP status 404) trying to route url that doesn\'t match any existing model (No model found)', function (done) {
      req.path = "/users/447f191e810c19729de86044";
      req.organization = ObjectID("507f191e810c19729de860ea");
      req.user = {
        organization: req.organization,
        role: zoo.security.userRoles.admin
      };
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(404);

      done();
    });

    it('Should not execute controller/action on a model when no organization or user present in request', function (done) {
      req.path = "/users/447f191e810c19729de860ea";
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(403);

      done();
    });

    it('Should not execute controller/action on a model which organization is diferent from request organization and return HTTP 403 Forbidden', function (done) {
      req.path = "/users/447f191e810c19729de860ea";
      req.organization = ObjectID("577f191e810c19729de860ea");
      req.user = {
        organization: req.organization,
        role: zoo.security.userRoles.admin
      };
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });
      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(403);
      done();
    });

    it('Should not execute controller/action on a model which organization is diferent from request user\'s organization', function (done) {
      req.path = "/users/447f191e810c19729de860ea";
      req.organization = ObjectID("577f191e810c19729de860ea");
      req.organizationObject = {
        _id: req.organization
      };
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });
      expect(spy.callCount).to.equal(0);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(403);
      done();
    });

    it('Should execute controller/action on a model which organization is equal to request organization', function (done) {
      req.path = "/users/447f191e810c19729de860ea";
      req.organization = ObjectID("507f191e810c19729de860ea");
      req.organizationObject = {
        _id: req.organization
      };
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });
      expect(spy.callCount).to.equal(1);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(200);
      done();
    });

    it('Should execute controller/action on a model which organization is equal to request user\'s organization', function (done) {
      req.path = "/users/447f191e810c19729de860ea";
      req.organization = ObjectID("507f191e810c19729de860ea");
      req.user = {
        organization: req.organization,
        role: zoo.security.userRoles.admin
      };
      var middleware = security.checkOwnerAndExecAction('users', 'test', zoo.security.accessLevels.admin);
      middleware(req, {}, function () {
        done('Controller action not found');
      });
      expect(spy.callCount).to.equal(1);
      expect(zoo.sendResponseCallbackSpy.args[0][2]).to.equal(200);
      done();
    });

  });

});