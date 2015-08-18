/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
"use strict";

var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server,
  ObjectId = require('mongodb').ObjectID,
  winston = require('winston'),
  util = require('../util');

// MongoDB connection instance
var conn;
var conf;

module.exports = function (app, config, cb) {

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
    // try to connect to the database
    var db = new Db(config.name, new Server(config.host,
      config.port || Connection.DEFAULT_PORT, {
        auto_reconnect: true,
        poolSize: config.poolsize
      }), config.options);
    // Open connection
    db.open(function (error, databaseConnection) {
      if (error) {
        cb && cb(error);
      } else {
        conn = databaseConnection;
        module.exports.setIndexes();
        cb && cb(null, module.exports);
      }
    });

  }

};

/**
 * Set indexes
 */
module.exports.setIndexes = function (cb) {

  // Configure tokens collection expiration time index for token expiration 
  // http://docs.mongodb.org/manual/tutorial/expire-data/
  conn.collection(conf.tokenscollection, function (err, tokens) {
    if (err) {
      cb && cb(err);
    } else {
      tokens.ensureIndex('updated_at', {
        expireAfterSeconds: conf.tokenexpiration
      }, function (err) {
        if (err) {
          winston.error("[FATAL ERROR] Can't create tokens collection: %s", err.toString());
        }
      });
    }
  });

  conn.collection(conf.userscollection, function (err, tokens) {
    if (err) {
      cb && cb(err);
    } else {
      tokens.ensureIndex('delete_from', {
        expireAfterSeconds: conf.testuserexpiration
      }, function (err) {
        if (err) {
          winston.error("[FATAL ERROR] Can't create users collection: %s", err.toString());
        }
      });
    }
  });

};

/**
 * Search for valid token, and then search and return the owner of that token.
 * Update validity of the found token
 * @param  {[type]} tk [description]
 * @param  {Function} cb [description]
 * @return {[type]} [description]
 */
module.exports.searchUserByBearerToken = function (tk, cb) {

  conn.collection(conf.tokenscollection, function (err, tokensCollection) {
    if (err) {
      cb(err);
    } else {
      tokensCollection.findAndModify({
        token: tk
      }, [], {
        $set: {
          updated_at: new Date(), // Increment time
        }
      }, {
        w: 1,
        new: false
      }, function (err, tokenObject) {
        if (err) {
          cb && cb(err);
        } else if (tokenObject) {
          // Get user
          module.exports.searchUserById(tokenObject.user, cb);
        } else {
          cb && cb(null, null);
        }
      });
    }
  });

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
 * Search user by email
 * @param  {[type]}   em [description]
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
module.exports.searchUserByEmail = function (em, cb) {
  conn.collection(conf.userscollection, function (err, usersCollection) {
    if (err) {
      cb(err);
    } else {
      usersCollection.findOne({
        email: em
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
          cb('Error searching user by email');
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

/**
 * Associte a given token to the user
 * @param  {[type]}   tkn [description]
 * @param  {[type]}   usr   [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
module.exports.createToken = function (tkn, usr, cb) {
  conn.collection(conf.tokenscollection, function (err, tokenscollection) {
    if (err) {
      cb(err);
    } else if (usr) {
      // Save the token
      tokenscollection.insert({
        user: usr._id,
        token: tkn,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        w: 1
      }, function (err, tokenObject) {
        if (err) {
          cb && cb(err);
        } else if (!tokenObject || tokenObject.length == 0) {
          cb && cb('Unknown error');
        } else {
          cb && cb(err, tokenObject[0]);
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