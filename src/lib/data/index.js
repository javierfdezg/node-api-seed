/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var MongoClient = require('mongodb').MongoClient,
  fs = require('fs'),
  util = require('../util');

// MongoDB connection instance
var conn;
var conf;

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
  var stat, modelsList, model;
  var Model, collectionName, className;
  var submodels, Submodel, submodel, submodelClassName;

  // Get all models and init them
  modelsList = fs.readdirSync(__dirname + '/models');
  modelsList.forEach(function (item) {
    stat = fs.statSync(__dirname + '/models/' + item);
    if (stat.isFile()) {
      // Create and export model
      Model = require('./models/' + item);
      collectionName = (Model.collectionName !== undefined) ? Model.collectionName : util.fileToCollectionName(item);
      model = new Model({
        connection: conn,
        collectionName: collectionName
      }, config);
      // Export model with the Class Name
      className = util.collectionToClassName(collectionName);
      module.exports[className] = model;
      // Get submodel helpers if any
      submodels = getSubmodelHelpersSync(__dirname + '/models/' + item);
      submodels.forEach(function (subItem) {
        Submodel = subItem.module;
        submodelClassName = className + subItem.name;
        submodel = new Submodel(model);
        module.exports[submodelClassName] = submodel;
      });
    }
  });

  // Callback
  cb && cb(null, module.exports);
}

/**
 * [getSubmodelHelpersSync description]
 * @param  {[type]} modelFilePath [description]
 * @return {[type]}                  [description]
 */
function getSubmodelHelpersSync(modelFilePath) {
  var submodels = [];
  var stat, submodelsList, Submodel,
    className, collectionName;
  // Check if submodels directory exists
  if (modelFilePath) {

    // Remove extension form file path
    var submodelDir = util.beforeLastIndex(modelFilePath, '.');
    try {
      stat = fs.statSync(submodelDir);
    } catch (ex) {
      // No directory found
    }
    // If submodel dir exists, init submodels
    if (stat && stat.isDirectory()) {
      submodelsList = fs.readdirSync(submodelDir);
      submodelsList.forEach(function (item) {
        stat = fs.statSync(submodelDir + '/' + item);
        if (stat.isFile()) {
          Submodel = require(submodelDir + '/' + item);
          collectionName = (Submodel.collectionName !== undefined) ? Submodel.collectionName : util.fileToCollectionName(item);
          className = util.collectionToClassName(collectionName);
          submodels.push({
            name: className,
            module: Submodel
          });
        }
      });
    }

  }

  return submodels;
}