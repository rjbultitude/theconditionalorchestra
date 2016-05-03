'use strict';

var util = require('gulp-util');

module.exports = function(error) {
    util.log(util.colors.red.bold('Error' + (error.plugin ? ': ' + error.plugin : '')), '\n\n' + error.message + '\n', error.stack);
    this.emit('end');
    return;
};
