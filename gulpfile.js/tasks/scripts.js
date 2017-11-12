//stripDebug Strip console, alert, and debugger statements from JavaScript code 

'use strict';

var buffer          = require('vinyl-buffer');
var config          = require('../config');
var gulp            = require('gulp');
var path            = require('path');
var stripDebug      = require('gulp-strip-debug');
var uglify          = require('gulp-uglify');
var util            = require('gulp-util');
var browserify      = require('browserify');
var source          = require('vinyl-source-stream');
var watchify        = require('watchify');
var errorHandler    = require('../utilities/errorHandler');

var filename        = 'app.js';

var bundler = browserify({
    entries: [path.join(config.scripts.src, filename)],
    debug: !config.production,
    cache: {},
    packageCache: {},
    fullPaths: true
});

// What Browserify should do when building the bundle
function bundle() {
    console.log('in');
    return bundler.bundle()
        // log errors if they happen
        .on('error', errorHandler)
        .pipe(source(filename))
        .pipe(buffer())
        .pipe(config.production ? stripDebug() : util.noop())
        .pipe(config.production ? uglify() : util.noop())
        .pipe(gulp.dest(config.scripts.dist));
}

// Run watchify on update in dev mode
if (!config.production) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
        var updateStart = Date.now();

        // Mocking the script task in the console
        util.log('Starting', '\'' + util.colors.cyan.bold('scripts (watchify)') + '\'...');

        // Build the bundle
        bundle();

        // Mocking the script task in the console
        util.log('Finished', '\'' + util.colors.cyan.bold('scripts (watchify)') + '\'', 'after', util.colors.magenta.bold((Date.now() - updateStart) + 'ms'));
    });
}

gulp.task('scripts', ['copy-script'], bundle);
