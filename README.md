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

A property `soundParams` is added to store values for:
* frequency
* volume
* distVolume
* pitch
* soundPitchOffset

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

###Brass
The number of brass notes is _7_ if the weather is _stormy_
or the default _5_ for all other conditions

###Arpeggio
Precipitation plays an arpeggiated sequence
A precipType of `rain` with high precipIntensity - Fast and loud
A precipType of `sleet` - with high precipIntensity - Slower and less loud
A precipType of `snow` - played slowest and quieter

##Plans

Night time should also manage the filter frequency as it affects visibility. Only works with daily endpoint :[

Use the icons
icon: A machine-readable text summary of this data point, suitable for selecting an icon for display. If defined, this property will have one of the following values: clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night. (Developers should ensure that a sensible default is defined, as additional values, such as hail, thunderstorm, or tornado, may be defined in the future.)

Add service worker for offline joy
