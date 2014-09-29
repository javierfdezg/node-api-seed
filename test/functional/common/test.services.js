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

describe('API Test services', function () {

  it('Should test timeout service', function (done) {
    request
      .get(apiEndPoint + 'test/timeout')
      .end(function (err, res) {
        if (res.error && res.error.status === 503) {
          done();
        }
      });
  });

  it('Should test exception service', function (done) {
    request
      .get(apiEndPoint + 'test/exception')
      .end(function (err, res) {
        if (res.error && res.error.status === 500) {
          done();
        }
      });
  });

  it('Should test long-time service', function (done) {
    this.timeout(5000);
    request
      .get(apiEndPoint + 'test/long-time')
      .timeout(1000)
      .end(function (err, res) {
        if (err.timeout) {
          done();
        }
      });
  });

});