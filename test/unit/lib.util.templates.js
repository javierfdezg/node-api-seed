/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var templateUtils = require('../../src/lib/util/templates'),
  _ = require('lodash');

describe('Template Utils', function () {

  var template1 = "Hello {{ user }}, you've selected for <a href='{{ url }}'>this special offer</a>\n\n{{ greeting }}";
  var template2 = "Hello {{ user.name }}, you've selected for <a href='{{ offer.url }}'>{{ offer.name }}</a>\n\n{{ greeting }}";
  var template3 = "Hello {{ offer.user.name }}, you've selected for <a href='{{ offer.url }}'>{{ offer.name }}</a>\n\n{{ offer.greeting }}";
  var params1 = ['greeting', 'user', 'url'];
  var params2 = ['user.name', 'offer.url', 'offer.name', 'greeting'];
  var params3 = ['offer.user.name', 'offer.url', 'offer.name', 'offer.greeting'];
  var mail1 = "Hello John Doe, you've selected for <a href='http://www.example.com/token/19023741293077812093/link'>this special offer</a>\n\nKind Regards";
  var mail2 = "Hello Michael Douglas, you've selected for <a href='http://www.example.com/token/1902374129129837198232093/link'>Your special offer</a>\n\nBest Regards";
  var mail3 = "Hello Rafael Nadal, you've selected for <a href='http://www.example.com/token/982374891762384172364/link'>Rafa&#39;s offer</a>\n\nYours sincerely";
  var obj1 = {
    user: 'John Doe',
    url: 'http://www.example.com/token/19023741293077812093/link',
    greeting: 'Kind Regards'
  };
  var obj2 = {
    user: {
      name: 'Michael Douglas',
      email: 'michael@example.com'
    },
    offer: {
      url: 'http://www.example.com/token/1902374129129837198232093/link',
      name: 'Your special offer'
    },
    greeting: 'Best Regards'
  };
  var obj3 = {
    offer: {
      user: {
        name: 'Rafael Nadal',
        email: 'rafa@example.com'
      },
      url: 'http://www.example.com/token/982374891762384172364/link',
      name: "Rafa's offer",
      greeting: 'Yours sincerely'
    }
  };

  describe('extractParams', function () {

    it('Should extract one-level parameters from html template', function (done) {
      expect(templateUtils.extractParams(template1)).to.include.members(params1);
      expect(templateUtils.extractParams(template1)).to.have.lengthOf(params1.length);
      done();
    });

    it('Should extract one and two-level parameters from html template', function (done) {
      expect(templateUtils.extractParams(template2)).to.include.members(params2);
      expect(templateUtils.extractParams(template2)).to.have.lengthOf(params2.length);
      done();
    });

    it('Should extract n-level parameters from html template', function (done) {
      expect(templateUtils.extractParams(template3)).to.include.members(params3);
      expect(templateUtils.extractParams(template3)).to.have.lengthOf(params3.length);
      done();
    });

    it('Should extract n-level parameters from 3 html templates in one unique call', function (done) {
      var union = _.union(params1, params2, params3);
      expect(templateUtils.extractParams(template1, template2, template3)).to.include.members(union);
      expect(templateUtils.extractParams(template1, template2, template3)).to.have.lengthOf(union.length);
      done();
    });

  });

  describe('validateParams', function () {

    it('Should validate obj1 for template1', function (done) {
      expect(templateUtils.validateParams(obj1, params1)).to.be.true;
      done();
    });

    it('Should validate obj2 for template2', function (done) {
      expect(templateUtils.validateParams(obj2, params2)).to.be.true;
      done();
    });

    it('Should validate obj3 for template3', function (done) {
      expect(templateUtils.validateParams(obj3, params3)).to.be.true;
      done();
    });

    it('Should not validate obj1 for template2', function (done) {
      expect(templateUtils.validateParams(obj1, params2)).to.be.false;
      done();
    });

    it('Should not validate obj1 for template3', function (done) {
      expect(templateUtils.validateParams(obj1, params3)).to.be.false;
      done();
    });

    it('Should not validate obj2 for template1', function (done) {
      expect(templateUtils.validateParams(obj2, params1)).to.be.false;
      done();
    });

    it('Should not validate obj2 for template3', function (done) {
      expect(templateUtils.validateParams(obj2, params3)).to.be.false;
      done();
    });

    it('Should not validate obj3 for template1', function (done) {
      expect(templateUtils.validateParams(obj3, params1)).to.be.false;
      done();
    });

    it('Should not validate obj3 for template2', function (done) {
      expect(templateUtils.validateParams(obj3, params2)).to.be.false;
      done();
    });

  });

  describe('populate', function () {

    it('Should populate template1 with obj1 and the result should be equal to mail1', function (done) {
      expect(templateUtils.populate(template1, obj1)).to.equal(mail1);
      done();
    });

    it('Should populate template2 with obj2 and the result should be equal to mail2', function (done) {
      expect(templateUtils.populate(template2, obj2)).to.equal(mail2);
      done();
    });

    it('Should populate template3 with obj3 and the result should be equal to mail3', function (done) {
      expect(templateUtils.populate(template3, obj3)).to.equal(mail3);
      done();
    });

  });

});