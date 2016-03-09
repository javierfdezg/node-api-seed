/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  MongoClient = require('mongodb').MongoClient,
  ObjectId = require('mongodb').ObjectID,
  winston = require('winston'),
  fs = require('fs'),
  util = require('../util');

// MongoDB connection instance
var conn;
var conf;
var models = {};

module.exports = function (app, config, cb) {

  var url;
  var authentication = '';

  // save config options
  if (config) {
    conf = config;
  }

  // Allready have a connection, don't connect again
  if (conn) {
    cb && cb(null, conn);
  }
  // No connection established
  else {
    // If MongoDB connection requires authentication
    if (config.user && config.password) {
      authentication = config.user + ':' + config.password + '@';
    }
    url = 'mongodb://' + authentication + config.host + ':' + config.port + '/' + config.name;
    MongoClient.connect(url, {
      db: config.options,
      server: {
        poolSize: config.poolsize,
        socketOptions: {
          autoReconnect: true
        }
      }
    }, function (error, databaseConnection) {
      if (error) {
        cb && cb(error);
      } else {
        conn = databaseConnection;
        initialize(config, cb);
      }
    });
  }
};

/**
 * Get model based on collection name
 * @param  {[type]} collectionName [description]
 * @return {[type]}                [description]
 */
module.exports.getModel = function (collectionName) {
  var className = util.collectionToClassName(collectionName);
  return module.exports[className];
};

/**
 * Init mongoDB indexes and Models found under 'models' directory
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
function initialize(config, cb) {
  var stat, modelsList, model, i;
  var Model, collectionName, className;

  // Get all models and init them
  modelsList = fs.readdirSync(__dirname + '/models');
  for (i = 0; i < modelsList.length; i++) {
    stat = fs.statSync(__dirname + '/models/' + modelsList[i]);
    if (stat.isFile()) {
      // Create and export model
      Model = require('./models/' + modelsList[i]);
      collectionName = (Model.collectionName !== undefined) ? Model.collectionName : util.fileToCollectionName(modelsList[i]);
      model = new Model({
        connection: conn,
        collectionName: collectionName
      }, config);
      // Export model with the Class Name
      className = util.collectionToClassName(collectionName);
      module.exports[className] = model;
    }
  }

  // Callback
  cb && cb(null, module.exports);
};