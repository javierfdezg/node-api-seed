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

describe('API security layer', function () {

  it('Should return 401 Forbidden (Invalid token)', function (done) {
    request
      .get(apiEndPoint + 'test/secured')
      .set('Authorization', 'Bearer invalidToken1283')
      .end(function (err, res) {
        if (res.error && res.error.status === 401) {
          done();
        }
      });
  });

  it('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
    request
      .get(apiEndPoint + 'test/secured')
      .set('Authorization', 'Besarer 12341231341d')
      .end(function (err, res) {
        if (res.error && res.error.status === 403) {
          done();
        }
      });
  });

  it('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
    request
      .get(apiEndPoint + 'test/secured')
      .set('Authorization', 'baz')
      .end(function (err, res) {
        if (res.error && res.error.status === 403) {
          done();
        }
      });
  });

  it('Should create a new user, login with that user and get the bearer token, and then get protected resource', function (done) {

    this.timeout(10000);
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
          // Get auth token
          request
            .get(apiEndPoint + 'auth/token')
            .auth(user.email, user.password)
            .end(function (err, res) {
              if (!err && !res.error) {
                // Get protected resource
                request
                  .get(apiEndPoint + 'test/protected')
                  .set('Authorization', 'Bearer ' + res.body.token)
                  .end(function (err, res) {
                    if (!err && !res.err && res.body.secured.email === user.email) {
                      done();
                    }
                  });
              }
            });
        }
      });
  });

});