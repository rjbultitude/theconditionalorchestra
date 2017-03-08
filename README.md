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

Chord sequences don't seem to vary enough

Sound used for fine is by far the most interesting - perhaps some other pad sounds should aspire to this

Volume of dropSound and harp seems to be very low - could be the order of method calls

consider using airpad-C3 for longNote as supplement to flute

There's not enough chords in each sequence array for the Number of main sequence chords

Some sounds (like the aero) haven't been tested yet

Some arpeggio melodies still clash a little with the chords

Test the master filter against the pad and longNote sounds, particularly with lower frequencies

Consider using a state manager to update the humid arpeggio and display (chords)

Consider only playing arpeggios when the inversions are being used

Modulate padSounds volume/rate/pan for windy conditions - requires sounds to be assigned to master channel

Create 'Add to home screen' button

Update logic App Logic and spreadsheet

Consider program reflow where only one master set of frequencies is used for all instruments.
In this scenario the maximum number of octaves for _all_ sounds is determined and then one master array used for all (this is on `feature/webworker`)

Test offline, bad connection states (after refactor of handleNoGeoData fn)

May need to Upgrade to google maps 3 : https://developers.google.com/maps/documentation/javascript/v2tov3

###Bugs

Choral sound seems to be only one semitone apart

LongNote playMode could be a target for weather data

Browser still shows audio playing icon when it's stopped

After stop fade out is louder than normal playback, firefox only

One of the chords still sounds dischordant, why? Longnote, bass and pad going out of synch. Is this all browsers?

No playback on 1st load Safari - might be ok now

Sequencer volume bug seems to be Chrome only

Sequencer playback browser tab issue is in Chrome, Firefox and Safari

Minor - Sequencer onStep only counts the steps in one single pass rather than the loop

Night time should also manage the filter frequency as it affects visibility. Only works with daily endpoint :[

Add service worker for offline joy

Write a blog piece about creating the musical scales
