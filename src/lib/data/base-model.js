/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */

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
              if (err) throw new Error(util.format('Error setting index %s for collection %s: %s', index.fieldOrSpec, self.collectionName, err.message));
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
  return self.conn.collection(self.collectionName);
};

/**
 * Get collection and apply MongoDB's Collection method
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
BaseModel.prototype.getCollectionAndExecMethod = function (method, args) {
  var self = this;
  var coll = self.collection();
  return coll[method].apply(coll, args);
};

/** Wrappers for MongoDB Collection node driver Class  */
BaseModel.prototype.aggregate = function () {
  return this.getCollectionAndExecMethod('aggregate', arguments);
};
BaseModel.prototype.bulkWrite = function () {
  return this.getCollectionAndExecMethod('bulkWrite', arguments);
};
BaseModel.prototype.count = function () {
  return this.getCollectionAndExecMethod('count', arguments);
};
BaseModel.prototype.createIndex = function () {
  return this.getCollectionAndExecMethod('createIndex', arguments);
};
BaseModel.prototype.createIndexes = function () {
  return this.getCollectionAndExecMethod('createIndexes', arguments);
};
BaseModel.prototype.deleteMany = function () {
  return this.getCollectionAndExecMethod('deleteMany', arguments);
};
BaseModel.prototype.deleteOne = function () {
  return this.getCollectionAndExecMethod('deleteOne', arguments);
};
BaseModel.prototype.distinct = function () {
  return this.getCollectionAndExecMethod('distinct', arguments);
};
BaseModel.prototype.drop = function () {
  return this.getCollectionAndExecMethod('drop', arguments);
};
BaseModel.prototype.dropAllIndexes = function () {
  return this.getCollectionAndExecMethod('dropAllIndexes', arguments);
};
BaseModel.prototype.dropIndex = function () {
  return this.getCollectionAndExecMethod('dropIndex', arguments);
};
BaseModel.prototype.dropIndexes = function () {
  return this.getCollectionAndExecMethod('dropIndexes', arguments);
};
BaseModel.prototype.ensureIndex = function () {
  return this.getCollectionAndExecMethod('ensureIndex', arguments);
};
BaseModel.prototype.find = function () {
  return this.getCollectionAndExecMethod('find', arguments);
};
BaseModel.prototype.findAndModify = function () {
  return this.getCollectionAndExecMethod('findAndModify', arguments);
};
BaseModel.prototype.findAndRemove = function () {
  return this.getCollectionAndExecMethod('findAndRemove', arguments);
};
BaseModel.prototype.findOne = function () {
  return this.getCollectionAndExecMethod('findOne', arguments);
};
BaseModel.prototype.findOneAndDelete = function () {
  return this.getCollectionAndExecMethod('findOneAndDelete', arguments);
};
BaseModel.prototype.findOneAndReplace = function () {
  return this.getCollectionAndExecMethod('findOneAndReplace', arguments);
};
BaseModel.prototype.findOneAndUpdate = function () {
  return this.getCollectionAndExecMethod('findOneAndUpdate', arguments);
};
BaseModel.prototype.geoHaystackSearch = function () {
  return this.getCollectionAndExecMethod('geoHaystackSearch', arguments);
};
BaseModel.prototype.geoNear = function () {
  return this.getCollectionAndExecMethod('geoNear', arguments);
};
BaseModel.prototype.group = function () {
  return this.getCollectionAndExecMethod('group', arguments);
};
BaseModel.prototype.indexes = function () {
  return this.getCollectionAndExecMethod('indexes', arguments);
};
BaseModel.prototype.indexExists = function () {
  return this.getCollectionAndExecMethod('indexExists', arguments);
};
BaseModel.prototype.indexInformation = function () {
  return this.getCollectionAndExecMethod('indexInformation', arguments);
};
BaseModel.prototype.initializeOrderedBulkOp = function () {
  return this.getCollectionAndExecMethod('initializeOrderedBulkOp', arguments);
};
BaseModel.prototype.initializeUnorderedBulkOp = function () {
  return this.getCollectionAndExecMethod('initializeUnorderedBulkOp', arguments);
};
BaseModel.prototype.insert = function () {
  return this.getCollectionAndExecMethod('insert', arguments);
};
BaseModel.prototype.insertMany = function () {
  return this.getCollectionAndExecMethod('insertMany', arguments);
};
BaseModel.prototype.insertOne = function () {
  return this.getCollectionAndExecMethod('insertOne', arguments);
};
BaseModel.prototype.isCapped = function () {
  return this.getCollectionAndExecMethod('isCapped', arguments);
};
BaseModel.prototype.listIndexes = function () {
  return this.getCollectionAndExecMethod('listIndexes', arguments);
};
BaseModel.prototype.mapReduce = function () {
  return this.getCollectionAndExecMethod('mapReduce', arguments);
};
BaseModel.prototype.options = function () {
  return this.getCollectionAndExecMethod('options', arguments);
};
BaseModel.prototype.parallelCollectionScan = function () {
  return this.getCollectionAndExecMethod('parallelCollectionScan', arguments);
};
BaseModel.prototype.reIndex = function () {
  return this.getCollectionAndExecMethod('reIndex', arguments);
};
BaseModel.prototype.remove = function () {
  return this.getCollectionAndExecMethod('remove', arguments);
};
BaseModel.prototype.rename = function () {
  return this.getCollectionAndExecMethod('rename', arguments);
};
BaseModel.prototype.replaceOne = function () {
  return this.getCollectionAndExecMethod('replaceOne', arguments);
};
BaseModel.prototype.save = function () {
  return this.getCollectionAndExecMethod('save', arguments);
};
BaseModel.prototype.stats = function () {
  return this.getCollectionAndExecMethod('stats', arguments);
};
BaseModel.prototype.update = function () {
  return this.getCollectionAndExecMethod('update', arguments);
};
BaseModel.prototype.updateMany = function () {
  return this.getCollectionAndExecMethod('updateMany', arguments);
};
BaseModel.prototype.updateOne = function () {
  return this.getCollectionAndExecMethod('updateOne', arguments);
};