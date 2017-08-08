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

* [p5.js](http://p5js.org/)
* [Forecast.io JS API](https://github.com/iantearle/forecast.io-javascript-api)
* [Moment.js](http://momentjs.com/)
* [JS Promises Polyfill](https://www.npmjs.com/package/es6-promise-polyfill)

##Browser support

Map and reduce are used in the JS but are supported by IE11+.
Web Audio is not supported in IE11 so the JS _should_ stop running before any non-supported JS is.

##App logic
_Please note this is out of date_
1 master lwData (location weather) object is composed from the weather data.
1 wCheck object is used to contain all the various booleans needed to handle the app logic

Important values:
* Visibility - Filter freq  
* Pressure - pitch root

The comment `playlogic` is used to denote the points at which the sounds are configured using weather data.

If the weather _isHumid_ the chords played use only the intervals within the chosen interval type. This leads to a more harmonious sequence. No chord offset is applied.
If the root note is higher than `0` (range is `-12` to `+12`) the chords move down the scale; if equal to or lower than `0` they move higher.

Notes in the brass sound and arpeggio are defined as follows:
If weather is _clement_ a scale using major intervals is produced
Else a minor scale is produced

Each note is assigned a different _pan_ position from an array of 3 (Left, Center, Right)

###Pad
The number of organ notes is _3_ if the weather is _stormy_
or the default _4_ for all other conditions TBC
An extra chord (which is currently pitched down an octave) is played a given number of times

###Choral
Two choral notes are played when the weather is _fine_ or _freezing_
When _freezing_ a high pass filter is applied whose freq moves up on each iteration of _draw_

###Bass
One bass note is played when the weather _isCloudy_ but *not* _isWindy_
The note is the first note of each chord in the chord sequence

###Rain Arpeggio
Precipitation plays an arpeggiated sequence
A precipType of `rain` with high precipIntensity - Fast and forwards dropSound
A precipType of `sleet` - with high precipIntensity - Slower and reverse dropSound
A precipType of `snow` - plays slowest - Slower and reverse dropSound

###Clement Arpeggio
Applied to all clement conditions. Plays one type of sequence (pitches and stops) when
weather _ishumid_ and another when it's not.
A randomly selected note from the sequence array is played when the sequence has played twice.

###Long Notes
Plays for any type of weather. The note in each chord it plays depends on the _windBearing_.
The bearing angle determines which item in the array to playback in the `scale`.
The pan and volume are randomly selected from two arrays.

##Plans

Use `uvIndex` as data point

Only output chordType if using inversions

Write unit tests

Consider using windyTV map rather than text input

Consider reducing the max number of pad notes (for performance and sonic overcrowding purposes)

If implementing the above, consider making a second longNote that uses a note from within the scale but beyond the highest index of the numPadNotes
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
