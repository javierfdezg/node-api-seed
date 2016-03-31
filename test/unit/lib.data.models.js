/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo, expect */
/*jshint -W030 */
"use strict";

var winston = require('winston'),
  security = require('../../src/lib/security'),
  ObjectID = require('mongodb').ObjectID,
  config = require('../../src/config/params'),
  validations = require('../../src/lib/data/validations'),
  transformations = require('../../src/lib/data/transformations');

describe('Model Validations against JSON Schema', function () {

  var validUser = {
    organization: (new ObjectID()).toString(),
    fullName: 'John Doe',
    password: 'As3cr3tPass',
    email: 'john@doe.com',
    role: 0x100
  };
  var Users;
  var UsersRoot;
  var UsersAdmin;

  before(function (done) {
    require('../../src/lib/data')(config.data, function (err) {
      // No data connection available
      if (err) {
        winston.error(err.toString());
      } else {
        Users = require('../../src/lib/data').Users;
        UsersRoot = require('../../src/lib/data').UsersRoot;
        UsersAdmin = require('../../src/lib/data').UsersAdmin;
        done();
      }
    });
  });

  describe('Transformation Helper', function () {
    var object = {
      id: new ObjectID(),
      name: 'Nombre',
      age: 18,
      created_at: new Date()
    };

    var transform = {
      properties: {
        id: {
          transform: transformations.mongoObjectID
        },
        created_at: {
          transform: transformations.javascriptDate
        }
      }
    };

    var cobject = {
      id: new ObjectID(),
      name: 'Nombre',
      age: 18,
      created_at: new Date(),
      updated_at: new Date(),
      organization: {
        id: new ObjectID(),
        name: 'Apple',
        created_at: new Date(),
        updated_at: new Date(),
        employees: 8302,
        locations: [{
          location: 'California',
          created_at: new Date(),
          id: new ObjectID(),
        }, {
          location: 'New York',
          created_at: new Date(),
          id: new ObjectID()
        }]
      },
      targets: [new ObjectID(), new ObjectID(), new ObjectID(), new ObjectID(), new ObjectID()],
      deliveries: [{
        mta_status: 'not-delivered',
        send_from: new Date(),
        content: 'Hello <b>Usuario</b>, welcome to bla bla bla'
      }]
    };

    var ctransform = {
      properties: {
        id: {
          transform: transformations.mongoObjectID
        },
        created_at: {
          transform: transformations.javascriptDate
        },
        updated_at: {
          transform: transformations.javascriptDate
        },
        organization: {
          properties: {
            id: {
              transform: transformations.mongoObjectID
            },
            created_at: {
              transform: transformations.javascriptDate
            },
            updated_at: {
              transform: transformations.javascriptDate
            },
            locations: {
              properties: {
                id: {
                  transform: transformations.mongoObjectID
                },
                created_at: {
                  transform: transformations.javascriptDate
                },
                updated_at: {
                  transform: transformations.javascriptDate
                }
              }
            }
          }
        },
        targets: {
          transform: transformations.arrayMongoObjectID
        },
        deliveries: {
          properties: {
            confirmed_by_mta: {
              transform: transformations.javascriptDate
            },
            delivered_to_mta: {
              transform: transformations.javascriptDate
            },
            send_from: {
              transform: transformations.javascriptDate
            }
          }
        }
      }
    };

    it('Should parse or transform a simple object containing ObjectIDs and Dates', function (done) {
      var jsonObject = JSON.stringify(object);
      var parsedObject = JSON.parse(jsonObject);
      transformations.transform(parsedObject, transform);
      expect(parsedObject).to.deep.equal(object);
      done();
    });

    it('Should parse or transform an complex object containing ObjectIDs and Dates', function (done) {
      var jsonObject = JSON.stringify(cobject);
      var parsedObject = JSON.parse(jsonObject);
      transformations.transform(parsedObject, ctransform);
      expect(parsedObject).to.deep.equal(cobject);
      done();
    });
  });

  describe('Validations Helper', function () {
    describe('validateSchema', function () {
      it('Should not fail if user is valid', function (done) {
        var user = zoo.clone(validUser);
        var validation = Users.validateSchema(user);
        expect(validation.valid).to.be.true;
        done();
      });

      describe('Property exists', function () {

        it('Should fail if no organization is present', function (done) {
          var user = zoo.clone(validUser);
          delete user.organization;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if no fullName is present', function (done) {
          var user = zoo.clone(validUser);
          delete user.fullName;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if no password is present', function (done) {
          var user = zoo.clone(validUser);
          delete user.password;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if no email is present', function (done) {
          var user = zoo.clone(validUser);
          delete user.email;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if no role is present', function (done) {
          var user = zoo.clone(validUser);
          delete user.role;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

      });

      describe('Property type', function () {

        it('Should fail if organization is not an object', function (done) {
          var user = zoo.clone(validUser);
          user.organization = 3;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if fullName is not a string', function (done) {
          var user = zoo.clone(validUser);
          user.fullName = {
            name: "John",
            surname: "Doe"
          };
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if password is not string', function (done) {
          var user = zoo.clone(validUser);
          user.password = function () {
            return "As3cr3tPass";
          };
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if email is not a string', function (done) {
          var user = zoo.clone(validUser);
          user.email = 12.8;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if role is not an integer number', function (done) {
          var user = zoo.clone(validUser);
          user.role = 2.9;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

      });

      describe('Property format', function () {

        it('Should fail if organization is not a MongoDB ObjectID', function (done) {
          var user = zoo.clone(validUser);
          user.organization = {};
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if fullName has not at least 3 characters long', function (done) {
          var user = zoo.clone(validUser);
          user.fullName = "NO";
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if password has not at least 8 characters long', function (done) {
          var user = zoo.clone(validUser);
          user.password = "short";
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if email is not a valid email', function (done) {
          var user = zoo.clone(validUser);
          user.password = "johndoe";
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if role is not an available role', function (done) {
          var user = zoo.clone(validUser);
          user.role = 13;
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

        it('Should fail if organization is not a valid ObjectID', function (done) {
          var user = zoo.clone(validUser);
          user.organization = {
            name: 'Name'
          };
          var validation = Users.validateSchema(user);
          expect(validation.valid).to.be.false;
          done();
        });

      });
    });

    describe('hexadecimalStringObjectID', function () {
      it('Should validate a string representation of an ObjectID', function (done) {
        expect(validations.hexadecimalStringObjectID((new ObjectID()).toString())).to.be.true;
        done();
      });

      it('Should not validate a 12 length string', function (done) {
        expect(validations.hexadecimalStringObjectID((new ObjectID()).toString().slice(0, 12))).to.be.false;
        done();
      });

      it('Should not validate a non-hexadecimal 24 char length string', function (done) {
        expect(validations.hexadecimalStringObjectID("123456789012345gfaaa0120")).to.be.false;
        done();
      });

      it('Should not validate a number', function (done) {
        expect(validations.hexadecimalStringObjectID(12)).to.be.false;
        done();
      });
    });

    describe('hexadecimalArrayObjectID', function () {
      it('Should validate an Array containing valid String ObjectIDs', function (done) {
        var arr = [(new ObjectID()).toString(), (new ObjectID()).toString(), (new ObjectID()).toString()];
        expect(validations.hexadecimalArrayObjectID(arr)).to.be.true;
        done();
      });

      it('Should not validate an Array containing an Integer', function (done) {
        var arr = [(new ObjectID()).toString(), 12, (new ObjectID()).toString()];
        expect(validations.hexadecimalArrayObjectID(arr)).to.be.false;
        done();
      });

      it('Should not validate an Array containing a non-valid ObjectId string representation', function (done) {
        var arr = [(new ObjectID()).toString(), (new ObjectID()).toString(), "123456789012345gfaaa0120"];
        expect(validations.hexadecimalArrayObjectID(arr)).to.be.false;
        done();
      });
    });

    describe('ObjectID', function () {
      it('Should validate an ObjectID', function (done) {
        expect(validations.ObjectID(new ObjectID())).to.be.true;
        done();
      });

      it('Should not validate a plain JS Object', function (done) {
        expect(validations.ObjectID({
          name: 'John',
          surname: 'Doe'
        })).to.be.false;
        done();
      });

      it('Should not validate a number', function (done) {
        expect(validations.ObjectID(123)).to.be.false;
        done();
      });

      it('Should not validate a boolean', function (done) {
        expect(validations.ObjectID(true)).to.be.false;
        done();
      });
    });
  });

  describe('Submodel Validations Helper', function () {
    describe('validateSchema', function () {
      it('Should not fail if user is valid UsersRoot Model', function (done) {
        var user = zoo.clone(validUser);
        user.role = security.userRoles.root;
        var validation = UsersRoot.validateSchema(user);
        expect(validation.valid).to.be.true;
        done();
      });

      it('Should fail if user is not valid UsersRoot Model (Invalid role value)', function (done) {
        var user = zoo.clone(validUser);
        user.role = security.userRoles.admin; // Invalid role
        var validation = UsersRoot.validateSchema(user);
        expect(validation.valid).to.be.false;
        done();
      });

      it('Should not fail if user is valid UsersAdmin Model', function (done) {
        var user = zoo.clone(validUser);
        user.role = security.userRoles.admin;
        var validation = UsersAdmin.validateSchema(user);
        expect(validation.valid).to.be.true;
        done();
      });

      it('Should fail if user is not valid UsersAdmin Model (Invalid role value)', function (done) {
        var user = zoo.clone(validUser);
        user.role = security.userRoles.root; // Invalid role
        var validation = UsersAdmin.validateSchema(user);
        expect(validation.valid).to.be.false;
        done();
      });

    });
  });

});