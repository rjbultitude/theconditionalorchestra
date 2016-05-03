'use strict';

var config      = require('../config');
var gulp        = require('gulp');
var path        = require('path');

gulp.task('watch', ['scripts', 'styles'], function() {

    // Watch .scss files
    gulp.watch(path.join(config.styles.src, '**', '*.scss'), ['styles']);

    // Watch .js files
    gulp.watch(path.join(config.scripts.src, '**', '*.js'), ['jshint', 'jscs']);

});
