/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var request = require('superagent'),
  Chance = require('chance');

var apiEndPoint = "http://127.0.0.1:4000/";

describe('API i18n layer', function () {

  it('Should return 200 with message "Mongo connection success!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .set('Accept-Language', 'en;q=0.6,es-ES,es;q=0.8,ca;q=0.4,it;q=0.2,ja;q=0.2,pt;q=0.2')
      .end(function (err, res) {
        if (!res.error && res.body.message === 'Mongo connection success!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

  it('Should return 200 with message "¡Conexión con Mongo correcta!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .set('Accept-Language', 'es-ES,es;q=0.8,ca;q=0.6,en;q=0.4,it;q=0.2,ja;q=0.2,pt;q=0.2')
      .end(function (err, res) {
        if (!res.error && res.body.message === '¡Conexión con Mongo correcta!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

  it('Should return 200 with message "Conectando-se a Mongo correto!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .set('Accept-Language', 'pt;q=0.8,es-ES,es;q=0.8,ca;q=0.6,en;q=0.4,it;q=0.2,ja;q=0.2,pt;q=0.2')
      .end(function (err, res) {
        if (!res.error && res.body.message === 'Conectando-se a Mongo correto!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

  it('Should return 200 with message "Conectando-se a Mongo correto!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection')
      .set('Accept-Language', 'pt')
      .end(function (err, res) {
        if (!res.error && res.body.message === 'Conectando-se a Mongo correto!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

  it('Should return 200 with message "¡Conexión con Mongo correcta!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection/?lang=es')
      .set('Accept-Language', 'es-ES,es;q=0.8,ca;q=0.6,en;q=0.4,it;q=0.2,ja;q=0.2,pt;q=0.2')
      .end(function (err, res) {
        if (!res.error && res.body.message === '¡Conexión con Mongo correcta!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

  it('Should return 200 with message "Conectando-se a Mongo correto!"', function (done) {
    request
      .get(apiEndPoint + 'test/mongo-connection/?lang=pt')
      .set('Accept-Language', 'pt;q=0.8,es-ES,es;q=0.8,ca;q=0.6,en;q=0.4,it;q=0.2,ja;q=0.2,pt;q=0.2')
      .end(function (err, res) {
        if (!res.error && res.body.message === 'Conectando-se a Mongo correto!') {
          done();
        } else {
          console.error("RESPONSE: " + res.body.message);
        }
      });
  });

});