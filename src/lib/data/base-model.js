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
      coll[method].apply(coll, args);
    }
  });
};

/** Wrappers for MongoDB Collection node driver Class  */
BaseModel.prototype.aggregate = function () {
  this.getCollectionAndExecMethod('aggregate', arguments);
};
BaseModel.prototype.bulkWrite = function () {
  this.getCollectionAndExecMethod('bulkWrite', arguments);
};
BaseModel.prototype.count = function () {
  this.getCollectionAndExecMethod('count', arguments);
};
BaseModel.prototype.createIndex = function () {
  this.getCollectionAndExecMethod('createIndex', arguments);
};
BaseModel.prototype.createIndexes = function () {
  this.getCollectionAndExecMethod('createIndexes', arguments);
};
BaseModel.prototype.deleteMany = function () {
  this.getCollectionAndExecMethod('deleteMany', arguments);
};
BaseModel.prototype.deleteOne = function () {
  this.getCollectionAndExecMethod('deleteOne', arguments);
};
BaseModel.prototype.distinct = function () {
  this.getCollectionAndExecMethod('distinct', arguments);
};
BaseModel.prototype.drop = function () {
  this.getCollectionAndExecMethod('drop', arguments);
};
BaseModel.prototype.dropAllIndexes = function () {
  this.getCollectionAndExecMethod('dropAllIndexes', arguments);
};
BaseModel.prototype.dropIndex = function () {
  this.getCollectionAndExecMethod('dropIndex', arguments);
};
BaseModel.prototype.dropIndexes = function () {
  this.getCollectionAndExecMethod('dropIndexes', arguments);
};
BaseModel.prototype.ensureIndex = function () {
  this.getCollectionAndExecMethod('ensureIndex', arguments);
};
BaseModel.prototype.find = function () {
  this.getCollectionAndExecMethod('find', arguments);
};
BaseModel.prototype.findAndModify = function () {
  this.getCollectionAndExecMethod('findAndModify', arguments);
};
BaseModel.prototype.findAndRemove = function () {
  this.getCollectionAndExecMethod('findAndRemove', arguments);
};
BaseModel.prototype.findOne = function () {
  this.getCollectionAndExecMethod('findOne', arguments);
};
BaseModel.prototype.findOneAndDelete = function () {
  this.getCollectionAndExecMethod('findOneAndDelete', arguments);
};
BaseModel.prototype.findOneAndReplace = function () {
  this.getCollectionAndExecMethod('findOneAndReplace', arguments);
};
BaseModel.prototype.findOneAndUpdate = function () {
  this.getCollectionAndExecMethod('findOneAndUpdate', arguments);
};
BaseModel.prototype.geoHaystackSearch = function () {
  this.getCollectionAndExecMethod('geoHaystackSearch', arguments);
};
BaseModel.prototype.geoNear = function () {
  this.getCollectionAndExecMethod('geoNear', arguments);
};
BaseModel.prototype.group = function () {
  this.getCollectionAndExecMethod('group', arguments);
};
BaseModel.prototype.indexes = function () {
  this.getCollectionAndExecMethod('indexes', arguments);
};
BaseModel.prototype.indexExists = function () {
  this.getCollectionAndExecMethod('indexExists', arguments);
};
BaseModel.prototype.indexInformation = function () {
  this.getCollectionAndExecMethod('indexInformation', arguments);
};
BaseModel.prototype.initializeOrderedBulkOp = function () {
  this.getCollectionAndExecMethod('initializeOrderedBulkOp', arguments);
};
BaseModel.prototype.initializeUnorderedBulkOp = function () {
  this.getCollectionAndExecMethod('initializeUnorderedBulkOp', arguments);
};
BaseModel.prototype.insert = function () {
  this.getCollectionAndExecMethod('insert', arguments);
};
BaseModel.prototype.insertMany = function () {
  this.getCollectionAndExecMethod('insertMany', arguments);
};
BaseModel.prototype.insertOne = function () {
  this.getCollectionAndExecMethod('insertOne', arguments);
};
BaseModel.prototype.isCapped = function () {
  this.getCollectionAndExecMethod('isCapped', arguments);
};
BaseModel.prototype.listIndexes = function () {
  this.getCollectionAndExecMethod('listIndexes', arguments);
};
BaseModel.prototype.mapReduce = function () {
  this.getCollectionAndExecMethod('mapReduce', arguments);
};
BaseModel.prototype.options = function () {
  this.getCollectionAndExecMethod('options', arguments);
};
BaseModel.prototype.parallelCollectionScan = function () {
  this.getCollectionAndExecMethod('parallelCollectionScan', arguments);
};
BaseModel.prototype.reIndex = function () {
  this.getCollectionAndExecMethod('reIndex', arguments);
};
BaseModel.prototype.remove = function () {
  this.getCollectionAndExecMethod('remove', arguments);
};
BaseModel.prototype.rename = function () {
  this.getCollectionAndExecMethod('rename', arguments);
};
BaseModel.prototype.replaceOne = function () {
  this.getCollectionAndExecMethod('replaceOne', arguments);
};
BaseModel.prototype.save = function () {
  this.getCollectionAndExecMethod('save', arguments);
};
BaseModel.prototype.stats = function () {
  this.getCollectionAndExecMethod('stats', arguments);
};
BaseModel.prototype.update = function () {
  this.getCollectionAndExecMethod('update', arguments);
};
BaseModel.prototype.updateMany = function () {
  this.getCollectionAndExecMethod('updateMany', arguments);
};
BaseModel.prototype.updateOne = function () {
  this.getCollectionAndExecMethod('updateOne', arguments);
};