'use strict';

var config  = require('../config');
var gulp    = require('gulp');
var clean    = require('./clean');
var scripts    = require('./scripts');
var copyScript    = require('./copy-script');
var styles    = require('./styles');
var jshint    = require('./jshint');
var jscs    = require('./jscs');
var watch    = require('./watch');
var util = require('gulp-util');

gulp.task('default',
  gulp.series('clean',
    config.production ? gulp.parallel('scripts', 'copyScript', 'styles') : gulp.parallel('jshint', 'jscs', 'scripts', 'watch')
  )
);
