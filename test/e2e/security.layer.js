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

  describe('Bearer Token', function () {

    it('Should create a new user, login with that user and get the bearer token, and then get protected resource', function (done) {

      var chance = new Chance();
      var user = {
        email: chance.email({
          domain: "example.com"
        }),
        password: chance.string(),
        role: zoo.security.userRoles.admin
      };

      // Create user, login and get protected resource
      zoo.api.post('/test/user')
        .send(user)
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          zoo.api.get('/auth/token')
            .auth(user.email, user.password)
            .expect(200)
            .end(function (err, res) {
              if (err) throw err;
              zoo.api.get('/test/protected')
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

  describe('API Key/secret', function () {
    var organization;
    var pair1 = {};
    var pair2 = {};
    var obj = {
      prop1: "Example",
      prop2: 12.2,
      prop3: true,
      prop4: [2, 12],
      prop5: undefined,
      prop6: null
    };

    var req = {
      hostname: zoo.host,
      originalUrl: '/test/protected-apikey'
    };

    before(function (done) {
      // Piramid >:)
      zoo.security.generateRandomKeySignature(20, function (err, str) {
        pair1.key = str;
        zoo.security.generateRandomKeySignature(20, function (err, str) {
          pair2.key = str;
          zoo.security.generateRandomKeySignature(40, function (err, str) {
            pair1.secret = str;
            zoo.security.generateRandomKeySignature(40, function (err, str) {
              pair2.secret = str;
              var chance = new Chance();
              organization = {
                name: chance.word(),
                apiKeys: [pair1, pair2]
              };

              // Create organization, login and get protected resource
              zoo.api.post('/test/organization')
                .send(organization)
                .expect(201)
                .end(done);
            });
          });
        });
      });

    });

    beforeEach(function (done) {
      delete req["body"];
      done();
    });

    describe('GET Method', function () {
      it('Should return 401 (Authorization is required/Unauthorized)', function (done) {
        zoo.api.get('/test/protected-apikey')
          .expect(401)
          .end(done);
      });

      it('Should return 401 (Invalid API KEY)', function (done) {
        var authHeader = 'WNS AASDLFKJASLDKFJALSKD:' + zoo.security.sign(req, 'ASKDLFJALKSDFJALSKDJFALSKDJFALKSDFJ');
        zoo.api.get('/test/protected-apikey')
          .set('Authorization', authHeader)
          .expect(401)
          .end(done);
      });

      it('Should return 400 (Invalid Signature: eg. URL tampering)', function (done) {
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.get('/test/protected-apikey?param=1')
          .set('Authorization', authHeader)
          .expect(400)
          .end(done);
      });

      it('Should create a new organization with one pair key/secret, and use that pair to sign a request for a protected resource', function (done) {
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.get('/test/protected-apikey')
          .set('Authorization', authHeader)
          .expect(200)
          .end(done);
      });
    });

    describe('DELETE Method', function () {
      it('Should return 401 (Authorization is required/Unauthorized)', function (done) {
        zoo.api.del('/test/protected-apikey')
          .expect(401)
          .end(done);
      });

      it('Should return 401 (Invalid API KEY)', function (done) {
        var authHeader = 'WNS AASDLFKJASLDKFJALSKD:' + zoo.security.sign(req, 'ASKDLFJALKSDFJALSKDJFALSKDJFALKSDFJ');
        zoo.api.del('/test/protected-apikey')
          .set('Authorization', authHeader)
          .expect(401)
          .end(done);
      });

      it('Should return 400 (Invalid Signature: eg. URL tampering)', function (done) {
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.del('/test/protected-apikey?param=1')
          .set('Authorization', authHeader)
          .expect(400)
          .end(done);
      });

      it('Should create a new organization with one pair key/secret, and use that pair to sign a request for a protected resource', function (done) {
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.del('/test/protected-apikey')
          .set('Authorization', authHeader)
          .expect(200)
          .end(done);
      });
    });

    describe('PUT Method', function () {
      it('Should return 401 (Authorization is required/Unauthorized)', function (done) {
        zoo.api.put('/test/protected-apikey')
          .send(obj)
          .expect(401)
          .end(done);
      });

      it('Should return 401 (Invalid API KEY)', function (done) {
        req.body = obj;
        var authHeader = 'WNS AASDLFKJASLDKFJALSKD:' + zoo.security.sign(req, 'ASKDLFJALKSDFJALSKDJFALSKDJFALKSDFJ');
        zoo.api.put('/test/protected-apikey')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(401)
          .end(done);
      });

      it('Should return 400 (Invalid Signature: eg. URL tampering)', function (done) {
        req.body = obj;
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.put('/test/protected-apikey?param=1')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(400)
          .end(done);
      });

      it('Should create a new organization with one pair key/secret, and use that pair to sign a request for a protected resource', function (done) {
        req.body = obj;
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.put('/test/protected-apikey')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(200)
          .end(done);
      });
    });

    describe('POST Method', function () {
      it('Should return 401 (Authorization is required/Unauthorized)', function (done) {
        zoo.api.post('/test/protected-apikey')
          .send(obj)
          .expect(401)
          .end(done);
      });

      it('Should return 401 (Invalid API KEY)', function (done) {
        req.body = obj;
        var authHeader = 'WNS AASDLFKJASLDKFJALSKD:' + zoo.security.sign(req, 'ASKDLFJALKSDFJALSKDJFALSKDJFALKSDFJ');
        zoo.api.post('/test/protected-apikey')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(401)
          .end(done);
      });

      it('Should return 400 (Invalid Signature: eg. URL tampering)', function (done) {
        req.body = obj;
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.post('/test/protected-apikey?param=1')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(400)
          .end(done);
      });

      it('Should create a new organization with one pair key/secret, and use that pair to sign a request for a protected resource', function (done) {
        req.body = obj;
        var authHeader = 'WNS ' + pair1.key + ':' + zoo.security.sign(req, pair1.secret);
        zoo.api.post('/test/protected-apikey')
          .send(obj)
          .set('Authorization', authHeader)
          .expect(200)
          .end(done);
      });
    });

  });

});