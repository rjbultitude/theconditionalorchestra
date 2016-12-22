'use strict';

var config = require('../config');
var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var path   = require('path');

gulp.task('jshint', function() {

    return gulp.src([
            path.join('gulpfile.js', '**', '*.js'),
            path.join(config.scripts.src, '**', '*.js'),
            '!' + path.join(config.scripts.src, 'libs', '*.js'),
            '!' + path.join(config.scripts.src, 'templates', '*.js'),
            '!' + path.join(config.scripts.src, 'plugins', '*.js'),
            '!' + path.join(config.scripts.src, '*.min.js')
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));

});
