'use strict';

var autoprefixer = require('gulp-autoprefixer');
var config       = require('../config');
var errorHandler = require('../utilities/errorHandler');
var gulp         = require('gulp');
var minifyCss    = require('gulp-minify-css');
var path         = require('path');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var util         = require('gulp-util');

gulp.task('styles', function() {

    return gulp.src(path.join(config.styles.src, '*.scss'))
        .pipe(config.production ? util.noop() : sourcemaps.init())
            .pipe(sass(config.sass))
                .on('error', errorHandler)
            .pipe(autoprefixer(config.autoprefixer))
                .on('error', errorHandler)
        .pipe(config.production ? util.noop() : sourcemaps.write())
        .pipe(config.production ? minifyCss() : util.noop())
        .pipe(gulp.dest(path.join(config.styles.dist)));

});
