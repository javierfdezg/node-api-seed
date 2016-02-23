/*
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */
/*jslint node: true */
"use strict";

var app, winston = require('winston'),
  express = require('express'),
  https = require('https'),
  http = require('http'),
  envConfig = require('node-env-configuration'),
  defaults = require('./config/params'),
  config = envConfig(defaults.appName, defaults),
  fs = require('fs'),
  cluster = require('cluster');

var cpuCount = 1;

function restartWorker(worker) {
  winston.warn("Worker %s died. Create another worker", worker.id);
  cluster.fork();
};

if (cluster.isMaster && config.clusterMode) {

  cpuCount = require('os').cpus().length;

  winston.info("Cluster mode on. Starting %d workers…", cpuCount);

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
    // Listen for dying workers and replace
    cluster.on('exit', restartWorker);
  }

} else {

  app = express();

  // production flag
  app.set("production", config.httpp == 80 && config.httpsp == 443);

  // Disable X-Powered-By HTTP response header 
  app.disable('x-powered-by');

  // Create log directory if not exits (Sync call, acceptable on startup)
  if (!fs.existsSync(config.logging.directory)) {
    fs.mkdirSync(config.logging.directory, '0755');
  }

  // Logging config
  require('./config/logging')(app, config);

  // Data layer connection and server startup
  require('./lib/data')(app, config.data, function (err) {
    // No data connection available
    if (err) {
      winston.error(err.toString());
    } else {

      winston.info("Mongo connection established")

      // ==============================================================
      // Routes for API & static resources middleware config.
      // ==============================================================

      require('./config/routes')(app, config);

      require('./config/shutdown')(app, config);

      // HTTPS config
      var options = {
        ca: fs.readFileSync(config.ssl.servercapath),
        key: fs.readFileSync(config.ssl.serverkeypath),
        cert: fs.readFileSync(config.ssl.servercrtpath),
        requestCert: false,
        rejectUnauthorized: false
      };

      // Start listening
      var httpServer = http.createServer(app).listen(config.httpp);
      winston.info("HTTP server started at %d port", config.httpp);
      // Avoid ESTABLISHED sockets bug: lsof -i -n -P | grep node
      httpServer.on('connection', function (socket) {
        socket.setTimeout(config.sockettimeout, function () {
          socket.destroy();
        });
      });

      if (config.activessl) {
        var httpsServer = https.createServer(options, app).listen(config.httpsp);
        winston.info("HTTPS server started at %d port", config.httpsp);
        // https://github.com/joyent/node/issues/7764
        httpsServer.on("secureConnection", function (clearText) {
          clearText.setTimeout(config.sockettimeout);
        });
      }
    }
  });

}

// process event handlers
process.on('uncaughtException', function (err) {
  // handle the error safely
  winston.error('Uncaught Exception. Stack trace:\n%s', err.stack);
});

module.exports = app;