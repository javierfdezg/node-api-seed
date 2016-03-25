/*
 * Copyright (c) Why Not Soluciones, S.L.
 */

/*jslint node: true */
"use strict";

var langParser = require("acc-lang-parser");

/**
 * I18n middleware. Sets language based on Accept-Language header if present, if not present search for query param
 * @param  {[type]} app    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
module.exports = function (req, res, next) {
  var lang = null;
  if (req && req.headers["accept-language"]) {
    lang = langParser.extractFirstLang(req.headers["accept-language"]);
    req.i18n.setLocale(lang.language);
  } else {
    req.i18n.setLocaleFromQuery();
  }
  next();
};