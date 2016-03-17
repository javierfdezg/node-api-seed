/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var util = require('../../src/lib/util'),
  security = require('../../src/lib/security'),
  ObjectID = require('mongodb').ObjectID,
  Chance = require('chance');

describe('Util module unit tests', function () {

  describe('hasher', function () {

    it('Should generate random password, hash it, and then be able to validate it (with generated salt)', function (done) {
      util.hasher({}, function (err, opts) {
        var encryptedPassword = opts.key;
        expect(err).to.be.null;
        util.hasher({
          plainText: opts.plainText,
          salt: opts.salt
        }, function (err, opts2) {
          expect(err).to.be.null;
          expect(opts2.key).to.equal(encryptedPassword);
          done();
        });
      });

    });

    it('Should hash password and then be able to validate it (with generated salt)', function (done) {
      util.hasher({
        plainText: 'this is a secret password'
      }, function (err, opts) {
        var encryptedPassword = opts.key;
        expect(err).to.be.null;
        util.hasher({
          plainText: 'this is a secret password',
          salt: opts.salt
        }, function (err, opts2) {
          expect(err).to.be.null;
          expect(opts2.key).to.equal(encryptedPassword);
          done();
        });
      });
    });

  });

  describe('validatePassword', function () {
    it('Should generate random password, hash it, and then be able to validate it (with generated salt)', function (done) {
      util.hasher({}, function (err, opts) {
        var encriptedPassword = opts.key;
        expect(err).to.be.null;
        util.validatePassword(opts.plainText, encriptedPassword, opts.salt, function (err, equal) {
          expect(err).to.be.null;
          expect(equal).to.be.true;
          done();
        });
      });
    });
  });

  describe('randomToken', function () {
    it('Should generate four diferent random tokens', function (done) {
      util.randomToken(function (err, token1) {
        expect(err).to.be.null;
        util.randomToken(function (err, token2) {
          expect(err).to.be.null;
          util.randomToken(function (err, token3) {
            expect(err).to.be.null;
            util.randomToken(function (err, token4) {
              expect(err).to.be.null;
              expect(token1).to.not.equal(token2);
              expect(token1).to.not.equal(token3);
              expect(token1).to.not.equal(token4);
              done();
            });
          });
        });
      });
    });
  });

  describe('allow', function () {
    it('Root Should be allowed to run actions of any access level', function (done) {
      var accessLevel;
      var user = {
        role: security.userRoles.root
      }
      for (accessLevel in security.accessLevels) {
        expect(util.allow(user, security.accessLevels[accessLevel])).to.be.true;
      }
      done();
    });

    it('Public users Should be allowed to run action of public access level', function (done) {
      var accessLevel;
      var user = {
        role: security.userRoles.public
      }
      for (accessLevel in security.accessLevels) {
        if (accessLevel === 'public') {
          expect(util.allow(user, security.accessLevels[accessLevel])).to.be.true;
        } else {
          expect(util.allow(user, security.accessLevels[accessLevel])).to.be.false;
        }
      }
      done();
    })
  });

  describe('owns', function () {
    it('Should return always true for root', function (done) {
      expect(util.owns({
        user: {
          role: security.accessLevels.root
        }
      }, {
        organization: new ObjectID()
      })).to.be.true;
      done();
    });

    it('Should return true it user organization is the same than the entity organization', function (done) {
      var organizationId = new ObjectID();
      expect(util.owns({
        organization: organizationId
      }, {
        organization: organizationId
      })).to.be.true;
      done();
    });

    it('Should return false it user organization is not the same than the entity organization', function (done) {
      expect(util.owns({
        organization: new ObjectID()
      }, {
        organization: new ObjectID()
      })).to.be.false;
      done();
    });
  });

  describe('beforeLastIndex', function () {
    it('Should remove extension from a file', function (done) {
      expect(util.beforeLastIndex('file-name.jpg', '.')).to.equal('file-name');
      done();
    });
    it('Should remove extension from a file containing dots in its name', function (done) {
      expect(util.beforeLastIndex('file.name.png', '.')).to.equal('file.name');
      done();
    });
    it('Should remove extension from a file containing dots in its name', function (done) {
      expect(util.beforeLastIndex('long.file.name.png', '.')).to.equal('long.file.name');
      done();
    });
    it('Should be remove last level in an URL', function (done) {
      expect(util.beforeLastIndex('http://www.domain.com/path1/path2', '/')).to.equal('http://www.domain.com/path1');
      done();
    });
  });

  describe('fileToCollectionName', function () {
    it('Should get a valid collection name for various files', function (done) {
      expect(util.fileToCollectionName('file-name.jpg', '.')).to.equal('file_name');
      expect(util.fileToCollectionName('User_company.jpg', '.')).to.equal('user_company');
      expect(util.fileToCollectionName('File Name.jpg', '.')).to.equal('file_name');
      expect(util.fileToCollectionName('file_name-Company.jpg', '.')).to.equal('file_name_company');
      expect(util.fileToCollectionName('file-name  Company', '.')).to.equal('file_name_company');
      done();
    });
  });

  describe('collectionToClassName', function () {
    it('Should get a Pascal Case Class Name for various collection names', function (done) {
      expect(util.collectionToClassName('file')).to.equal('File');
      expect(util.collectionToClassName('file_name')).to.equal('FileName');
      expect(util.collectionToClassName('user_company')).to.equal('UserCompany');
      expect(util.collectionToClassName('file_name_company')).to.equal('FileNameCompany');
      done();
    });
  });

  describe('stringToBase64', function () {

    var chance = new Chance();

    it('Should get a Base64 string from random string (I)', function (done) {
      expect(util.stringToBase64(chance.string({
        length: 10
      }))).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
      done();
    });
    it('Should get a Base64 string from random string (II)', function (done) {
      expect(util.stringToBase64(chance.string({
        length: 12
      }))).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
      done();
    });
    it('Should get a Base64 string from random string (III)', function (done) {
      expect(util.stringToBase64(chance.string({
        length: 8
      }))).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
      done();
    });
  });

  describe('isEmptyObject', function () {
    it('Should return true for {}', function (done) {
      expect(util.isEmptyObject({})).to.be.true;
      done();
    });

    it('Should return true for null', function (done) {
      expect(util.isEmptyObject(null)).to.be.true;
      done();
    });

    it('Should return true for undefined', function (done) {
      expect(util.isEmptyObject()).to.be.true;
      done();
    });

    it('Should return false for non-empty object', function (done) {
      expect(util.isEmptyObject({
        name: 'Name'
      })).to.be.false;
      done();
    });
  });

  describe('isEmptyObject', function () {
    it('Should return 20 integers between 0 and 20', function (done) {
      var i;
      for (i = 0; i < 20; i++) {
        expect(util.randomIntegerBetween(0, 20)).to.be.within(0, 20);
      }
      done();
    });

    it('Should return 10 integers between 5 and 10', function (done) {
      var i;
      for (i = 0; i < 10; i++) {
        expect(util.randomIntegerBetween(5, 10)).to.be.within(5, 10);
      }
      done();
    });

    it('Should return 30 integers between -121 and -115', function (done) {
      var i;
      for (i = 0; i < 30; i++) {
        expect(util.randomIntegerBetween(-121, -115)).to.be.within(-121, -115);
      }
      done();
    });
  });

  describe('randomOldDate', function () {
    it('Should generate 40 random dates before now', function (done) {
      var i;
      for (i = 0; i < 40; i++) {
        expect(util.randomOldDate()).beforeTime(new Date());
      }
      done();
    });
  });

  describe('randomDateInFuture', function () {
    it('Should generate 40 random dates after now', function (done) {
      var i;
      for (i = 0; i < 40; i++) {
        // Add 60 seconds of increment (avoid possible errors if date is very close to now)
        expect(util.randomDateInFuture(60)).afterTime(new Date());
      }
      done();
    });
  });

  describe('checkEmailDomain', function () {
    it('Should succeed', function (done) {
      expect(util.checkEmailDomain('email@gmail.com', 'gmail.com')).to.be.true;
      done();
    });

    it('Should fail', function (done) {
      expect(util.checkEmailDomain('email@gmail.com', 'hotmail.com')).to.be.false;
      done();
    });
  });

});