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
      winston.info("Initializing '%s' model for '%s' collection", className, collectionName);
    }
  }

  // Callback
  cb && cb(null, module.exports);
};

/**
 * Search user by id
 * @param  {[type]}   id [description]
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
module.exports.searchUserById = function (id, cb) {
  conn.collection(conf.userscollection, function (err, usersCollection) {
    if (err) {
      cb(err);
    } else {
      usersCollection.findOne({
        _id: ObjectId(id)
      }, function (err, userObject) {
        cb && cb(err, userObject);
      });
    }
  });
};

/**
 * Creates a new user
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports.createUser = function (usr, cb) {
  conn.collection(conf.userscollection, function (err, usersCollection) {
    if (err) {
      cb(err);
    } else if (usr.password) {
      module.exports.searchUserByEmail(usr.email, function (err, userExists) {
        if (err) {
          cb('Error searching user by email ' + err.toString());
        } else if (userExists) {
          cb('Email already exists', userExists);
        } else {
          // Encrypt password and save with salt
          util.hasher({
            plainText: usr.password
          }, function (err, opts) {
            if (err) {
              console.log('Error encrypting password');
            } else {
              usr.password = opts.key;
              usr.salt = opts.salt;
              usersCollection.insert(usr, {
                w: 1
              }, function (err, userObject) {
                cb && cb(err, userObject);
              });
            }
          });
        }
      });
    } else {
      cb('You must provide a password');
    }
  });
};

/** Gets an object from a collection.
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports.getObject = function (query, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.findOne(query, function (err, result) {
        cb && cb(err, result);
      });
    }
  });
};

/** Inserts or updates a new object in a collection based on the _id
    No integrity/validation checking
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports.insertObject = function (obj, collectionName, cb) {

  // Convert the received _id into a ObjectId
  if (obj.hasOwnProperty('_id')) {
    if (typeof obj._id === 'string') {
      obj._id = ObjectId(obj._id);
    }
  }

  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.save(obj, {
        w: 1
      }, function (err, result) {
        // result == 1 means that the record was updated with 
        // the obj provided
        if (result === 1) {
          result = obj;
        }

        cb && cb(err, result);
      });
    }
  });
};

/** Deletes an object from a collection.
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports.deleteObject = function (query, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.findAndRemove(query, function (err, result) {
        cb && cb(err, result);
      });
    }
  });
};

/** Deletes an object from a collection.
 * @param  {[type]}   usr [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports.deleteAllObjects = function (query, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.remove(query, {
        w: 1
      }, function (err, result) {
        cb && cb(err, result);
      });
    }
  });
};

/**
 * Partial update for object
 * @param  {[type]}   obj            [description]
 * @param  {[type]}   collectionName [description]
 * @param  {Function} cb             [description]
 * @return {[type]}                  [description]
 */
module.exports.updatePartialObject = function (obj, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      // Convert the received _id into a ObjectId
      if (obj.hasOwnProperty('_id')) {
        if (typeof obj._id === 'string') {
          obj._id = ObjectId(obj._id);
        }
      }
      collection.findAndModify({
        _id: ObjectId(obj._id) // Update by object id
      }, [], {
        $set: obj
      }, {
        w: 1, // write concern
        new: true // return new updated object
      }, function (err, doc) {
        cb && cb(err, doc);
      });
    }
  });
};

/**
 * [mapreduce description]
 * @param  {[type]}   collectionName [description]
 * @param  {[type]}   map            [description]
 * @param  {[type]}   reduce         [description]
 * @param  {[type]}   options        [description]
 * @param  {Function} cb             [description]
 * @return {[type]}                  [description]
 */
module.exports.mapreduce = function (collectionName, map, reduce, options, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.mapReduce(map, reduce, options, cb);
    }
  });
};

/**
 * [findAndModifyObject description]
 * @param  {[type]}   query          [description]
 * @param  {[type]}   obj            [description]
 * @param  {[type]}   collectionName [description]
 * @param  {Function} cb             [description]
 * @return {[type]}                  [description]
 */
module.exports.findAndModifyObject = function (query, obj, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.findAndModify(query, [], // sort order
        obj, // replacement object 
        { // Options
          w: 1, // write concern
          new: true, // return the modified object
          upsert: true, // if no document found insert replacement as new
        },
        function (err, result) {
          cb && cb(err, result);
        });
    }
  });
};

module.exports.update = function (collectionName, query, obj, cb) {
  // Get collection  
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      winston.error("[FATAL ERROR] Can't get %s Collection", collectionName);
      cb && cb(err);
    } else {
      // Update 
      collection.update(query, obj, {
        w: 1
      }, function (err, result) {
        if (err) {
          winston.error("[FATAL ERROR] Can't update %s Collection", req.config.data.goalscollection);
        } else {
          cb && cb(null, result);
        }
      });
    }
  });
};

module.exports.aggregatePromise = function (query, collectionName) {
  var deferred = Q.defer();

  module.exports.aggregate(query, collectionName, function (err, result) {
    if (err) {
      winston.error(err);
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

module.exports.distinctPromise = function (query, field, options, collectionName) {

  var deferred = Q.defer();

  conn.collection(collectionName, function (err, collection) {
    if (err) {
      deferred.reject(err);
    } else {
      collection.distinct(field, query, options, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
      });
    }
  });

  return deferred.promise;

};

module.exports.distinct = function (query, field, options, collectionName, cb) {
  module.exports.distinctPromise(query, field, options, collectionName).then(function (result) {
    cb && cb(null, result);
  }).fail(function (error) {
    cb && cb(error);
  });
};

module.exports.find = function (collectionName, query, options, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.find(query, function (err, result) {
        if (err) {
          cb && cb(err);
        } else {
          result.toArray(function (err, docs) {
            if (err) {
              cb && cb(err);
            } else {
              cb && cb(null, docs);
            }
          });
        }
      });
    }
  });
};

module.exports.queryPromise = function (query, from, size, sort, collectionName, excludedFields) {

  var deferred = Q.defer();

  conn.collection(collectionName, function (err, collection) {
    if (err) {
      deferred.reject(err);
    } else {
      if (!excludedFields) {
        excludedFields = {};
      }

      collection.find(query, excludedFields, {
        sort: sort,
        limit: size,
        skip: from
      }, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          result.toArray(function (err, docs) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(docs);
            }
          });
        }
      });
    }
  });

  return deferred.promise;

};

module.exports.query = function (query, from, size, sort, collectionName, cb, excludedFields) {
  module.exports.queryPromise(query, from, size, sort, collectionName, excludedFields).then(function (result) {
    cb && cb(null, result);
  }).fail(function (error) {
    cb && cb(error);
  });
};

module.exports.queryCountPromise = function (query, collectionName) {
  var deferred = Q.defer();
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      deferred.reject(err);
    } else {
      collection.count(query, function (err, count) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(count);
        }
      });
    }
  });
  return deferred.promise;
};

module.exports.aggregate = function (query, collectionName, cb) {
  conn.collection(collectionName, function (err, collection) {
    if (err) {
      cb && cb(err);
    } else {
      collection.aggregate(query, function (err, result) {
        if (err) {
          cb && cb(err);
        } else {
          cb && cb(null, result);
        }
      });
    }
  });
};

//module.exports.models = models;