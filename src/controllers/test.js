/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  fs = require('fs'),
  path = require('path');

/**
 * Used to test timeout condition in a request with no response
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testTimeout = function (req, res) {
  winston.verbose('[API request] %s -- %s %s', req.ip, req.method, req.url);
};

/**
 * Used to test unhandled exception in request
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testUnhandledException = function (req, res) {
  winston.verbose('[API request] %s -- %s %s', req.ip, req.method, req.url);
  throw new Error("oops, we'll crash"); // Unexpected action exception
};

/**
 * Used to test out of memory error
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.testOutOfMemory = function (req, res) {

  winston.verbose('[API request] %s -- %s %s', req.ip, req.method, req.url);

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
  winston.verbose('[API request] %s -- %s %s', req.ip, req.method, req.url);
  setInterval(function () {
    heap[heap.length] = (new BigObject()).fill();
  }, 10);
  res.jsonp({
    ok: true
  });
};

/**
 * Long time resource load
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.testLongTime = function (req, res) {
  winston.info('Begin long time resource request');
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
  winston.info('Begin long long time js request');
  setTimeout(function () {
    var inga = fs.readFileSync(path.normalize(__dirname + '../../../web/development/js/long.js'));
    res.writeHead(200, {
      'Content-Type': 'text/javascript'
    });
    res.end(inga, 'binary');
    winston.info('Long long time js request finished');
  }, 20000);
};

exports.testChunk = function (req, res) {
  winston.info(req.param('d'));
  res.jsonp({
    ok: true
  });
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