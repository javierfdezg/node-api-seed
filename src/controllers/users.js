/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  util = require('../lib/util'),
  security = require('../lib/security'),
  Users = require('../lib/data').Users,
  ObjectID = require('mongodb').ObjectID,
  Organizations = require('../lib/data').Organizations;

/**
 * Get an user
 * @param  {[type]} req
 * @param  {[type]} res
 * @return {[type]}
 */
exports.get = function (req, res) {
  Users.find({
    _id: ObjectID(req.params.id),
  }).limit(1).next(function (err, user) {
    if (err) {
      winston.error("[API 500 ERROR] Error getting user %s: %s ", req.params.id, err.message);
      util.sendResponse(req, res, 500, {
        error: req.i18n.__('There was an unknown error. Try again please')
      });
    } else {
      util.sendResponse(req, res, 200, user);
    }
  });
};

/**
 * New user service. Creates an User for requesting user organization or Specified in body (if Root)
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.post = function (req, res) {
  var user = req.body;
  saveOrUpdate(user, req, res);
};

/**
 * Updates an existing User
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.put = function (req, res) {
  var user = req.body;
  user._id = req.params.id; // Avoid security problems changing id in body
  saveOrUpdate(user, req, res);
};

/**
 * Deletes existing user
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.del = function (req, res) {
  Users.deleteOne({
    _id: ObjectID(req.params.id)
  }, function (err) {
    if (err) {
      // Unknown error
      util.sendResponse(req, res, 500, {
        error: req.i18n.__('There was an unknown error. Try again please')
      });
    } else {
      // Acknowledge
      util.sendResponse(req, res, 204);
    }
  });
};

/**
 * Saves or updates an User. If user doesn't organization attribute set the requesting User organization
 * @param  {[type]} user [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res  [description]
 * @return {[type]}      [description]
 */
function saveOrUpdate(user, req, res) {
  var validation;
  var update = (user._id !== undefined);

  // If user is root and no organization is specified for user
  if (!user.organization && req.user && req.user.role === security.userRoles.root) {
    util.sendResponse(req, res, 400, {
      error: req.i18n.__('Organization is required')
    });
  }
  // If user doesn't have organization (It is posible?)
  else if (!req.organization) {
    util.sendResponse(req, res, 400, {
      error: req.i18n.__('Organization is required')
    });
  }
  // If user to update doesn't have organization, assign user's organization
  else {
    user.organization = (user.organization) ? user.organization : req.organization.toString();
    // Model validations and transfor (cast json plain types to js types)
    Users.validateAndTransform(user, function (err, validation) {
      if (err) {
        // Unknown error
        winston.error("Error in Users.validateAndTransform: %s", err.stack);
        util.sendResponse(req, res, 500, {
          error: req.i18n.__('There was an unknown error. Try again please')
        });
      } else if (validation.valid) {
        if (!update) {
          user.created_at = new Date();
        }
        user.updated_at = new Date();
        // Has the user permission in the updated user's company
        if (!util.owns(req, user)) {
          util.sendResponse(req, res, 403, {
            error: req.i18n.__('Forbidden')
          });
        } else {
          // Save or Update user
          Users.findOneAndUpdate({
            _id: (update) ? user._id : new ObjectID() // New ObjectID or existing one for updates
          }, user, {
            upsert: true,
            returnOriginal: false // return updated user
          }, function (err, updatedUser) {
            // Unique contraint violation (email)
            if (err && err.name === 'MongoError' && err.code === 11000) {
              // Duplicate email
              util.sendResponse(req, res, 400, {
                error: req.i18n.__('Email %s is already taken by another user. Please use a different email', user.email)
              });
            } else if (err || !updatedUser.value) {
              // Unknown error
              util.sendResponse(req, res, 500, {
                error: req.i18n.__('There was an unknown error. Try again please')
              });
            } else {
              // Return new or updated user
              util.sendResponse(req, res, ((update) ? 200 : 201), updatedUser.value);
            }
          });
        }
      } else {
        // Model validation errors
        util.sendResponse(req, res, 400, {
          error: req.i18n.__('Invalid user. Fix errors and try again'),
          errors: validation.errors
        });
      }
    });
  }
};