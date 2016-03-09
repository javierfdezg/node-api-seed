/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var Chance = require('chance');

describe('API Users Services', function () {

  var chance = new Chance();
  var organization;
  var rootUser = {
    user: null,
    token: null,
    createdUser: null
  };
  var adminUser = {
    user: null,
    token: null,
    createdUser: null
  };
  var readOnlyUser = {
    user: null,
    token: null
  };

  /**
   * Create Three different user profiles and login
   */
  before(function (done) {
    // Root User
    zoo.createUserAndLogin(zoo.security.userRoles.root, function (err, createdUser, createdToken) {
      expect(err).to.be.null;
      rootUser.user = createdUser;
      rootUser.token = createdToken;
      // Admin user
      zoo.createUserAndLogin(zoo.security.userRoles.admin, function (err, createdUser, createdToken) {
        expect(err).to.be.null;
        adminUser.user = createdUser;
        adminUser.token = createdToken;
        // Read-only user
        zoo.createUserAndLogin(zoo.security.userRoles.readonly, function (err, createdUser, createdToken) {
          expect(err).to.be.null;
          readOnlyUser.user = createdUser;
          readOnlyUser.token = createdToken;
          // Create test organization
          zoo.createOrganization(function (err, org) {
            expect(err).to.be.null;
            organization = org;
            done();
          });
        });
      });
    });
  });

  describe('POST /users', function () {

    describe('Request by Root user', function () {
      it('Should fail if not organization is specified', function (done) {
        // Create user
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + rootUser.token)
          .send({
            email: chance.email(),
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 8
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(400)
          .end(done);
      });
      it('Should fail if is not a valid User', function (done) {
        // Create invalid user (password is too short)
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + rootUser.token)
          .send({
            organization: organization._id,
            email: chance.email(),
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 2
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(400)
          .end(done);
      });
      it('Should create a new User for specified organization', function (done) {
        // Create valid user
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + rootUser.token)
          .send({
            organization: organization._id,
            email: chance.email(),
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 8
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(201)
          .end(done);
      });
    });

    describe('Request by Admin user', function () {
      it('Should create a new User for the same organization', function (done) {
        // Create valid user
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + adminUser.token)
          .send({
            email: chance.email(),
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 8
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(201)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('organization', adminUser.user.organization);
            done();
          });
      });
      it('Should fail if is email is already taken', function (done) {
        // Create invalid user (email taken)
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + adminUser.token)
          .send({
            email: adminUser.user.email, // taken email
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 8
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(400)
          .end(done);
      });
    });

    describe('Request by Read-only user', function () {
      it('Should fail trying to create a new User (Unauthorized)', function (done) {
        // Create user
        zoo.api.post('/users')
          .set('Authorization', 'Bearer ' + readOnlyUser.token)
          .send({
            email: chance.email(),
            fullName: chance.string({
              length: 8
            }),
            password: chance.string({
              length: 8
            }),
            role: zoo.security.userRoles.readonly,
            delete_from: new Date()
          })
          .expect(401)
          .end(done);
      });
    });

    describe('Request by Application (Key/Secret)', function () {
      it('Should create a new User for the organization that owns the API key used', function (done) {
        var user = {
          email: chance.email(),
          fullName: chance.string({
            length: 8
          }),
          password: chance.string({
            length: 8
          }),
          role: zoo.security.userRoles.readonly,
          delete_from: new Date()
        };
        var req = {
          hostname: zoo.host,
          originalUrl: '/users',
          body: user
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        // Create user
        zoo.api.post('/users')
          .set('Authorization', authHeader)
          .send(user)
          .expect(201)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.body).to.have.property('organization', organization._id);
            done();
          });
      });
    });

  });

  describe('GET /users/{id}', function () {
    var user;

    before(function (done) {
      zoo.createUser(zoo.security.userRoles.admin, function (err, createdUser, createdToken) {
        expect(err).to.be.null;
        user = createdUser;
        done();
      });
    });

    describe('Request by Root user', function () {
      it('Should get an existing user', function (done) {
        zoo.api.get('/users/' + user._id)
          .set('Authorization', 'Bearer ' + rootUser.token)
          .expect(200)
          .end(done);
      });

      it('Should get another existing user', function (done) {
        zoo.api.get('/users/' + adminUser.user._id)
          .set('Authorization', 'Bearer ' + rootUser.token)
          .expect(200)
          .end(done);
      });

      it('Should fail trying to get an unexisting user', function (done) {
        zoo.api.get('/users/000000000000000000000000')
          .set('Authorization', 'Bearer ' + rootUser.token)
          .expect(404)
          .end(done);
      });
    });

    describe('Request by Admin user', function () {
      it('Should get its own user', function (done) {
        zoo.api.get('/users/' + adminUser.user._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .expect(200)
          .end(done);
      });

      it('Should fail trying to get an existing user from other organization', function (done) {
        zoo.api.get('/users/' + user._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Read-only user', function () {
      it('Should fail trying to get an existing user from other organization', function (done) {
        zoo.api.get('/users/' + user._id)
          .set('Authorization', 'Bearer ' + readOnlyUser.token)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Application (Key/Secret)', function () {
      var otherUser;

      before(function (done) {
        zoo.createUserInOrganization(zoo.security.userRoles.admin, organization._id, function (err, createdUser) {
          expect(err).to.be.null;
          otherUser = createdUser;
          done();
        });
      });

      it('Should get an user from the organization that owns the API key used', function (done) {
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + otherUser._id
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        zoo.api.get('/users/' + otherUser._id)
          .set('Authorization', authHeader)
          .expect(200)
          .end(done);
      });
    });

  });

  describe('PUT /users/{id}', function () {

    describe('Request by Root user', function () {
      var user;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          done();
        });
      });

      it('Should update an user from any organization', function (done) {
        zoo.api.put('/users/' + user._id)
          .set('Authorization', 'Bearer ' + rootUser.token)
          .send(user)
          .expect(200)
          .end(done);
      });
      it('Should be able to change user organization', function (done) {
        user.organization = organization._id;
        zoo.api.put('/users/' + user._id)
          .set('Authorization', 'Bearer ' + rootUser.token)
          .send(user)
          .expect(200)
          .end(done);
      });
    });

    describe('Request by Admin user', function () {
      var user, orgUser;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          zoo.createUserInOrganization(zoo.security.userRoles.readonly, adminUser.user.organization, function (err, createdUser) {
            expect(err).to.be.null;
            orgUser = createdUser;
            done();
          });
        });
      });

      it('Should update an user from its organization', function (done) {
        zoo.api.put('/users/' + orgUser._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .send(orgUser)
          .expect(200)
          .end(done);
      });
      it('Should not update an user from other organization', function (done) {
        zoo.api.put('/users/' + user._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .send(user)
          .expect(403)
          .end(done);
      });
      it('Should not be able to change user organization', function (done) {
        orgUser.organization = organization._id;
        zoo.api.put('/users/' + orgUser._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .send(orgUser)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Read-only user', function () {
      var user;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          done();
        });
      });
      it('Should not update an user', function (done) {
        zoo.api.put('/users/' + user._id)
          .set('Authorization', 'Bearer ' + readOnlyUser.token)
          .send(user)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Application (Key/Secret)', function () {
      var user, orgUser;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          zoo.createUserInOrganization(zoo.security.userRoles.readonly, organization._id, function (err, createdUser) {
            expect(err).to.be.null;
            orgUser = createdUser;
            done();
          });
        });
      });

      it('Should update an user from its organization', function (done) {
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + orgUser._id,
          body: orgUser
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        // Create user
        zoo.api.put('/users/' + orgUser._id)
          .set('Authorization', authHeader)
          .send(orgUser)
          .expect(200)
          .end(done);
      });
      it('Should not update organization of an user', function (done) {
        // Update user's organization (forbidden)
        orgUser.organization = user.organization;
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + orgUser._id,
          body: orgUser
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        // Create user
        zoo.api.put('/users/' + orgUser._id)
          .set('Authorization', authHeader)
          .send(orgUser)
          .expect(403)
          .end(done);
      });
      it('Should not update an user from other organization', function (done) {
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + user._id,
          body: user
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        // Create user
        zoo.api.put('/users/' + user._id)
          .set('Authorization', authHeader)
          .send(user)
          .expect(403)
          .end(done);
      });

    });

    xit('Avoid update password/salt AND ¿Implement partial updates?', function (done) {

    });
  });

  describe('DELETE /users/{id}', function () {

    describe('Request by Root user', function () {
      var user;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          done();
        });
      });

      it('Should delete an user from any organization', function (done) {
        // Delete user
        zoo.api.del('/users/' + user._id)
          .set('Authorization', 'Bearer ' + rootUser.token)
          .expect(204)
          .end(done);
      });
    });

    describe('Request by Admin user', function () {
      var user, orgUser;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          zoo.createUserInOrganization(zoo.security.userRoles.readonly, adminUser.user.organization, function (err, createdUser) {
            expect(err).to.be.null;
            orgUser = createdUser;
            done();
          });
        });
      });

      it('Should delete an user from its organization', function (done) {
        zoo.api.del('/users/' + orgUser._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .expect(204)
          .end(done);
      });
      it('Should not delete an user from other organization', function (done) {
        zoo.api.del('/users/' + user._id)
          .set('Authorization', 'Bearer ' + adminUser.token)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Read-only user', function () {
      var user;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          done();
        });
      });
      it('Should not delete an user', function (done) {
        zoo.api.del('/users/' + user._id)
          .set('Authorization', 'Bearer ' + readOnlyUser.token)
          .expect(403)
          .end(done);
      });
    });

    describe('Request by Application (Key/Secret)', function () {
      var user, orgUser;

      beforeEach(function (done) {
        zoo.createUser(zoo.security.userRoles.readonly, function (err, usr) {
          expect(err).to.be.null;
          user = usr;
          zoo.createUserInOrganization(zoo.security.userRoles.readonly, organization._id, function (err, createdUser) {
            expect(err).to.be.null;
            orgUser = createdUser;
            done();
          });
        });
      });

      it('Should delete an user from its organization', function (done) {
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + orgUser._id
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        zoo.api.del('/users/' + orgUser._id)
          .set('Authorization', authHeader)
          .expect(204)
          .end(done);
      });
      it('Should not delete an user from other organization', function (done) {
        var req = {
          hostname: zoo.host,
          originalUrl: '/users/' + user._id
        };
        var authHeader = 'WNS ' + organization.apiKeys[0].key + ':' + zoo.security.sign(req, organization.apiKeys[0].secret);
        zoo.api.del('/users/' + user._id)
          .set('Authorization', authHeader)
          .expect(403)
          .end(done);
      });
    });

  });

});