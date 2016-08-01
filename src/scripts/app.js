'use strict';

var coordsForm = require('./modules/coords-form');
var screenMode = require('./modules/screen-mode');
var conditionsDisplay = require('./modules/conditions-display');
var jsLoad = require('./modules/js-load');
var visualsDialog = require('./modules/visuals-dialog');
var Tabs = require('./modules/tabs');
//start app
coordsForm();
conditionsDisplay();
visualsDialog();
jsLoad();
new Tabs( document.querySelector('[data-directive=tabs]') );
