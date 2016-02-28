/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  util = require('util');

/**
 * Wrapper for MongoDB driver Collection().
 * http://mongodb.github.io/node-mongodb-native/2.1/api/
 * @param {[type]} options [description]
 */
var BaseModel = module.exports = function (options, conf) {

  var i;
  var self = this;
  if (options.connection === undefined) {
    throw new Error('Error initializing model. DB connection is required');
  }
  if (options.collectionName === undefined) {
    throw new Error('Error initializing model. Collection Name is required');
  }

  this.conn = options.connection;
  this.collectionName = options.collectionName;

  // Ensure defined indexes
  if (this.indexes) {
    for (i = 0; i < this.indexes.length; i++) {
      (function (index) {
        self.collection(function (err, collection) {
          if (err) {
            throw new Error('Error getting collection ' + err.message);
          } else {
            collection.ensureIndex(index.fieldOrSpec, index.options, function (err) {
              if (err) throw new Error(util.format('Error setting index %s for collection %s', index.fieldOrSpec, self.collectionName));
              winston.info('Set index %s for collection %s', index.fieldOrSpec, self.collectionName);
            });
          }
        });
      })(this.indexes[i]);
    }
  }
};

/**
 * Wrapper for mongoDB driver Db() collection. Fetch model collection
 * @return {[type]} [description]
 */
BaseModel.prototype.collection = function (cb) {
  var self = this;
  winston.info("%s", JSON.stringify(this.getCollectionAndExecMethod));
  self.conn.collection(self.collectionName, function (err, collection) {
    if (err) {
      winston.error('Error getting %s collection from MongoDB', self.collectionName);
      cb(err);
    } else {
      cb(null, collection);
    }
  });
};

/**
 * Get collection and apply MongoDB's Collection method
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
BaseModel.prototype.getCollectionAndExecMethod = function (method, args) {
  var self = this;

  self.collection(function (err, coll) {
    if (err) {
      winston.error("Error getting collection %s: %s", self.collectionName, err.message);
    } else {
      // Apply MongoDB's collection method with its arguments
      coll[method].apply(self, args);
    }
  });
};

/**
 * [ensureIndex description]
 * @return {[type]} [description]
 */
BaseModel.prototype.ensureIndex = function () {
  this.getCollectionAndExecMethod('ensureIndex', arguments);
};

/**
 * [findOne description]
 * @param  {[type]}   query [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
BaseModel.prototype.findOne = function (query, cb) {
  this.getCollectionAndExecMethod('findOne', arguments);
};