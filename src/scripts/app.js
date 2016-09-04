'use strict';

var coordsForm = require('./modules/coords-form');
var audioVisual = require('./modules/audio-visual');
var conditionsDisplay = require('./modules/conditions-display');
var visualsDialog = require('./modules/visuals-dialog');
var Tabs = require('./modules/tabs');
var jsLoad = require('./utilities/js-load');
//start app
coordsForm();
audioVisual();
conditionsDisplay();
visualsDialog();
jsLoad();
new Tabs( document.querySelector('[data-directive=tabs]') );
