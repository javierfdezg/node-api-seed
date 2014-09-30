/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent');

var apiEndPoint = "http://127.0.0.1:4000/";

describe('API Version detection', function () {

  it('If no version especified, should use default api version (v1)', function (done) {
    request
      .get(apiEndPoint + 'info')
      .end(function (err, res) {
        if (!res.error && res.body.version == 'v1') {
          done();
        }
      });
  });

  it('If version number is not available, should use default api version (v1)', function (done) {
    request
      .get(apiEndPoint + 'v123/info')
      .end(function (err, res) {
        if (!res.error && res.body.version == 'v1') {
          done();
        }
      });
  });

  it('Should use api version v1', function (done) {
    request
      .get(apiEndPoint + 'v1/info')
      .end(function (err, res) {
        if (!res.error && res.body.version == 'v1') {
          done();
        }
      });
  });

  it('Should use api version v2', function (done) {
    request
      .get(apiEndPoint + 'v2/info')
      .end(function (err, res) {
        if (!res.error && res.body.version == 'v2') {
          done();
        }
      });
  });

  it('Should return 404 Not Found', function (done) {
    request
      .get(apiEndPoint + 'v1/not-found/info-route')
      .end(function (err, res) {
        if (res.error && res.error.status === 404) {
          done();
        }
      });
  });

  it('Should return 404 Not Found', function (done) {
    request
      .get(apiEndPoint + 'v2/not-found/info-route')
      .end(function (err, res) {
        if (res.error && res.error.status === 404) {
          done();
        }
      });
  });

});