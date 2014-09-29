/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  fs = require('fs'),
  path = require('path'),
  util = require('../lib/util'),
  data = require('../lib/data');

/**
 * Used to test timeout condition in a request with no response
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testTimeout = function (req, res) {};

/**
 * Used to test unhandled exception in request
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testUnhandledException = function (req, res) {
  throw new Error("oops, we'll crash"); // Unexpected action exception
};

/**
 * Used to test out of memory error
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testOutOfMemory = function (req, res) {

  var stack = [];
  var bigObject = null;
  for (var i = 0; i < 10e8; i++) {
    bigObject = new BigObject();
    stack[i] = bigObject;
    bigObject.fill();
  }

};

/**
 * Used to test memory leak in request
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testMemoryLeak = function (req, res) {
  var heap = [];
  setInterval(function () {
    heap[heap.length] = (new BigObject()).fill();
  }, 10);
  res.jsonp({
    ok: true
  });
};

/**
 * Try to connect to mongodb
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testMongoConnection = function (req, res) {
  // Mongo connection
  require('../lib/data')(null, null, function (err, conn) {
    if (err) {
      util.sendResponse(req, res, 500, {
        message: 'No mongo connection available'
      });
    } else {
      util.sendResponse(req, res, 200, {
        message: 'Mongo connection success!'
      });
    }
  });
};

/**
 * Secured service
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testProtected = function (req, res) {
  if (req.user) {
    util.sendResponse(req, res, 200, {
      secured: req.user
    });
  } else {
    util.sendResponse(req, res, 401, {
      error: 'Forbidden'
    });
  }

};

/**
 * Create one user
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testCreateUser = function (req, res) {
  var user = req.body;
  user.delete_from = new Date(); // Set expiration (test users can be deleted)
  data.createUser(user, function (err, usr) {
    if (err) {
      util.sendResponse(req, res, 500, {
        error: 'Error creating user'
      });
    } else {
      util.sendResponse(req, res, 200, usr);
    }
  })

};

/**
 * Long time resource load
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testLongTime = function (req, res) {
  setTimeout(function () {
    var img = fs.readFileSync(path.normalize(__dirname + '../../../web/development/img/futurama.png'));
    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.end(img, 'binary');
    winston.info('Long time resource request finished');
  }, 10000);
};

/**
 * [testJsLongLongTime description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testJsLongLongTime = function (req, res) {
  setTimeout(function () {
    var inga = fs.readFileSync(path.normalize(__dirname + '../../../web/development/js/long.js'));
    res.writeHead(200, {
      'Content-Type': 'text/javascript'
    });
    res.end(inga, 'binary');
    winston.info('Long long time js request finished');
  }, 20000);
};

function BigObject() {

  this.garbage = [];

  /**
   * fill object with garbage
   * @return {[type]}
   */
  this.fill = function () {
    for (var i = 0; i < 10e5; i++) {
      this.garbage[i] = "Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas       Letraset, las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.";
    }
    return this;
  };

};