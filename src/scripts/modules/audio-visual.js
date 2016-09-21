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
var generateFreqScales = require('../utilities/create-freq-scales');
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

  function fadeOutOrganSounds(soundItem) {
    soundItem.organ.fade(0,avSettings.fadeTime);
    soundItem.organDist.fade(0,avSettings.fadeTime);
  }

  function killCurrentSounds(isRunning) {
    if (isRunning) {
      // Stop arrpeggio
      arpPart.stop(0);
      arpPart.removePhrase('rainDrops');
      // Fade organ sounds
      organSounds.forEach(fadeOutOrganSounds);
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
    dropSound.setVolume(avSettings.volume);
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
  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    // Create phrase: name, callback, sequence
    arpPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
    arpPart = new P5.Part();
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
        switch (arpeggioType) {
          case 'hard':
            avSettings.volume = 0.6;
            dropSound.setVolume(0.6);
            arpPart.setBPM(160);
            console.log('hard');
            break;
          case 'soft':
            avSettings.volume = 0.4;
            dropSound.setVolume(0.4);
            arpPart.setBPM(110);
            console.log('soft');
            break;
          case 'softest':
            avSettings.volume = 0.2;
            dropSound.setVolume(0.2);
            arpPart.setBPM(60);
            console.log('softest');
            break;
          default:
            console.log('problem with arrpeggio ', arpeggioType);
        }
        console.log('dropSound', dropSound);
        arpPart.start();
      }

      function handlePrecipitation(locationData, weatherCheck, scaleArray, arpPart) {
        var isPrecip = false;
        // Handle precipitation
        if (weatherCheck.isPrecip(locationData.precipType, locationData.precipIntensity.value)) {
          playArp(precipCategory(locationData), scaleArray, soundFilter);
          isPrecip = true;
        } else {
          arpPart.stop(0);
          isPrecip = false;
        }
        return isPrecip;
      }

			function playSounds(locationData, scaleArray) {
				//Set filter
				soundFilter.freq(locationData.soundParams.freq.value);
				soundFilter.res(20);
        // Play rain
        handlePrecipitation(locationData, weatherCheck, scaleArray, arpPart);
        // Play brass
        // must loop before rate is set
        // issue in Chrome only
				for (var i = 0; i < organSounds.length; i++) {
					organSounds[i].organ.disconnect();
					organSounds[i].organDist.disconnect();
					organSounds[i].organ.connect(soundFilter);
					organSounds[i].organDist.connect(soundFilter);
          organSounds[i].organ.loop();
          organSounds[i].organDist.loop();
					organSounds[i].organ.rate(scaleArray[i]);
					organSounds[i].organDist.rate(scaleArray[i]);
          organSounds[i].organ.setVolume(locationData.soundParams.volume.value);
					organSounds[i].organDist.setVolume(locationData.soundParams.distVolume.value);
				}
        channel.publish('play', audioSupported);
			}

      /*
        Use an equal temperament scale
        Major scale for clement weather
				Minor octave for anything else
			*/
			function createEqTempPitchesArr(locationData, isWesternScale) {
        var allNotesArray = [];
        if (isWesternScale) {
          allNotesArray = generateFreqScales.createEqTempMusicalScale(1, avSettings.numOctaves, avSettings.numSemitones);
        } else {
          allNotesArray = generateFreqScales.createEqTempMusicalScale(1, avSettings.numOctaves, sketch.random(avSettings.numSemitones+2, avSettings.numSemitones * 2));
        }
        return allNotesArray;
			}

			/*
				Arbitarily assigned pitch values
				calculated by mapping conditions to pitch
			*/
			function createArbitraryPitchesArr(locationData) {
        var allNotesArray = [];
        var count = 0;
				mappedValsLoop:
				for (var condition in locationData) {
          while (avSettings.numNotes > count) {
            if (locationData.hasOwnProperty(condition)) {
              console.log('condition', condition);
              if (condition === 'name' || condition === 'soundParams') {
                continue mappedValsLoop;
              }
              allNotesArray.push(sketch.map(locationData[condition].value, locationData[condition].min, locationData[condition].max, locationData.soundParams.pitch.min, locationData.soundParams.pitch.max).toFixed(4));
            }
            count++;
            continue mappedValsLoop;
          }
				}
        return allNotesArray;
			}

      function allNotesScaleType(locationData, weatherCheck) {
        // use arbitrary scale for cold places
        var allNotesArray = [];
        if (weatherCheck.isCold(locationData.temperature.value)) {
          allNotesArray = createEqTempPitchesArr(locationData, false);
        }
        else if (weatherCheck.isFreezing(locationData.temperature.value)) {
          allNotesArray = createArbitraryPitchesArr(locationData);
        }
        // and heptatonic for warm weather
        else {
          allNotesArray = createEqTempPitchesArr(locationData, true);
        }
        return allNotesArray;
      }

      function createMusicalScale(locationData, weatherCheck, allNotesArray) {
        var centreNoteIndex = locationData.soundParams.soundPitchOffset;
        var scaleArray = [];

        if (weatherCheck.isClement(locationData.cloudCover.value, locationData.speed.value)) {
          for (var i = 0; i < avSettings.numNotes; i++) {
            var newMajorNote = allNotesArray[intervals.majorIntervals[i] + centreNoteIndex];
            scaleArray.push(newMajorNote);
          }
        } else {
          for (var j = 0; j < avSettings.numNotes; j++) {
            var newMinorNote = allNotesArray[intervals.minorIntervals[j] + centreNoteIndex];
            scaleArray.push(newMinorNote);
          }
        }
        return scaleArray;
      }

      /*
      	Sound config algorithm
      	---------------
      	The distortion is set by cloud cover
      	The note volume is set by wind speed
      	The root key is set by the air pressure
      	The filter frequency is set by visibility
       */
			function configureSounds(locationData, weatherCheck) {
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
					//visibility is filter freq
					locationData.soundParams.freq.value = sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max);
          var scaleArray = createMusicalScale(locationData, weatherCheck, allNotesScaleType(locationData, weatherCheck));
          playSounds(locationData, scaleArray);
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
        //--------------------
				//Canvas setup
				//--------------------
				var myCanvas = sketch.createCanvas(avSettings.cWidth, avSettings.cHeight);
				myCanvas.parent(avSettings.cContainerName);
				var cContainer = document.getElementById(avSettings.cContainerName);
				cContainer.style.paddingBottom = avSettings.cPadding;
				sketch.frameRate(25);
				sketch.background(0, 0, 0);
        //---------------------
        //create shapes in grid
        //---------------------
				var hSquares = Math.round(sketch.width/sqSize);
				var vSquares = Math.round(sketch.height/sqSize);
        shapeSet = createShapeSet(hSquares, vSquares);
        //---------------------
        //set runtime constants
        //--------------------
				avSettings.animAmount = Math.round(locationData.speed.value);
				avSettings.noiseInc = sketch.map(avSettings.animAmount, locationData.speed.min, locationData.speed.max, 0.01, 0.05);
				temperatureColour = sketch.map(locationData.temperature.value, locationData.temperature.min, locationData.temperature.max, 25, 255);
        //--------------------
        // handle sounds
        // --------------------
        if (audioSupported) {
          configureSounds(locationData, weatherCheck);
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
      createP5SoundObjs();
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

	return true;
};
