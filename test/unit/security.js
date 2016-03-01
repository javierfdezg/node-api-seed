/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var util = require('../../src/lib/util'),
  security = require('../../src/middleware/security'),
  test = require('../../src/controllers/test'),
  sinon = require('sinon');

describe('Security middleware Unit Tests', function () {

  describe('execAction', function () {

    var spy = sinon.spy(test, 'testProtectedApiKey');
    var spyUtilAllow = sinon.spy(util, 'allow');
    var req = null;

    beforeEach(function () {
      req = zoo.getReq();
      spy.reset();
      spyUtilAllow.reset();
    });

    it('It should execute controller/action when organization is present in request', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.public);
      req.organization = {};
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(1);

      done();

    });

    it('It should call util.allow when organization not present in request and not execute protected action', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.loggedin);
      req.user = {};
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);
      expect(spyUtilAllow.callCount).to.equal(1);

      done();

    });

    it('It should not execute controller/action when no organization or user present in request', function (done) {

      var middleware = security.execAction('test', 'testProtectedApiKey', zoo.security.accessLevels.public);
      middleware(req, {}, function () {
        done('Controller action not found');
      });

      expect(spy.callCount).to.equal(0);

      done();

    });

  });

});