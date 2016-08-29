/*
	This module loads and converts the data
	Three locations are used as the data sources

	Each location's properties are used to inform the shape of the sounds
	Wind bearing is mapped to used for the pitch
	Wind speed for volume
 */

'use strict';

var P5 = require('../libs/p5');
// handle AudioContext
// should be handled in P5
var audioSupported = true;
if (window.AudioContext || window.webkitAudioContext) {
  require('../libs/p5.sound');
}
else {
  audioSupported = false;
  console.log('No web Audio API');
}
var postal = require('postal');
var channel = postal.channel();
var intervals = require('./intervals');
var updateStatus = require('./update-status');
var SingleShape = require('./single-shape-cnstrctr');
var avSettings = require('./av-settings');
var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var duplicateArray = require('../utilities/duplicate-array-vals');
var getMeanVal = require('../utilities/get-mean-val');

module.exports = function() {
  /*
    Module scoped vars
  */

	// Sound containers
	var organSounds = [];
  var dropSound;
  var arpPhrase;
  var arpPart;
  var rainDropsPattern;
	// Array for all visual shapes
	var shapeSet = [];
  // dialog / modal
  var dialogIsOpen = false;
  // Visuals
  var sqSize = 25;
  var temperatureColour = 0;

  /*
    Utility functions
  */

	// Is this size or smaller
	function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  }

  function killCurrentSounds(isRunning) {
    if (isRunning) {
      // Stop arrpeggio
      arpPart.stop(0);
      // Fade organ sounds
      for (var i = 0; i < organSounds.length; i++) {
        organSounds[i].organ.fade(0,avSettings.fadeTime);
        organSounds[i].organDist.fade(0,avSettings.fadeTime);
      }
      // Fade rain drop sound
      dropSound.fade(0,avSettings.fadeTime);
      //Empty vars;
      organSounds = [];
      //TODO
      // Why is makeDropSound still being called?
      //dropSound = undefined;
      isRunning = false;
    }
  }

  function checkIntervalsVNotes(intervals, numNotes) {
    for (var scale in intervals) {
      if (intervals[scale] < numNotes) {
        console.log('interval scales have too few items for the number of notes', intervals[scale]);
        break;
      }
    }
  }

  function makeDropSound(time, playbackRate) {
    dropSound.rate(playbackRate);
    dropSound.play(time);
  }

	// main app init
	function init(locationData, isRunning) {
    // Kill playing sounds
    killCurrentSounds(isRunning);
    //Error check
    checkIntervalsVNotes(intervals, avSettings.numNotes);

    /*
      Create P5 Objects
    */
		// Create filter
    var soundFilter = null;
    if (audioSupported) {
      soundFilter = new P5.LowPass();
    }
    // Create phrase: name, callback, sequence
    if (typeof arpPhrase !== 'object' || typeof arpPhrase === 'undefined') {
      arpPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
      arpPart = new P5.Part();
    }

		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

      function isPrecip(locationData) {
        if (locationData.precipType.value !== undefined) {
          return locationData.precipIntensity.value >= 0;
        } else {
          console.log('No precipitation value');
          return false;
        }
      }

      function isCold(locationData) {
        return frnhtToCelcius(locationData.temperature.value) < 8;
      }

			function isClement(locationData) {
				return locationData.cloudCover.value < 0.5 && locationData.speed.value < 16;
			}

      function precipCategory(locationData) {
        if (locationData.precipType.value === 'rain' && locationData.precipIntensity.value > 0.2) {
          return 'hard';
        } else if (locationData.precipType.value === 'sleet' && locationData.precipIntensity.value <= 0.2) {
          return 'soft';
        } else if (locationData.precipType.value === 'snow' || locationData.precipIntensity.value <= 0.1) {
          return 'softest';
        } else {
          console.log('no rain? type is: ', locationData.precipType.value);
          return null;
        }
      }

      function addRandomStops(notesArray) {
        //duplicate notes
        var newNotesArray = [];
        newNotesArray = duplicateArray(newNotesArray, notesArray, 10);
        var randomStopCount = newNotesArray.length / 2;
        //Add stops
        for (var i = 0; i < randomStopCount; i++) {
          var randomIndex = sketch.random(0,newNotesArray.length);
          newNotesArray.splice(randomIndex, 0, 0);
        }
        return newNotesArray;
      }

      function playArp(arpeggioType, notesArray, soundFilter) {
        //Overwrite sequence with new notes
        var newNotesArray = addRandomStops(notesArray);
        arpPhrase.sequence = newNotesArray;
        arpPart.addPhrase(arpPhrase);
        // Set filter
        dropSound.disconnect();
        dropSound.connect(soundFilter);
        // Type logic
        if (arpeggioType === 'hard') {
          arpPart.setBPM(200);
          dropSound.amp(0.8);
        } else if (arpeggioType === 'soft') {
          arpPart.setBPM(155);
          dropSound.amp(0.5);
        } else if (arpeggioType === 'softest') {
          arpPart.setBPM(110);
          dropSound.amp(0.3);
        } else {
          console.log('problem with arrpeggio ', arpeggioType);
        }
        arpPart.start();
      }

			function playSounds(locationData, notesArray) {
				// Set filter
				//console.log('filter frequency: ', locationData.soundParams.freq.value);
				soundFilter.freq(locationData.soundParams.freq.value);
				soundFilter.res(20);

        // Handle precipitation
        if (isPrecip(locationData)) {
          playArp(precipCategory(locationData), notesArray, soundFilter);
        } else {
          arpPart.stop(0);
          console.log('no rain, no arpeggio');
        }

				for (var i = 0; i < organSounds.length; i++) {
					organSounds[i].organ.disconnect();
					organSounds[i].organDist.disconnect();
					organSounds[i].organ.connect(soundFilter);
					organSounds[i].organDist.connect(soundFilter);
					organSounds[i].organ.rate(notesArray[i]);
					organSounds[i].organDist.rate(notesArray[i]);
					organSounds[i].organ.amp(locationData.soundParams.soundVolume);
					organSounds[i].organDist.amp(locationData.soundParams.soundDistVolume);
					organSounds[i].organ.loop();
					organSounds[i].organDist.loop();
				}
        console.log('organSounds', organSounds);
        updateStatus('playing', locationData.name);
        channel.publish('play');
			}

			/*
				Major scale for clement weather
				Minor octave for anything else
			*/
			function assignPitches(locationData) {
				var centreNote = getMeanVal(locationData.soundParams.pitch.min, locationData.soundParams.pitch.max, 'pitch');
				var notesArray = [];

				if (isClement(locationData)) {
          console.log('assignPitches isClement');
					for (var i = 0; i < intervals.majorIntervals.length; i++) {
						notesArray.push(centreNote + intervals.majorIntervals[i] * avSettings.semitone);
					}
				} else {
          console.log('assignPitches is not clement');
					for (var j = 0; j < intervals.minorOctave.length; j++) {
						notesArray.push(centreNote + intervals.minorOctave[j] * avSettings.semitone);
					}
				}
				playSounds(locationData, notesArray);
			}

			/*
				Arbitarily assigned pitch values
				calculated by mapping conditions to pitch
			*/
			function mapPitchValues(locationData) {
        var notesArray = [];
        var count = 0;
				mappedValsLoop:
				for (var condition in locationData) {
          while (avSettings.numNotes > count) {
            if (locationData.hasOwnProperty(condition)) {
              if (condition === 'name' || condition === 'soundParams') {
                continue mappedValsLoop;
              }
              notesArray.push(sketch.map(locationData[condition].value, locationData[condition].min, locationData[condition].max, locationData.soundParams.pitch.min, locationData.soundParams.pitch.max).toFixed(4));
            }
            count++;
            continue mappedValsLoop;
          }
				}
        console.log('mapPitchValues');
				// continue with sound processing
				playSounds(locationData, notesArray);
			}

			/*
				Sound algorithm
				---------------
				Currently it pitches the notes arbitarily
				using 'character' values
				The distorition is set by cloud cover
				The note volume is set by wind speed
				The root key is set by the air pressure
				The filter frequency is set by visibility
			 */
			function configureSounds(locationData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundParams.distVolume = sketch.map(Math.round(locationData.cloudCover.value), locationData.cloudCover.min, locationData.cloudCover.max, locationData.soundParams.distVolume.min, locationData.soundParams.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundParams.volume = sketch.map(Math.round(locationData.speed.value), locationData.speed.min, locationData.speed.max, locationData.soundParams.volume.min, locationData.soundParams.volume.max) - locationData.soundParams.distVolume/3;
					//Pressure determines root note
					locationData.soundParams.soundPitchOffset = sketch.map(Math.round(locationData.pressure.value), locationData.pressure.min, locationData.pressure.max, 0, 0.5);
					//pitch range
					locationData.soundParams.pitch.min = 0.5 + locationData.soundParams.soundPitchOffset;
					locationData.soundParams.pitch.max = 1.5 + locationData.soundParams.soundPitchOffset;
					//visibility is filter freq
					locationData.soundParams.freq.value = sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max);
					// continue with sound processing
          // use arbitrary scale for cold places
          if (isCold(locationData)) {
            mapPitchValues(locationData);
          }
          // and heptatonic for warm weather
          else {
            assignPitches(locationData);
          }
			}

			//Accepts number of horizontal and vertical squares to draw
			function createShapeSet(hSquares, vSquares) {
				var index = 0;
				for (var i = 0; i < hSquares; i++) {
					for (var j = 0; j < vSquares; j++) {
						index++;
						var shape = new SingleShape(i * sqSize, j * sqSize, sqSize - 1, sketch.random(70,130), index);
						shapeSet.push(shape);
					}
				}
			}

			//Sound constructor
			function WeatherSound(organ, organDist) {
				this.organ = organ;
				this.organDist = organDist;
			}

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
        if (audioSupported) {
          for (var i = 0; i < avSettings.numNotes; i++) {
            organSounds[i] = new WeatherSound(
              sketch.loadSound('/audio/organ-C2.mp3'),
              sketch.loadSound('/audio/organ-C2d.mp3')
            );
          }
          dropSound = sketch.loadSound('/audio/drop.mp3');
        }
			};

			sketch.setup = function setup() {
				//If this size or smaller
				if (matchMediaMaxWidth(540).matches) {
						avSettings.cWidth = 400;
						avSettings.cHeight = 800;
						avSettings.cPadding = '200%';
				}
				//Canvas setup
				var myCanvas = sketch.createCanvas(avSettings.cWidth, avSettings.cHeight);
				myCanvas.parent(avSettings.cContainerName);
				var cContainer = document.getElementById(avSettings.cContainerName);
				cContainer.style.paddingBottom = avSettings.cPadding;
				sketch.frameRate(25);
				sketch.background(0, 0, 0);
        //create shapes in grid
				var hSquares = Math.round(sketch.width/sqSize);
				var vSquares = Math.round(sketch.height/sqSize);
        createShapeSet(hSquares, vSquares);
        //set runtime constants
				avSettings.animAmount = Math.round(locationData.speed.value);
				avSettings.noiseInc = sketch.map(avSettings.animAmount, locationData.speed.min, locationData.speed.max, 0.01, 0.05);
				temperatureColour = sketch.map(locationData.temperature.value, locationData.temperature.min, locationData.temperature.max, 25, 255);
				//console.log('locationData', locationData);
				//handle sounds
        if (audioSupported) {
          configureSounds(locationData);
        } else {
          updateStatus('noAudio');
        }
			};

			sketch.draw = function draw() {
				sketch.background(0, 0, 0, 0);
        if (dialogIsOpen) {
          for (var i = 0; i < shapeSet.length; i++) {
            shapeSet[i].update(sketch, avSettings.noiseInc, avSettings.animAmount);
            shapeSet[i].paint(sketch, temperatureColour, avSettings.colourDim);
          }
        }
			};

		}, 'canvas-container');

		return myP5;
	}

	channel.subscribe('userUpdate', function(data) {
    // If app is already running
    if (organSounds.length > 0) {
      init(data, true);
    }
    // If running for the first time
    else if (organSounds.length === 0) {
      init(data, false);
    }
	});

  channel.subscribe('dialogOpen', function() {
    dialogIsOpen = true;
  });

  channel.subscribe('dialogClosed', function() {
    dialogIsOpen = false;
  });

  channel.subscribe('stop', function() {
    killCurrentSounds(true);
  });

	return true;
};
