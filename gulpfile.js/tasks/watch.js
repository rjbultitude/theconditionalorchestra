'use strict';

var config      = require('../config');
var gulp        = require('gulp');
var path        = require('path');

gulp.task('watch', ['scripts'], function() {

    // Watch .js files
    gulp.watch(path.join(config.scripts.src, '**', '*.js'), ['jshint', 'jscs']);

});
