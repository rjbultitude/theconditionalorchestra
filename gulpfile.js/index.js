'use strict';

var config  = require('./config');
var util    = require('gulp-util');

// What mode?
util.log('Running in', (config.production ? util.colors.red.bold('production') : util.colors.green.bold('development')), 'mode');

// Load tasks
var fs = require('fs');
fs.readdirSync('./gulpfile.js/tasks').forEach(function (task) {
    require('./tasks/' + task);
});
