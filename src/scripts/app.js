'use strict';

var coordsForm = require('./modules/coords-form');
var audioVisual = require('./modules/audio-visual');
var Tabs = require('./modules/tabs');
var jsLoad = require('./utilities/js-load');
//start app
coordsForm();
audioVisual();
jsLoad();
new Tabs( document.querySelector('[data-directive=tabs]') );
