/*
 * Copyright (c) Why Not Soluciones, S.L.
 * http://exploringjs.com/es6/ch_classes.html
 */

/*jslint node: true */
"use strict";

var BaseModel = require('../base-model'),
  inherits = require('util').inherits,
  winston = require('winston');

var Users = class Users extends BaseModel {

  constructor(options, conf) {
    // Collection indexes
    this.indexes = [{
      fieldOrSpec: 'delete_from',
      options: {
        expireAfterSeconds: conf.testuserexpiration
      }
    }];
    super(options, conf);
  }

  /**
   * Creates a new user
   * @param  {[type]}   usr [description]
   * @param  {Function} cb  [description]
   * @return {[type]}       [description]
   */
  create(usr, cb) {

    if (usr.password) {
      winston.info("PROTO: %s", this.__proto__);
      this.getByEmail(usr.email, function (err, userExists) {
        if (err) {
          winston.error('Error searching for %s in database (User.create)', usr.email);
          cb({
            key: 'Error searching for this email in Database',
            status: 500
          });
        } else if (userExists) {
          cb({
            key: 'This email already exists',
            status: 400
          });
        } else {
          // Encrypt password and save with salt
          util.hasher({
            plainText: usr.password
          }, function (err, opts) {
            if (err) {
              winston.error('Error encrypting password for %s', usr.email);
              cb && cb({
                key: 'Error encrypting password',
                status: 500
              });
            } else {
              usr.password = opts.key;
              usr.salt = opts.salt;
              // Insert new user in collection
              this.insert(usr, {
                w: 1
              }, function (err, userObject) {
                cb && cb(err, userObject);
              });
            }
          });
        }
      });
    } else {
      cb({
        key: 'You must provide a password',
        status: 400
      });
    }

  }

  /**
   * Search for valid token, and then search and return the owner of that token.
   * Update validity of the found token
   * @param  {[type]} tk [description]
   * @param  {Function} cb [description]
   * @return {[type]} [description]
   */
  searchByBearerToken(tk, cb) {
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
  }

  getByEmail(email, cb) {
    Users.prototype.findOne({
      email: email
    }, function (err, user) {
      cb && cb(err, user);
    });
  }

}

module.exports = Users;
module.exports.collectionName = 'users';