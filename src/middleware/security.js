/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var winston = require('winston'),
  util = require('../lib/util'),
  nutil = require('util'),
  security = require('../lib/security'),
  data = require('../lib/data'),
  Users = require('../lib/data').Users,
  Organizations = require('../lib/data').Organizations,
  ObjectId = require('mongodb').ObjectID;

var auth = {
  authorizationMethods: {},
  authenticationMethods: {}
};

function securityMethod(securityType, selectedMethods) {
  var methods = [];

  if (selectedMethods === undefined) {
    methods = Object.keys(auth[securityType]);
  } else if (typeof selectedMethods === 'string') {
    methods.push(selectedMethods);
  } else if (Object.prototype.toString.call(selectedMethods) === '[object Array]') {
    methods = selectedMethods;
  }

  return function (req, res, next) {
    var securityMethods = [];

    // If Authorization header is present
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0],
          credentials = parts[1];
        if (auth[securityType][scheme] !== undefined && methods.indexOf(scheme) !== -1) {
          auth[securityType][scheme](req, res, next);
        } else {
          util.sendResponse(req, res, 403, {
            error: 'Unknown authorization header. Supported ' + securityType + ' methods are: ' + methods.join(' ')
          });
        }
      } // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown authorization header. Supported ' + securityType + ' methods are: ' + methods.join(' ')
        });
      }
    }
    // If no authorization, anonymous user
    else {
      req.user = null;
      next();
    }
  };
};

module.exports.authentication = function (methods) {
  return securityMethod('authenticationMethods', methods);
};

module.exports.authorization = function (methods) {
  return securityMethod('authorizationMethods', methods);
};

/**
 * Bearer token middleware
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
auth.authorizationMethods.Bearer = function (req, res, next) {

  var token = null;

  // If Authorization header is present
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];
      // Bearer token schema
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
        // Search for token in database
        Users.searchByBearerToken(token, function (err, user) {
          if (err) {
            winston.error("[API 500 ERROR] Error searching for bearer token %s: %s ", token, err);
            util.sendResponse(req, res, 500, {
              error: "Unknown error"
            });
          } else if (user) {
            // User found
            req.user = user;
            req.organization = user.organization; // attach organization._id to req
            next();
          } else {
            // No valid token found
            util.sendResponse(req, res, 401, {
              error: 'Invalid token'
            });
          }
        });
      }
      // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown Authorization header. Supported methods ' + auth.authorizationMethods.join(' ')
        });
      }
    }
    // If unknown authentication header
    else {
      util.sendResponse(req, res, 403, {
        error: 'Incomplete Authorization Header. Unknown format'
      });
    }
  }
  // If no authorization, anonymous user
  else {
    req.user = null;
    next();
  }

};

/**
 * HTTP Auth Basic authentication middleware
 * http://www.ietf.org/rfc/rfc2617.txt
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
auth.authenticationMethods.Basic = function (req, res, next) {

  var email = null;
  var password = null;

  // If Authorization header is present
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1],
        decodedCredentials,
        parts, user, password;
      // HTTP Basic schema
      if (/^Basic$/i.test(scheme)) {
        // decode and parse credentials
        decodedCredentials = new Buffer(credentials, 'base64').toString();
        parts = decodedCredentials.split(/:/);
        user = parts[0];
        password = parts[1];

        // Search for user by email in database
        Users.find({
          email: user
        }).limit(1).next(function (err, usr) {
          if (err) {
            winston.error("[API 500 ERROR] Error searching for user %s: %s ", user, err);
            util.sendResponse(req, res, 500, {
              error: "Unknown error"
            });
          } else if (usr) {
            util.validatePassword(password, usr.password, usr.salt, function (err, valid) {
              if (err || !valid) {
                util.sendResponse(req, res, 401, {
                  error: 'Invalid password'
                });
              } else {
                // User found
                req.user = usr;
                next();
              }
            });
          } else {
            // No user found
            util.sendResponse(req, res, 401, {
              error: 'User not found'
            });
          }
        });
      }
      // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown Authorization header. Supported methods ' + auth.authenticationMethods.join(' ')
        });
      }
    }
    // If unknown authentication header
    else {
      util.sendResponse(req, res, 403, {
        error: 'Incomplete Authorization Header. Unknown format'
      });
    }
  }
  // If no authorization 401 error with Auth Basic request
  else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Private Area"');
    util.sendResponse(req, res, 401, {
      error: 'Not Authorized'
    });
  }
};

/**
 * [keySecret description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
auth.authorizationMethods.WNS = function (req, res, next) {
  var keySignature, key, signature, scheme, parts, payloadSignature, organization;

  // If Authorization header is present
  if (req.headers && req.headers.authorization) {
    parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      scheme = parts[0],
        keySignature = parts[1];
      // WNS API Key schema
      if (/^WNS$/i.test(scheme)) {
        parts = keySignature.split(':');
        if (parts.length == 2) {
          key = parts[0];
          signature = parts[1];
          // Search for key in database
          Organizations.searchByAPIKey(key, function (err, result) {
            if (err) {
              winston.error("[API 500 ERROR] Error searching for organization by API Key %s: %s ", key, err.message);
              util.sendResponse(req, res, 500, {
                error: "Unknown error"
              });
            } else if (result && result[0]) {
              organization = result[0];
              if (security.checkSignature(req, signature, organization.apiKeys.secret)) {
                // User found
                req.organizationObject = organization;
                req.organization = organization._id; // attach organization._id to req
                next();
              } else {
                // Invalid signature
                util.sendResponse(req, res, 400, {
                  error: 'Invalid signature'
                });
              }
            } else {
              // No valid API Key found
              util.sendResponse(req, res, 401, {
                error: 'Invalid API Key'
              });
            }
          });
        } else {
          // No valid token found
          util.sendResponse(req, res, 401, {
            error: 'Invalid Key/signature'
          });
        }

      }
      // If unknown authentication header
      else {
        util.sendResponse(req, res, 403, {
          error: 'Unknown Authorization header. Supported methods ' + auth.authorizationMethods.join(' ')
        });
      }
    }
    // If unknown authentication header
    else {
      util.sendResponse(req, res, 403, {
        error: 'Incomplete Authorization header. Unknown format'
      });
    }
  }
  // If no authorization, anonymous user
  else {
    req.user = null;
    next();
  }
};

/**
 * Returns a middleware that executes an action based on controler/action names
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
module.exports.execAction = function (controller, action, accessLevel) {
  var ctrl = null;

  try {
    ctrl = require('./../controllers/' + controller);
  } catch (ex) {
    throw new Error(nutil.format('Controller %s not found', controller));
  }

  return (function (req, res, next) {
    try {
      // Test if actions exists
      if (ctrl[action] === undefined) throw "No action found";

      // Allow to get all public resource
      if (accessLevel === security.accessLevels.public) {
        ctrl[action](req, res, next);
      }
      // All API Keys bypass user role authorization
      else if (req.organizationObject !== undefined) {
        ctrl[action](req, res, next);
      }
      // Access granted
      else if (req.user !== undefined && util.allow(req.user, accessLevel)) {
        ctrl[action](req, res, next);
      }
      // Unauthorized access
      else {
        util.sendResponse(req, res, 401, {
          error: req.i18n.__('Unauthorized')
        });
      }
    } catch (e) {
      winston.error("No controller/action found: %s/%s %s", controller, action, e.stack);
      next();
    }

  });
};

module.exports.checkOwnerAndExecAction = function (controller, action, accessLevel) {

  return (function (req, res, next) {
    var parts = req.path.split("/");
    var model, id;

    if (!parts || parts.length < 3 || parts[1] == '' || parts[2] == '') {
      util.sendResponse(req, res, 500, {
        error: req.i18n.__('Invalid resource')
      });
    } else {
      // Check if model exists
      model = data.getModel(parts[1].toLowerCase());
      if (model) {
        try {
          id = ObjectId(parts[2]);
          // Check if entity exists
          model.find({
            _id: id
          }).limit(1).next(function (err, entity) {
            if (err) {
              winston.error('Error searching for entity /%s/%s: %s', parts[1], parts[2], err.message);
              util.sendResponse(req, res, 500, {
                error: req.i18n.__('Error searching for entity')
              });
            } else if (!entity) {
              util.sendResponse(req, res, 404, {
                error: req.i18n.__('No model found')
              });
            } else if (util.owns(req, entity)) {
              // Save in req and Call execAction
              req.entity = entity;
              module.exports.execAction(controller, action, accessLevel)(req, res, next);
            } else {
              util.sendResponse(req, res, 403, {
                error: req.i18n.__('Forbidden')
              });
            }
          });
        } catch (ex) {
          util.sendResponse(req, res, 400, {
            error: req.i18n.__('Invalid resource id')
          });
        }
        // Check if request user/organization owns entity
      } else {
        util.sendResponse(req, res, 500, {
          error: req.i18n.__('Invalid resource model')
        });
      }
    }
  });

};