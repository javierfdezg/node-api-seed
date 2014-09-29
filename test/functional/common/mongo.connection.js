/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent');
var apiEndPoint = "http://127.0.0.1:4000/";

describe('API data layer', function () {

  it('Should return 200 mongo connection success', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .end(function (err, res) {
        if (!res.error) {
          done();
        }
      });
  });

});