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

Keep the `humans.txt` updated and ensure the site has a `favicon.ico`.

Note: Please view the README.md files within each folder for more info.

## Installation

*Run (in this directory):*

  `npm install`

This ensures the all the node packages are installed. Follow the [NPM guide](https://docs.npmjs.com/cli/install) to install new packages.

## Build

[Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) is a task based build tool. It has been configured to run in two modes, development and production. Gulp will create, clean and manage the `dist` folder.

### Development

Styles and scripts will be processed and watched for changes. Scripts will be linted.

*Run (in this directory):*

  `npm run gulp`

### Production

Styles and scripts will be processed and minified.

*Run (in this directory):*

  `npm run gulp --production`

## References

* [p5.js](http://p5js.org/)
* [Forecast.io JS API](https://github.com/iantearle/forecast.io-javascript-api)
* [Moment.js](http://momentjs.com/)
* [JS Promises Polyfill](https://www.npmjs.com/package/es6-promise-polyfill)

##To do

* Remove unused code from Forecast.io JS API

##Business logic
1 master locationData object is composed from the weather data.

A property `sParams` is added to store values for:
* frequency - filter frequency
* volume - not used
* distVolume - not used
* pitch
* soundPitchOffset - pitch root

Important values:
* Visibility - Filter freq  
* Cloud cover - sound dist volume
* Pressure - pitch root
* Wind speed - sound volume

A threshold temperature value `soundPitchOffset` defines whether the sound scale is predefined or tuned to arbitrary values

If the weather is _warm_ or _cold_ a chromatic equal temperament scale is produced
if the weather is _warm_ the scale will be a western 2 note scale
If the weather is _cold_ the scale will be (non western) 14 - 24 note scale
If weather is _freezing_ an arbitrary set of notes is produced using the _Important Values_ TBC

Notes in the brass sound and arpeggio are defined as follows:
If weather is _clement_ a scale using major intervals is produced
Else a minor scale is produced

Each note is assigned a different _pan_ position from an array of 3 (Left, Center, Right)

###Organ
The number of organ notes is _7_ if the weather is _stormy_
or the default _5_ for all other conditions TBC

###Choral
Two choral notes are played when the weather is _fine_

###Bass
One bass note is played when the weather _isCloudy_

###Arpeggio
Precipitation plays an arpeggiated sequence
A precipType of `rain` with high precipIntensity - Fast and forwards dropSound
A precipType of `sleet` - with high precipIntensity - Slower and reverse dropSound
A precipType of `snow` - playes slowest - Slower and reverse dropSound

##Plans

After refactor the offset determined by pressure is a smaller range. Previously it spanned almost the whole allNotesArray and now it's just 6 notes either side of the centre freq

Make static data more sonically interesting - set precipIntensity and wind values

Playback rate bug - seems to exist only in Chrome

Sequencer volume bug seems to be Chrome only

Sequencer playback browser tab issue is in Chrome, Firefox and Safari

Modulate master volume for windy conditions. Requires sounds to be routed through one channel

Consider using ozone as another data input

Could use one master allNotesArray and ensure all scale arrays are constrained

Use wind bearing for brass pan. 0 - 180deg is a pan from L to R, 181 - 360deg is pan from R to L

Check visibility filter

Create sequencer for stormy weather that uses brash percussive sounds

Test offline, bad connection states (after refactor of handleNoGeoData fn)

Decide on program pattern - are we always passing in member vars to functions or not?
Drop lwData from all arguments

Night time should also manage the filter frequency as it affects visibility. Only works with daily endpoint :[

Use the icons
icon: A machine-readable text summary of this data point, suitable for selecting an icon for display. If defined, this property will have one of the following values: clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night. (Developers should ensure that a sensible default is defined, as additional values, such as hail, thunderstorm, or tornado, may be defined in the future.)

Add service worker for offline joy

Write a blog piece about creating the musical scales
