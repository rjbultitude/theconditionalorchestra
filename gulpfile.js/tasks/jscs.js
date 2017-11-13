'use strict';

var config = require('../config');
var gulp   = require('gulp');
var jscs   = require('gulp-jscs');
var path   = require('path');

gulp.task('jscs', function() {

    return gulp.src([
            path.join('gulpfile.js', '**', '*.js'),
            path.join(config.scripts.src, '**', '*.js'),
            '!' + path.join(config.scripts.src, 'libs', '*.js'),
            '!' + path.join(config.scripts.src, 'plugins', '*.js'),
            '!' + path.join(config.scripts.src, 'sw', '*.js'),
            '!' + path.join(config.scripts.src, '*.min.js')
        ])
        .pipe(jscs('.jscsrc'));

});
