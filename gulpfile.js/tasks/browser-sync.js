'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var connect = require('gulp-connect-php');
var path        = require('path');
var config        = require('../config');

gulp.task('connect-sync', function() {
    connect.server({
        base: 'source',
        keepalive: true,
        hostname: 'localhost',
        port: 8080,
        open: false
    }, function() {
      browserSync({
            proxy: '127.0.0.1',
            port: 8080
        });
    });

    // Watch .js files
    gulp.watch(path.join(config.scripts.src, '**', '*.js'), ['jshint', 'jscs']).on('change', function () {
        browserSync.reload();
    });
    // Watch .scss files
    gulp.watch(path.join(config.styles.src, '**', '*.scss'), ['styles']).on('change', function () {
        browserSync.reload();
    });
   
    gulp.watch('**/*.php').on('change', function () {
      browserSync.reload();
    });
});