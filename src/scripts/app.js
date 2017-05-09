'use strict';

var Tabs = require('./modules/tabs');
var jsLoad = require('./utilities/js-load');
var updateStatus = require('./modules/update-status');

// Web audio support?
if (!window.AudioContext && !window.webkitAudioContext) {
  updateStatus('noAudio');
  console.log('No Audio Context');
  return false;
} else {
  // start app
  var coordsForm = require('./modules/coords-form');
  var audioVisual = require('./modules/audio-visual');
  coordsForm();
  audioVisual();
  jsLoad();
  new Tabs( document.querySelector('[data-directive=tabs]') );
}
