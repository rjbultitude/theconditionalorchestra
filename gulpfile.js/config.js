'use strict';

var path = require('path');
var util = require('gulp-util');

module.exports = {
    autoprefixer: {
        browsers: [
            'last 2 versions',
            'Android 4',
            'IE 8',
            'IE 9',
            'iOS >= 6'
        ]
    },
    production: !!util.env.production,
    sass: {
        errLogToConsole: true
    },
    scripts: {
        dist:  path.join('dist', 'scripts'),
        src:   path.join('src', 'scripts')
    },
    styles: {
        dist:  path.join('dist', 'styles'),
        src:   path.join('src', 'styles')
    }
};
