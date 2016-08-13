'use strict';

var coordsForm = require('./modules/coords-form');
var audioVisual = require('./modules/audio-visual');
var conditionsDisplay = require('./modules/conditions-display');
var jsLoad = require('./modules/js-load');
var visualsDialog = require('./modules/visuals-dialog');
var Tabs = require('./modules/tabs');
//start app
coordsForm();
audioVisual();
conditionsDisplay();
visualsDialog();
jsLoad();
new Tabs( document.querySelector('[data-directive=tabs]') );
