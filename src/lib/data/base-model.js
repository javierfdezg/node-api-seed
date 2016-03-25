/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var util = require('util'),
  transformations = require('./transformations'),
  validations = require('./validations');

/**
 * Wrapper for MongoDB driver Collection().
 * http://mongodb.github.io/node-mongodb-native/2.1/api/
 * @param {[type]} options [description]
 */
var BaseModel = module.exports = function (options) {

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
    this.indexes.forEach(function (index) {
      self.collection().ensureIndex(index.fieldOrSpec, index.options, function (err) {
        if (err) throw new Error(util.format('Error setting index %s for collection %s: %s', index.fieldOrSpec, self.collectionName, err.message));
      });
    });
  }
};

/**
 * Wrapper for mongoDB driver Db() collection. Fetch model collection
 * @return {[type]} [description]
 */
BaseModel.prototype.collection = function () {
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

/**
 * Validates model (schema and specific model validations)
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
BaseModel.prototype.validate = function (obj, cb) {
  var validate = this.validateSchema(obj);
  // If model especific validate function exists apply
  if (this.validateModel && typeof this.validateModel === 'function') {
    this.validateModel(obj, function (err, validateModel) {
      if (err) {
        cb && cb(err);
      } else {
        validate.valid = validate.valid && validateModel.valid;
        validate.errors.push(validateModel.errors);
        cb && cb(null, validate);
      }
    });
  } else  {
    cb && cb(null, validate);
  }
};

/**
 * Validate model agains JSON Schema defined in property schema
 * https: //github.com/flatiron/revalidator
 * http://tools.ietf.org/html/draft-zyp-json-schema-04
 * @param  {[type]} obj Object to validate
 * @return {[type]} an object like this:
 * {
 *   valid: true, // or false
 *   errors: [] // Array of errors if valid is false 
 * }
 **/
BaseModel.prototype.validateSchema = function (obj) {
  return validations.validateSchema(obj, this.schema);
};

/**
 * Validate and apply json casting of properties defined in this.transformations
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
BaseModel.prototype.validateAndTransform = function (obj, cb) {
  var self = this;
  this.validate(obj, function (err, validate) {
    // If is a valid object, and has an schema, convert types (apply transformations)
    if (err) {
      cb && cb(err);
    } else if (validate.valid) {
      self.transform(obj);
      cb && cb(null, validate);
    } else {
      cb && cb(null, validate);
    }
  });
};

/**
 * Apply transformations defined in this.transformations
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
BaseModel.prototype.transform = function (obj) {
  transformations.transform(obj, this.transformations);
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