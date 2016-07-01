'use strict';

var config  = require('../config');
var gulp    = require('gulp');

gulp.task('default', ['clean'], function() {

    return gulp.start(config.production ? ['scripts'] : ['jshint', 'jscs', 'scripts', 'watch']);

});
