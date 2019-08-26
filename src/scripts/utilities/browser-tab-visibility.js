'use strict';

var postal = require('postal');
var channel = postal.channel();

module.exports = (function() {
  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange;
  if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  // If the page is hidden, pause the video;
  // if the page is shown, play the video
  function handleVisibilityChange() {
    if (document[hidden]) {
      channel.publish('tabHidden');
    }
  }

  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (typeof document.addEventListener === 'undefined' || typeof document[hidden] === 'undefined') {
    console.log('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
  } else {
    // Handle page visibility change
    console.log('visibilityChange', visibilityChange);
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
  }
})();
