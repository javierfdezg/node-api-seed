/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var util = require('../../src/lib/util'),
  ObjectID = require('mongodb').ObjectID,
  express = require('express'),
  config = require('../../src/config/params');

describe('Model Validations against JSON Schema', function () {

  var validUser = {
    organization: new ObjectID(),
    fullName: 'John Doe',
    password: 'As3cr3tPass',
    email: 'john@doe.com',
    role: 0x100
  };
  var Users;

  before(function (done) {
    Users = require('../../src/lib/data')(express(), config.data, function (err) {
      // No data connection available
      if (err) {
        winston.error(err.toString());
      } else {
        Users = require('../../src/lib/data').Users;
        done();
      }
    })
  });

  describe('User validation', function () {

    it('Should not fail if user is valid', function (done) {
      var user = zoo.clone(validUser);
      var validation = Users.validateSchema(user);
      expect(validation.valid).to.be.true;
      done();
    });

    describe('Property exists', function () {

      it('Should fail if no organization is present', function (done) {
        var user = zoo.clone(validUser);
        delete user["organization"];
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if no fullName is present', function (done) {
        var user = zoo.clone(validUser);
        delete user["fullName"];
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if no password is present', function (done) {
        var user = zoo.clone(validUser);
        delete user["password"];
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if no email is present', function (done) {
        var user = zoo.clone(validUser);
        delete user["email"];
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if no role is present', function (done) {
        var user = zoo.clone(validUser);
        delete user["role"];
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

    });

    describe('Property type', function () {

      it('Should fail if organization is not an object', function (done) {
        var user = zoo.clone(validUser);
        user.organization = 3;
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if fullName is not a string', function (done) {
        var user = zoo.clone(validUser);
        user.fullName = {
          name: "John",
          surname: "Doe"
        };
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if password is not string', function (done) {
        var user = zoo.clone(validUser);
        user.password = function () {
          return "As3cr3tPass";
        };
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if email is not a string', function (done) {
        var user = zoo.clone(validUser);
        user.email = 12.8;
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if role is not an integer number', function (done) {
        var user = zoo.clone(validUser);
        user.role = 2.9;
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

    });

    describe('Property format', function () {

      it('Should fail if organization is not a MongoDB ObjectID', function (done) {
        var user = zoo.clone(validUser);
        user.organization = {};
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if fullName has not at least 3 characters long', function (done) {
        var user = zoo.clone(validUser);
        user.fullName = "NO";
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if password has not at least 8 characters long', function (done) {
        var user = zoo.clone(validUser);
        user.password = "short";
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if email is not a valid email', function (done) {
        var user = zoo.clone(validUser);
        user.password = "johndoe";
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

      it('Should fail if role is not an available role', function (done) {
        var user = zoo.clone(validUser);
        user.role = 13;
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.not.be.true;
        done();
      });

    });

  });

});