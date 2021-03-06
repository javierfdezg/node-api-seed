/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
/*jshint -W030 */
"use strict";

var winston = require('winston'),
  fs = require('fs'),
  path = require('path'),
  util = require('../lib/util'),
  Users = require('../lib/data').Users,
  ObjectID = require('mongodb').ObjectID,
  Organizations = require('../lib/data').Organizations;

/**
 * Used to test timeout condition in a request with no response
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.timeout = function (req, res) {};

/**
 * Used to test out of memory error
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.outOfMemory = function (req, res) {

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
exports.memoryLeak = function (req, res) {
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
exports.mongoConnection = function (req, res) {
  // Mongo connection
  require('../lib/data')(null, function (err) {
    if (err) {
      util.sendResponse(req, res, 500, {
        error: 'No mongo connection available'
      });
    } else {
      util.sendResponse(req, res, 200, {
        message: req.i18n.__('Mongo connection success!')
      });
    }
  });
};

/**
 * [testPublic description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.public = function (req, res) {
  util.sendResponse(req, res, 200, {
    message: req.i18n.__('Public Message')
  });
};

/**
 * Secured service
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.protected = function (req, res) {
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
 * [testProtectedApiKey description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.protectedApiKey = function (req, res) {
  if (req.organization) {
    util.sendResponse(req, res, 200, {
      secured: req.organization
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
exports.createUser = function (req, res) {
  var user = req.body;
  user.delete_from = new Date(); // Set expiration (test users can be deleted)
  user.organization = ObjectID(user.organization);
  Users.create(user, function (err, usr) {
    if (err) {
      util.sendResponse(req, res, err.status, {
        error: req.i18n.__(err.key)
      });
    } else {
      util.sendResponse(req, res, 201, usr.ops[0]);
    }
  });
};

exports.createOrganization = function (req, res) {
  var organization = req.body;
  organization.delete_from = new Date(); // Set expiration (test organizations can be deleted)
  Organizations.insertOne(organization, {
    w: 1
  }, function (err, org) {
    if (err || org === undefined ||  org.ops === undefined ||  org.ops.length === 0) {
      util.sendResponse(req, res, 500, req.i18n.__('Error in insertOne'));
    } else {
      util.sendResponse(req, res, 201, org.ops[0]);
    }
  });
};

/**
 * Long time resource load
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.longTime = function (req, res) {
  setTimeout(function () {
    var img = fs.readFileSync(path.normalize(__dirname + '/../../web/img/futurama.png'));
    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.end(img, 'binary');
    winston.info('Long time resource request finished');
  }, 10000);
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

}