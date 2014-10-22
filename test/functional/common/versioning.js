/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent');
var expect = require('expect.js');

var apiEndPoint = "http://127.0.0.1:4000/";

describe('API Version detection', function () {

  it('Should return an error 404 if version is not specified', function (done) {
    request
      .get(apiEndPoint + 'info')
      .end(function (err, res) {
        expect(res).to.have.property('error');
        expect(res.error).to.have.property('status', 404);
        done();
      });
  });

  it('Should return an error 404 if provided version does not exist', function (done) {
    request
      .get(apiEndPoint + 'v123/info')
      .end(function (err, res) {
        expect(res).to.have.property('error');
        expect(res.error).to.have.property('status', 404);
        done();
      });
  });

  it('Should use api version v1', function (done) {
    request
      .get(apiEndPoint + 'v1/info')
      .end(function (err, res) {
        expect(res.error).to.be.null;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('version', 'v1');
        done();
      });
  });

  it('Should use api version v2', function (done) {
    request
      .get(apiEndPoint + 'v2/info')
      .end(function (err, res) {
        expect(res).to.have.property('error', false);
        expect(res.body).to.have.property('version', 'v2');
        done();
      });
  });

  it('Should return 404 if route is Not Found', function (done) {
    request
      .get(apiEndPoint + 'v1/not-found/info-route')
      .end(function (err, res) {
        expect(res).to.have.property('error');
        expect(res.error).to.have.property('status', 404);
        done();

      });
  });

});