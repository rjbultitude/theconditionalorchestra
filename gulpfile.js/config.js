'use strict';

var path = require('path');
var util = require('gulp-util');

module.exports = {
    production: !!util.env.production,
    sass: {
        errLogToConsole: true
    },
    scripts: {
        dist:  path.join('dist', 'scripts'),
        src:   path.join('src', 'scripts'),
        srcSW:   path.join('src', 'sw')
    },
    styles: {
        dist:  path.join('dist', 'styles'),
        src:   path.join('src', 'styles')
    }
};
