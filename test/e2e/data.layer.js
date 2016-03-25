/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*global zoo, expect */
/*jshint -W030 */
"use strict";

var Chance = require('chance');

describe('API data layer', function () {

  describe('General', function () {
    it('Should return 200 mongo connection success', function (done) {
      zoo.api.get('/test/mongo-connection').expect(200, done);
    });

    it('Should return error trying to save duplicate email', function (done) {

      var chance = new Chance();
      var user = {
        email: chance.email(),
        password: chance.string()
      };

      // Create user
      zoo.api.post('/test/user')
        .send(user)
        .end(function (err) {
          expect(err).to.be.null;
          // Create user
          zoo.api.post('/test/user').send(user).expect(400, done);
        });
    });
  });

});