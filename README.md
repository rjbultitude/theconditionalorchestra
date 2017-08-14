# The Conditional Orchestra

## Structure

	.
	├── dist               (created and managed by Gulp)
	├── audio
	├── fonts
	├── img
	├── node_modules       (created and managed by NPM)
	├── src
	│   ├── scripts
	│   └── styles
	├── .jscsrc
	├── .jshintrc
	├── favicon.ico
	├── gulpfile.js
	│   ├── tasks
	│   ├── utilities
	│   ├── config.js
	│   └── index.js
	├── humans.txt
	├── index.html
	├── package.json
	├── README.md
	└── releasenotes.md

The `/src` folder contains all JavaScript and Sass. Gulp will process these files using the configuration outlined in `/gulpfile.js`, create the `/dist` folder and save the proccessed files into the `/dist` folder.

[Browserify](http://browserify.org/) is used to manage and bundle JavaScript modules.

[JSCS](http://jscs.info/rules.html) and [JS Hint](http://jshint.com/docs/options/) are used to highlights stylisitic and syntactical JS issues. Rules used are listed in `.jscsrc` and `.jshintrc` respectively.

## Installation

*Run (in this directory):*

  `npm install`

This ensures the all the node packages are installed. Follow the [NPM guide](https://docs.npmjs.com/cli/install) to install new packages.

## Build

Before running any of the standard tasks be sure to run `gulp templates` which will precompile the handlebars template ready for use in the app.

[Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) is used to bundle the app. It runs in two modes: `development` and `production`. To run in development mode run 

`gulp`

to run in production mode simply add the production flag

`gulp --production`

Gulp will create, clean and manage the `dist` folder.
Styles and scripts will be processed and watched for changes. Scripts will be linted.

## References

* [Freqi](https://www.npmjs.com/package/freqi)
* [p5.js](http://p5js.org/)
* [DarkSkyJS](https://www.npmjs.com/package/darkskyjs)
* [Moment.js](http://momentjs.com/)
* [JS Promises Polyfill](https://www.npmjs.com/package/es6-promise-polyfill)

##Browser support

Map and reduce are used in the JS but are supported by IE11+.
Web Audio is not supported in IE11 so the app will stop running before any non-supported JS is.

##App logic
See the module audio-getters.js for most of the app logic

##Plans

Consider using a callback (loop) for all sounds so as to circumnavigate the inactive tab issue. Or...

Consider using the [page visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) to prevent sounds form playing when tab is not active.

Write unit tests

Consider using windyTV map rather than text input

Consider reducing the max number of pad notes (for performance and sonic overcrowding purposes). If implementing thisx, consider making a second longNote that uses a note from within the scale but beyond the highest index of the numPadNotes
---
Harp could be something other than humidity - humidity should be evoked by noise

Consider using a state manager and one master sound object

Create 'Add to home screen' button

Update logic App Logic and spreadsheet

Refactor the display fns so that they're chained

###Bugs

After stop fade out is louder than normal playback, firefox only - caused by the filter not being applied.

No longer relevant - Sequencer onStep only counts the steps in one single pass rather than the loop

##p5 usage

Filters
 * P5.LowPass
 * P5.HighPass

 Reverb
 * P5.Reverb

 Maths
 * sketch.TWO_PI
 * sketch.sin
 * sketch.cos
 * sketch.random (number)
 * sketch.random (index in array)

 Draw loop
 * sketch.draw
 * sketch.noLoop
 * sketch.setup
 * sketch.frameRate
 * sketch.frameCount

 Audio
 * sketch.preload
 * sketch.loadSound
 * sketch.masterVolume
