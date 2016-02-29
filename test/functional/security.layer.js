/*
 * Copyright (c) Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var Chance = require('chance');

describe('API security layer', function () {

  xit('Should return 401 Forbidden (Invalid token)', function (done) {
    api.get('/test/secured')
      .set('Authorization', 'Bearer invalidToken1283')
      .expect(401)
      .end(done);
  });

  xit('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
    api.get('/test/secured')
      .set('Authorization', 'Besarer 12341231341d')
      .expect(403)
      .end(done);
  });

  xit('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
    api.get('/test/secured')
      .set('Authorization', 'baz')
      .expect(403)
      .end(done);
  });

  it('Should create a new user, login with that user and get the bearer token, and then get protected resource', function (done) {

    var chance = new Chance();
    var user = {
      email: chance.email({
        domain: "example.com"
      }),
      password: chance.string()
    };

    // Create user, login and get protected resource
    api.post('/test/user')
      .send(user)
      .expect(201)
      .end(function (err, res) {
        if (err) throw err;
        api.get('/auth/token')
          .auth(user.email, user.password)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            api.get('/test/protected')
              .set('Authorization', 'Bearer ' + res.body.token)
              .expect(200)
              .end(function (err, res) {
                if (err) throw err;
                expect(res.body).to.have.deep.property('secured.email', user.email);
                done();
              });
          });
      });
  });

});