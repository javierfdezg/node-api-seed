/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent');
var assert = require('assert');
var expect = require('expect.js');
var should = require('should');
var _ = require('underscore');
var apiEndPoint = "http://127.0.0.1:4000/";

describe('API Test services', function () {

  it('Should test timeout service', function (done) {
    request
      .get(apiEndPoint + 'test/timeout')
      .end(function (err, res) {
        done();
      });
  });

  it('Should test exception service', function (done) {
    request
      .get(apiEndPoint + 'test/exception')
      .end(function (err, res) {
        done();
      });
  });

  it('Should test memory-leak service', function (done) {
    request
      .get(apiEndPoint + 'test/memory-leak')
      .end(function (err, res) {
        done();
      });
  });

  it('Should test out-of-memory service', function (done) {
    request
      .get(apiEndPoint + 'test/out-of-memory service')
      .end(function (err, res) {
        done();
      });
  });

  it('Should test chunk service', function (done) {
    request
      .get(apiEndPoint + 'test/chunk')
      .end(function (err, res) {
        done();
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

  it('Should test js-long-long-time service', function (done) {
    this.timeout(5000);
    request
      .get(apiEndPoint + 'test/js-long-long-time')
      .timeout(1000)
      .end(function (err, res) {
        if (err.timeout) {
          done();
        }
      });
  });

});