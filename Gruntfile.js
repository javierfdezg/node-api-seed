/*
 * Reimpacto
 *
 * Copyright (c) 2014 Why Not Soluciones, S.L.
 * Licensed under the Copyright license.
 */

/*jslint node: true */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concurrent: {
      dev: {
        // Change shell:elasticsearch task to whatever task you want to run in parallel to node server
        tasks: ['nodemon:dev', 'shell:elasticsearch'],
        options: {
          logConcurrentOutput: true
        },
      }
    },

    shell: {
      // Change this command to whatever command you want to run in parallel to node server
      elasticsearch: {
        command: 'elasticsearch --config=/usr/local/opt/elasticsearch/config/elasticsearch.yml',
        options: {
          async: true
        }
      },
      functional: {
        command: 'mocha -R spec --recursive test/functional',
      }
    },

    nodemon: {
      dev: {
        script: 'src/app.js',
        options: {
          ignore: ['README.md'],
          watch: ['src'],
          delayTime: 1,
          cwd: __dirname
        }
      }
    }

  });

  // Default task
  grunt.registerTask('default', ['concurrent:dev']);

  // Test
  grunt.registerTask('test', ['shell:functional']);

};