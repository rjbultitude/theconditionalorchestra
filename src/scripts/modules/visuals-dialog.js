'use strict';
var A11yDialog = require('a11y-dialog');
var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
  // Get the dialog element (with the accessor method you want)
  var dialogEl = document.getElementById('visuals-dialog');

  // Instanciate a new A11yDialog module
  var dialog = new A11yDialog(dialogEl);

  dialogEl.addEventListener('dialog:show', function (e) {
    channel.publish('dialogOpen', e.target);
  });
  dialogEl.addEventListener('dialog:hide', function (e) {
    channel.publish('dialogClosed', e.target);
  });
};
