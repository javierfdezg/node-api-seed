/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

// Remember to update also in app/www/js/services/user.js
var userRoles = {
  public: 0x01, // 000000001: public user
  admin: 0x02 // 0000000010 
};

// Remember to update also in app/www/js/services/user.js
var accessLevels = {
  // Public level
  public: userRoles.public | userRoles.admin,
  // Logged in level
  loggedin: userRoles.admin
};

module.exports.userRoles = userRoles;
module.exports.accessLevels = accessLevels;