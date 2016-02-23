/*
 * Copyright (c) Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

describe('API Test services', function () {

  it('Should test timeout service', function (done) {
    api.get('/test/timeout')
      .expect(503)
      .end(done);
  });

  it('Should test exception service', function (done) {
    api.get('/test/exception')
      .expect(500)
      .end(done);
  });

  it('Should test long-time service', function (done) {
    this.timeout(5000);
    api.get('/test/long-time')
      .timeout(1000)
      .end(function (err, res) {
        if (err.timeout) {
          done();
        }
      });
  });

});