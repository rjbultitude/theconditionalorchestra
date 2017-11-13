'use strict';

var config = require('../config');
var gulp = require('gulp');
var path = require('path');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

gulp.task('copy-script', function() {
  // Load templates from the templates/ folder relative to where gulp was executed
  gulp.src(path.join(config.scripts.src, 'sw/pwabuilder-sw.js'))
  .pipe(config.production ? stripDebug() : util.noop())
  .pipe(config.production ? uglify() : util.noop())
  .pipe(gulp.dest('./'));
});
