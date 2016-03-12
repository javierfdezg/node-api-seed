/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var Users = require('../users'),
  util = require('../../../util'),
  security = require('../../../security'),
  inherits = require('util').inherits,
  winston = require('winston'),
  transform = require('../../transformations'),
  validations = require('../../validations'),
  _ = require('lodash');

var UsersAdmin = module.exports = function (parent) {

  // copy parent model properties
  _.merge(this, parent);

  // Collection JSON Schema
  _.merge(this.schema, {
    properties: {}
  });
  // allow only admin role
  this.schema.properties.role.enum = [security.userRoles.admin];

  // Model transformations (from JSON to Javascript)
  _.merge(this.transformations, {
    properties: {}
  });

};

inherits(UsersAdmin, Users);