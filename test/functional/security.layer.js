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

});