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
        cb && cb(null, databaseConnection);
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
          winston.error("[FATAL ERROR] Can't create tokens collection: %s", err);
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
          winston.error("[FATAL ERROR] Can't create users collection: %s", err);
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
      }, {}, function (err, tokenObject) {
        cb && cb(err, tokenObject);
      });
    } else {
      cb('You must provide a password');
    }
  });
};