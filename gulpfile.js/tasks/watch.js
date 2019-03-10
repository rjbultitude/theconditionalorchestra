'use strict';

var config      = require('../config');
var gulp        = require('gulp');
var path        = require('path');
var scripts    = require('./scripts');
var styles    = require('./styles');
var jshint    = require('./jshint');
var jscs    = require('./jscs');

gulp.task('watch', gulp.parallel('scripts', 'styles'), function() {

    // Watch .js files
    gulp.watch(path.join(config.scripts.src, '**', '*.js'), gulp.parallel('jshint', 'jscs'));
    gulp.watch(path.join(config.styles.src, '**', '*.scss'), gulp.parallel('styles'));
});
