/*
	This module loads and converts the data
	Three locations are used as the data sources

	Each location's properties are used to inform the shape of the sounds
	Wind bearing is mapped to used for the pitch
	Wind speed for volume
 */

'use strict';

var P5 = require('../libs/p5');
require('../libs/p5.sound');
var audioSupported = true;
var postal = require('postal');
var channel = postal.channel();
var updateStatus = require('./update-status');
var SingleShape = require('./single-shape-cnstrctr');
var weatherCheck = require('./weather-checker-fns');
var intervals = require('../utilities/intervals');
var generateFreqScales = require('../utilities/generate-freq-scales');
var duplicateArray = require('../utilities/duplicate-array-vals');
var getMeanVal = require('../utilities/get-mean-val');
var avSettings = require('../settings/av-settings');

module.exports = function() {
  /*
    Module scoped vars
  */

	// Sound containers
	var organSounds = [];
  var dropSound;
  var arpPhrase;
  var arpPart;
  var soundFilter;
  var rainDropsPattern = [0];
  var freqScales = generateFreqScales();
	// Array for all visual shapes
	var shapeSet = [];
  // dialog / modal
  var dialogIsOpen = false;
  // Visuals
  var sqSize = 25;
  var temperatureColour = 0;
  //
  var pee5 = new P5();

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
      arpPart.removePhrase('rainDrops');
      // Fade organ sounds
      for (var i = 0; i < organSounds.length; i++) {
        organSounds[i].organ.fade(0,avSettings.fadeTime);
        organSounds[i].organDist.fade(0,avSettings.fadeTime);
      }
      // Fade rain drop sound
      dropSound.fade(0,avSettings.fadeTime);
      //Empty vars;
      organSounds = [];
      isRunning = false;
    }
  }

  function checkIntervalsVNotes(intervals, numNotes) {
    for (var scale in intervals) {
      if (intervals[scale] < numNotes) {
        console.log('interval scales have too few items for the number of notes', intervals[scale]);
        return false;
      }
    }
    return true;
  }

  function makeDropSound(time, playbackRate) {
    dropSound.rate(playbackRate);
    dropSound.play(time);
  }

  function setNumNotes(locationData) {
    if (weatherCheck.isStormy(locationData.cloudCover.value, locationData.speed.value, locationData.precipIntensity.value)) {
      avSettings.numNotes = 6;
    } else {
      avSettings.numNotes = 4;
    }
    // Then error check
    checkIntervalsVNotes(intervals, avSettings.numNotes);
    return avSettings.numNotes;
  }

  /**
   * [createP5SoundObjs creates various P5 sound objects if AudioContext is supported]
   * @param  {[boolean]} audioSupported [whether AudioContext is supported]
   * @return {[object]}                [All the sound objects]
   */
  function createP5SoundObjs(audioSupported) {
    if (audioSupported) {
      soundFilter = new P5.LowPass();
      // Create phrase: name, callback, sequence
      arpPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
      arpPart = new P5.Part();
    }
    return {
      soundFilter: soundFilter,
      arpPhrase: arpPhrase,
      arpPart: arpPart
    };
  }

	// main app init
	function init(locationData) {
    // Set the number of organSounds
    var numberofnotes = setNumNotes(locationData);
    console.log('numberofnotes', numberofnotes);

		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

      function precipCategory(locationData) {
        if (locationData.precipType === 'rain' && locationData.precipIntensity.value > 0.2) {
          return 'hard';
        } else if (locationData.precipType === 'sleet' && locationData.precipIntensity.value <= 0.2) {
          return 'soft';
        } else if (locationData.precipType === 'snow' || locationData.precipIntensity.value <= 0.1) {
          return 'softest';
        } else {
          console.log('no rain? type is: ', locationData.precipType);
          return null;
        }
      }

      function addRandomStops(notesArray) {
        //duplicate notes
        var newNotesArray = duplicateArray(notesArray, 10);
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
        console.log('notesArray', notesArray);
				// Set filter
				soundFilter.freq(locationData.soundParams.freq.value);
				soundFilter.res(20);

        // Handle precipitation
        if (weatherCheck.isPrecip(locationData.precipType, locationData.precipIntensity.value)) {
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
          organSounds[i].organ.amp(locationData.soundParams.volume.value);
					organSounds[i].organDist.amp(locationData.soundParams.distVolume.value);
					organSounds[i].organ.loop();
					organSounds[i].organDist.loop();
				}
        channel.publish('play', audioSupported);
			}

      /*
				Major scale for clement weather
				Minor octave for anything else
			*/
			function assignPitches(locationData, isJust) {
        var musicalScale = [];
        if (isJust) {
          musicalScale = freqScales.createJustMusicalExpScale(1, avSettings.numOctaves, avSettings.numSemitones);
        } else {
          //TODO
          // Should this use random?
          musicalScale = freqScales.createJustMusicalExpScale(1, avSettings.numOctaves, sketch.random(avSettings.numSemitones+1, avSettings.numSemitones * 2));
        }
        var centreNoteIndex = locationData.soundParams.soundPitchOffset;
        var notesArray = [];

				if (weatherCheck.isClement(locationData.cloudCover.value, locationData.speed.value)) {
          console.log('assignPitches isClement');
					for (var i = 0; i < avSettings.numNotes; i++) {
            var newMajorNote = musicalScale[intervals.majorIntervals[i] + centreNoteIndex];
            console.log('newMajorNote', newMajorNote);
						notesArray.push(newMajorNote);
					}
				} else {
          console.log('assignPitches is not clement');
					for (var j = 0; j < avSettings.numNotes; j++) {
            var newMinorNote = musicalScale[intervals.minorIntervals[j] + centreNoteIndex];
						notesArray.push(newMinorNote);
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
              console.log('condition', condition);
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
      	Sound config algorithm
      	---------------
      	The distortion is set by cloud cover
      	The note volume is set by wind speed
      	The root key is set by the air pressure
      	The filter frequency is set by visibility
       */
			function configureSounds(locationData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundParams.distVolume.value = sketch.map(Math.round(locationData.cloudCover.value),
            locationData.cloudCover.min,
            locationData.cloudCover.max,
            locationData.soundParams.distVolume.min,
            locationData.soundParams.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundParams.volume.value = sketch.map(Math.round(locationData.speed.value),
            locationData.speed.min, locationData.speed.max,
            locationData.soundParams.volume.min,
            locationData.soundParams.volume.max) - locationData.soundParams.distVolume.value/3;
					//Pressure determines root note. Range 1 octave
					locationData.soundParams.soundPitchOffset = Math.round(sketch.map(locationData.pressure.value, locationData.pressure.min, locationData.pressure.max, 0 + avSettings.scaleSize, (avSettings.numOctaves * avSettings.numSemitones) - avSettings.scaleSize));
          console.log('locationData.soundParams.soundPitchOffset', locationData.soundParams.soundPitchOffset);
          //pitch range
          // no longer needed
					//locationData.soundParams.pitch.min = avSettings.pitchOffsetInc + locationData.soundParams.soundPitchOffset;
					//locationData.soundParams.pitch.max = (locationData.soundParams.pitch.max - avSettings.pitchOffsetInc) + locationData.soundParams.soundPitchOffset;
					//visibility is filter freq
					locationData.soundParams.freq.value = sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max);
					// continue with sound processing
          // use arbitrary scale for cold places
          if (weatherCheck.isCold(locationData.temperature.value)) {
            mapPitchValues(locationData, false);
          }
          else if (weatherCheck.isFreezing(locationData.temperature.value)) {
            assignPitches(locationData, true);
          }
          // and heptatonic for warm weather
          else {
            mapPitchValues(locationData, true);
          }
          console.log('locationData', locationData);
			}

			//Accepts number of horizontal and vertical squares to draw
			function createShapeSet(hSquares, vSquares) {
        var shapeSet = [];
				var index = 0;
				for (var i = 0; i < hSquares; i++) {
					for (var j = 0; j < vSquares; j++) {
						index++;
						var shape = new SingleShape(i * sqSize, j * sqSize, sqSize - 1, sketch.random(70,130), index);
						shapeSet.push(shape);
					}
				}
        return shapeSet;
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
        shapeSet = createShapeSet(hSquares, vSquares);
        //set runtime constants
				avSettings.animAmount = Math.round(locationData.speed.value);
				avSettings.noiseInc = sketch.map(avSettings.animAmount, locationData.speed.min, locationData.speed.max, 0.01, 0.05);
				temperatureColour = sketch.map(locationData.temperature.value, locationData.temperature.min, locationData.temperature.max, 25, 255);
				// handle sounds
        if (audioSupported) {
          configureSounds(locationData);
        } else {
          updateStatus(null, locationData.name, true);
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

  // Check for audioContext support
  function isAudioSuppored(pee5) {
    var audioSupported = true;
    if(pee5.noWebAudioCtx) {
      audioSupported = false;
    } else {
      createP5SoundObjs(audioSupported);
    }
    return audioSupported;
  }

	channel.subscribe('userUpdate', function(data) {
    audioSupported = isAudioSuppored(pee5);
    // If app is already running
    // TODO not sure if this case exists any more
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

  var myScale = freqScales.createJustMusicalExpScale(1, avSettings.numOctaves, avSettings.numSemitones);

	return true;
};
