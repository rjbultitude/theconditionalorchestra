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

##Browser support

Map and reduce are used in the JS but are supported by IE11+.
Web Audio is not supported in IE11 so the JS _should_ stop running before any non-supported JS is.

##App logic
1 master lwData (location weather) object is composed from the weather data.
1 wCheck object is used to contain all the various booleans needed to handle the app logic

A property `sParams` is added to store values for:
* frequency - filter frequency
* volume - not used
* distVolume - not used
* pitch

Important values:
* Visibility - Filter freq  
* Pressure - pitch root

The comment `playlogic` is used to denote the points at which the sounds are configured one way or another

If the weather _isHumid_ the chords played use only the intervals within the chosen interval type. This leads to a more harmonious sequence. No chord offset is applied.
If the weather _isFine_ a minor seventh scale is used, if _isClement_ a major one else a minor one is used. If the root note is higher than `0` (range is `-12` to `+12`) the chords move down the scale; if equal to or lower than `0` they move higher.

Notes in the brass sound and arpeggio are defined as follows:
If weather is _clement_ a scale using major intervals is produced
Else a minor scale is produced

Each note is assigned a different _pan_ position from an array of 3 (Left, Center, Right)

###Organ
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

###Long Notes
Plays for any type of weather. The note in each chord it plays depends on the _windBearing_.
The bearing angle determines which item in the array to playback in the `scale`.
The pan and volume are randomly selected from two arrays.

##Plans

Remove stop state for custom location submit button

Modulate padSounds volume for windy conditions

Use different array of intervals for rain arpeggio for seventh chords

Consider using `ozone` and `dew point` as another data input

After refactor the offset determined by pressure is a smaller range. Previously it spanned almost the whole allNotesArray and now it's just 12 notes either side of the centre freq

Create sequencer for stormy weather that uses brash percussive sounds

Test offline, bad connection states (after refactor of handleNoGeoData fn)

###Bugs
Playback rate bug - seems to exist only in Chrome

Sequencer volume bug seems to be Chrome only

Sequencer playback browser tab issue is in Chrome, Firefox and Safari

Night time should also manage the filter frequency as it affects visibility. Only works with daily endpoint :[

Use the icons
icon: A machine-readable text summary of this data point, suitable for selecting an icon for display. If defined, this property will have one of the following values: clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night. (Developers should ensure that a sensible default is defined, as additional values, such as hail, thunderstorm, or tornado, may be defined in the future.)

Add service worker for offline joy

Write a blog piece about creating the musical scales
