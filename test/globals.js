/*
 * Copyright (c) Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
/*global xit */
/*jshint -W030 */
"use strict";

var supertest = require('supertest');

global.zoo = {
  api: supertest('http://127.0.0.1:4000'),
  security: require('../src/lib/security')
};

global.expect = require('chai').expect;
global.should = require('chai').should;