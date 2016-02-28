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
class BaseModel {

  constructor(options, conf) {
    var i;

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
        (function (index, that) {
          that.collection(function (err, collection) {
            if (err) {
              throw new Error('Error getting collection ' + err.message);
            } else {
              collection.ensureIndex(index.fieldOrSpec, index.options, function (err) {
                if (err) throw new Error(util.format('Error setting index %s for collection %s', index.fieldOrSpec, that.collectionName));
                winston.info('Set index %s for collection %s', index.fieldOrSpec, that.collectionName);
              });
            }
          });
        })(this.indexes[i], this);
      }
    }
  }

  /**
   * Wrapper for mongoDB driver Db() collection. Fetch model collection
   * @return {[type]} [description]
   */
  collection(cb) {
    var that = this;
    this.conn.collection(that.collectionName, function (err, collection) {
      if (err) {
        winston.error('Error getting %s collection from MongoDB', that.collectionName);
        cb(err);
      } else {
        cb(null, collection);
      }
    });
  }

  /**
   * Get collection and apply MongoDB's Collection method
   * @param  {[type]} method [description]
   * @return {[type]}        [description]
   */
  getCollectionAndExecMethod(method, args) {
    var that = this;

    that.collection(function (err, coll) {
      if (err) {
        winston.error("Error getting collection %s: %s", that.collectionName, err.message);
      } else {
        // Apply MongoDB's collection method with its arguments
        coll[method].apply(that, args);
      }
    });
  }

  /**
   * [ensureIndex description]
   * @return {[type]} [description]
   */
  ensureIndex() {
    this.getCollectionAndExecMethod('ensureIndex', arguments);
  }

  /**
   * [findOne description]
   * @param  {[type]}   query [description]
   * @param  {Function} cb    [description]
   * @return {[type]}         [description]
   */
  findOne(query, cb) {
    this.getCollectionAndExecMethod('findOne', arguments);
  }

};

module.exports = BaseModel;