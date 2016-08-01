'use strict';
var A11yDialog = require('a11y-dialog');

module.exports = function() {
  // Get the dialog element (with the accessor method you want)
  var dialogEl = document.getElementById('visuals-dialog');

  // Instanciate a new A11yDialog module
  var dialog = new A11yDialog(dialogEl);
};
