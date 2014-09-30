/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent'),
  Chance = require('chance');

var apiEndPoint = "http://127.0.0.1:4000/";

describe('API data layer', function () {

  it('Should return 200 mongo connection success', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .end(function (err, res) {
        if (!res.error) {
          done();
        }
      });
  });

  it('Should return error trying to save duplicate email', function (done) {

    this.timeout(5000);
    var chance = new Chance();

    var user = {
      email: chance.email({
        domain: "example.com"
      }),
      password: chance.string()
    };

    // Create user
    request
      .post(apiEndPoint + 'test/user')
      .send(user)
      .end(function (err, res) {
        if (!err && !res.error) {
          // Create user
          request
            .post(apiEndPoint + 'test/user')
            .send(user)
            .end(function (err, res) {
              if (res.error && res.error.status === 400) {
                done();
              }
            });
        }
      });
  });

});