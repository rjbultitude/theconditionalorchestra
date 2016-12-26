'use strict';

var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the templates/ folder relative to where gulp was executed
  gulp.src('src/scripts/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function
    .pipe(handlebars())
    // Wrap each template function in a call to Handlebars.template
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    // Declare template functions as properties and sub-properties of exports
    .pipe(declare({
      root: 'exports',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    // Concatenate down to a single file
    .pipe(concat('index.js'))
    // Add the Handlebars module in the final output
    .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
    // WRite the output into the templates folder
    .pipe(gulp.dest('src/scripts/templates/'));
});
