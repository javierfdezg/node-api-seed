/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo */
/*jshint -W030 */
"use strict";

describe('API Test services', function () {

  it('Should test timeout service', function (done) {
    zoo.api.get('/test/timeout')
      .expect(503)
      .end(done);
  });

  it('Should test exception service', function (done) {
    zoo.api.get('/test/exception')
      .expect(500)
      .end(done);
  });

  it('Should test long-time service', function (done) {
    this.timeout(5000);
    zoo.api.get('/test/long-time')
      .timeout(1000)
      .end(function (err) {
        if (err.timeout) {
          done();
        }
      });
  });

});