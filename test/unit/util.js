/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var util = require('../../src/lib/util');
var expect = require('expect.js');

describe('Util module unit tests', function () {

  describe('Hasher utility (strong password encryption)', function () {

    it('should generate random password, hash it, and then be able to validate it (with generated salt)', function () {

      util.hasher({}, function (err, opts) {
        var encryptedPassword = opts.key;
        if (err) {
          console.log('Error encrypting password');
        } else {
          util.hasher({
            plainText: opts.plainText,
            salt: opts.salt
          }, function (err, opts2) {
            if (err) {
              console.log('Error encrypting password');
            } else {
              expect(opts2.key).to.be(encryptedPassword);
            }
          });
        }
      });

    });

    it('should hash password and then be able to validate it (with generated salt)', function () {
      util.hasher({
        plainText: 'this is a secret password'
      }, function (err, opts) {
        var encryptedPassword = opts.key;
        if (err) {
          console.log('Error encrypting password');
        } else {
          util.hasher({
            plainText: 'this is a secret password',
            salt: opts.salt
          }, function (err, opts2) {
            if (err) {
              console.log('Error encrypting password');
            } else {
              expect(opts2.key).to.be(encryptedPassword);
            }
          });
        }
      });
    });

  });

});