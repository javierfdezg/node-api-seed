/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo, expect */
/*jshint -W030 */
"use strict";

describe('API security layer', function () {

  describe('Bearer Token', function () {

    var user;
    var token;

    /**
     * Create a new User an Login
     */
    before(function (done) {
      // Create organization
      zoo.createUserAndLogin(zoo.security.userRoles.admin, function (err, createdUser, createdToken) {
        if (err) {
          done(err);
        } else {
          user = createdUser;
          token = createdToken;
          done();
        }
      });
    });

    it('Should be able to get a protected resource', function (done) {
      zoo.api.get('/test/protected')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.deep.property('secured.email', user.email);
          done();
        });
    });

    it('Should return 401 (Invalid token)', function (done) {
      zoo.api.get('/test/protected')
        .set('Authorization', 'Bearer invalidToken1283')
        .expect(401)
        .end(done);
    });

    it('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
      zoo.api.get('/test/protected')
        .set('Authorization', 'Besarer 12341231341d')
        .expect(403)
        .end(done);
    });

    it('Should return 403 Bad Request (Unknown authorization header. Only bearer token are supported)', function (done) {
      zoo.api.get('/test/protected')
        .set('Authorization', 'baz')
        .expect(403)
        .end(done);
    });

  });

  describe('API Key/secret', function () {
    var organization;
    var pair1;
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

    /**
     * Create an Organization with API keys
     */
    before(function (done) {
      // Create organization
      zoo.createOrganization(function (err, org) {
        expect(err).to.be.null;
        organization = org;
        pair1 = organization.apiKeys[0];
        done();
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

  describe('Authorization Access Levels', function () {

    describe('Public User', function () {

      it('Should be able to get a public resource', function (done) {
        zoo.api.get('/test/public')
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('message');
            done();
          });
      });

      it('Should not be able to get a protected resource', function (done) {
        zoo.api.get('/test/protected')
          .set('Authorization', 'Bearer ')
          .expect(401)
          .end(done);
      });

    });

    describe('Read-only User', function () {

      var roUser;
      var roToken;

      /**
       * Create a new User an Login
       */
      before(function (done) {
        // Create organization
        zoo.createUserAndLogin(zoo.security.userRoles.readonly, function (err, createdUser, createdToken) {
          expect(err).to.be.null;
          roUser = createdUser;
          roToken = createdToken;
          done();
        });
      });

      it('Should not be able to get a protected resource', function (done) {
        zoo.api.get('/test/protected')
          .set('Authorization', 'Bearer ' + roToken)
          .expect(401)
          .end(done);
      });

      it('Should be able to get a public resource', function (done) {
        zoo.api.get('/test/public')
          .set('Authorization', 'Bearer ' + roToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('message');
            done();
          });
      });

      it('Should be able to get a read-only protected resource', function (done) {
        zoo.api.get('/test/protected-readonly')
          .set('Authorization', 'Bearer ' + roToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', roUser.email);
            done();
          });
      });

    });

    describe('Admin User', function () {

      var adminUser;
      var adminToken;

      /**
       * Create a new User an Login
       */
      before(function (done) {
        // Create organization
        zoo.createUserAndLogin(zoo.security.userRoles.admin, function (err, createdUser, createdToken) {
          expect(err).to.be.null;
          adminUser = createdUser;
          adminToken = createdToken;
          done();
        });
      });

      it('Should not be able to get a root protected resource', function (done) {
        zoo.api.get('/test/protected-root')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(401)
          .end(done);
      });

      it('Should be able to get a protected resource', function (done) {
        zoo.api.get('/test/protected')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', adminUser.email);
            done();
          });
      });

      it('Should be able to get a public resource', function (done) {
        zoo.api.get('/test/public')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('message');
            done();
          });
      });

      it('Should be able to get a read-only protected resource', function (done) {
        zoo.api.get('/test/protected-readonly')
          .set('Authorization', 'Bearer ' + adminToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', adminUser.email);
            done();
          });
      });

    });

    describe('Root User', function () {

      var rootUser;
      var rootToken;

      /**
       * Create a new User an Login
       */
      before(function (done) {
        // Create organization
        zoo.createUserAndLogin(zoo.security.userRoles.root, function (err, createdUser, createdToken) {
          expect(err).to.be.null;
          rootUser = createdUser;
          rootToken = createdToken;
          done();
        });
      });

      it('Should be able to get a root protected resource', function (done) {
        zoo.api.get('/test/protected-root')
          .set('Authorization', 'Bearer ' + rootToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', rootUser.email);
            done();
          });
      });

      it('Should be able to get a protected resource', function (done) {
        zoo.api.get('/test/protected')
          .set('Authorization', 'Bearer ' + rootToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', rootUser.email);
            done();
          });
      });

      it('Should be able to get a public resource', function (done) {
        zoo.api.get('/test/public')
          .set('Authorization', 'Bearer ' + rootToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('message');
            done();
          });
      });

      it('Should be able to get a read-only protected resource', function (done) {
        zoo.api.get('/test/protected-readonly')
          .set('Authorization', 'Bearer ' + rootToken)
          .expect(200)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.deep.property('secured.email', rootUser.email);
            done();
          });
      });

    });

  });

  describe('Model Ownership Check', function () {
    xit('TODO', function () {

    });
  });

});