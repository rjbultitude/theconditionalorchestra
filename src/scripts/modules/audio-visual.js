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
var avSettings = require('../settings/av-settings');

module.exports = function() {
  /*
    Module scoped vars
  */

  var isPlaying = false;
	// Sound containers
	var organSounds = [];
  var choralSounds = [];
  var dropSound;
  var dropLightSound;
  var bass;
  var brassBass;
  var brassBass2;
  var arpDropPhrase;
  var arpDropLightPhrase;
  var arpPart;
  var soundFilter;
  var rainDropsPattern = [1.0000, 1.12246, 1.33483, 1.49831, 1.68179, 1.0000, 1.12246, 1.33483, 1.49831, 1.68179, 1.0000, 1.12246, 1.33483, 1.49831, 1.68179, 1.0000, 1.12246, 1.33483, 1.49831, 1.68179];
	// Array for all visual shapes
	var shapeSet = [];
  // dialog / modal
  var dialogIsOpen = false;
  // Visuals
  var sqSize = 25;
  var temperatureColour = 0;
  //
  var pee5 = new P5();
  //Subscriptions
  var publishBass;
  var publishBrassOne;
  var publishBrassTwo;

  /*
    Utility functions
  */

	// Is this size or smaller
	function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  }

  function fadeOutOrganSounds(soundItem) {
    soundItem.organ.fade(0, avSettings.fadeTime);
    soundItem.organDist.fade(0, avSettings.fadeTime);
    soundItem.organLoop.fade(0, avSettings.fadeTime);
  }

  function fadeChoralSounds(soundItem) {
    soundItem.fade(0, avSettings.fadeTime);
  }

  function killCurrentSounds() {
      // Stop arrpeggio
      arpPart.stop(0);
      arpPart.removePhrase('rainDrops');
      arpPart.removePhrase('rainDropsLight');
      // Fade organ sounds
      //organSounds.forEach(fadeOutOrganSounds);
      for (var i = 0; i < organSounds.length; i++) {
        organSounds[i].organ.fade(0, avSettings.fadeTime);
        organSounds[i].organDist.fade(0, avSettings.fadeTime);
        organSounds[i].organLoop.fade(0, avSettings.fadeTime);
      }
      // Fade rain drop sound
      // TODO Not sure we need this
      dropSound.fade(0, avSettings.fadeTime);
      dropLightSound.fade(0, avSettings.fadeTime);
      // Fade bass
      bass.fade(0, avSettings.fadeTime);
      //Fade brassbass
      brassBass.fade(0, avSettings.fadeTime);
      brassBass2.fade(0, avSettings.fadeTime);
      // Fade choral
      //choralSounds.forEach(fadeChoralSounds);
      for (var j = 0; j < choralSounds.length; j++) {
        choralSounds[j].fade(0, avSettings.fadeTime);
      }
      //Empty, clear;
      organSounds = [];
      choralSounds = [];
      publishBass.unsubscribe();
      publishBrassOne.unsubscribe();
      publishBrassTwo.unsubscribe();
      isPlaying = false;
      channel.publish('allStopped');
  }

  function makeDropSound(time, playbackRate) {
    dropSound.rate(playbackRate);
    dropSound.setVolume(0.1);
    dropSound.play(time);
  }

  function makeDropLightSound(time, playbackRate) {
    dropLightSound.rate(playbackRate);
    dropLightSound.setVolume(0.1);
    dropLightSound.play(time);
  }

  function checkIntervalsVNotes(intervals, numPadNotes) {
    for (var scale in intervals) {
      if (intervals[scale] < numPadNotes) {
        console.error('interval scales have too few items for the number of notes', intervals[scale]);
        return false;
      } else {
        return true;
      }
    }
  }

  function setNumPadNotes(locationData, avSettings) {
    //error check
    var numPadNotes;
    if (weatherCheck.isStormy(locationData.cloudCover.value, locationData.windSpeed.value, locationData.precipIntensity.value)) {
      numPadNotes = 7;
    } else {
      numPadNotes = avSettings.numPadNotes;
    }
    checkIntervalsVNotes(intervals, numPadNotes);
    return numPadNotes;
  }

  /**
   * [createP5SoundObjs creates various P5 sound objects if AudioContext is supported]
   * @param  {[boolean]} audioSupported [whether AudioContext is supported]
   * @return {[object]}                [All the sound objects]
   */
  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    // Create phrase: name, callback, sequence
    arpDropPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
    arpDropLightPhrase = new P5.Phrase('rainDropsLight', makeDropLightSound, rainDropsPattern);
    arpPart = new P5.Part();
  }

	// main app init
	function init(locationData) {
    console.log('locationData', locationData);
    // Set the number of organSounds
    var numPadNotes = setNumPadNotes(locationData, avSettings);
    var brassOneScaleArrayIndex = 0;
    var brassTwoScaleArrayIndex = 0;

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
        console.log('notesArray', notesArray);
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

      function playArp(arpeggioType, arpScaleArray) {
        //Overwrite sequence with new notes
        //TODO repeat intervals upwards
        //for 12 note arp pattern that uses intervals of less notes
        var newNotesArray = addRandomStops(arpScaleArray).reverse();
        arpDropPhrase.sequence = newNotesArray;
        arpDropLightPhrase.sequence = newNotesArray;
        //Only use dropSound for rain
        if (arpeggioType === 'hard') {
          arpPart.addPhrase(arpDropPhrase);
        } else {
          arpPart.addPhrase(arpDropLightPhrase);
        }
        arpPart.setBPM(60);
        // Type logic
        switch (arpeggioType) {
          case 'hard':
            arpPart.setBPM(160);
            console.log('hard');
            break;
          case 'soft':
            arpPart.setBPM(110);
            console.log('soft');
            break;
          case 'softest':
            arpPart.setBPM(60);
            console.log('softest');
            break;
          default:
            console.log('problem with arrpeggio ', arpeggioType);
        }
        console.log('arpPart', arpPart);
        arpPart.start();
        arpPart.loop();
      }

      function playBass(scaleArray) {
        bass.play();
        bass.rate(scaleArray[0]);
        bass.setVolume(1);
        console.log('bass playing');
      }

      function playBrassBass(scaleArray) {
        brassBass.play();
        brassBass.rate(scaleArray[brassOneScaleArrayIndex]);
        console.log('scaleArray[brassOneScaleArrayIndex] brass one', scaleArray[brassOneScaleArrayIndex]);
        brassBass.setVolume(1);
        if (brassOneScaleArrayIndex >= 1) {
          brassOneScaleArrayIndex = 0;
        } else {
          brassOneScaleArrayIndex++;
        }
        console.log('brass bass playing');
      }

      function playBrassBassTwo(scaleArray) {
        brassBass.play();
        brassBass.rate(scaleArray[brassTwoScaleArrayIndex]);
        console.log('scaleArray[brassTwoScaleArrayIndex] brass two', scaleArray[brassTwoScaleArrayIndex]);
        brassBass.setVolume(1);
        if (brassTwoScaleArrayIndex >= scaleArray.length -1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
        console.log('brass bass two playing');
      }

      function playOrgan(locationData, weatherCheck, scaleArray) {
        console.log('scaleArray', scaleArray);
        //Pan
        var panIndex = 0;
        var panArr = [-0.8,0,0.8];
				//Set filter
				soundFilter.freq(locationData.soundParams.freq.value);
				soundFilter.res(20);
        // must loop before rate is set
        // issue in Chrome only
        organSounds.map(function(organSound, i) {
          if (weatherCheck.isStormy(locationData.cloudCover.value, locationData.windSpeed.value, locationData.precipIntensity.value)) {
            console.log('is stormy');
            organSound.organLoop.disconnect();
            organSound.organLoop.connect(soundFilter);
            organSound.organLoop.loop();
            organSound.organLoop.rate(scaleArray[i]);
            organSound.organLoop.pan(panArr[panIndex]);
            organSound.organLoop.setVolume(locationData.soundParams.volume.value);
          } else {
            organSound.organ.disconnect();
            organSound.organDist.disconnect();
            organSound.organ.connect(soundFilter);
            organSound.organDist.connect(soundFilter);
            organSound.organ.loop();
            organSound.organDist.loop();
            organSound.organ.rate(scaleArray[i]);
            organSound.organDist.rate(scaleArray[i]);
            organSound.organ.pan(panArr[panIndex]);
            organSound.organDist.pan(panArr[panIndex]);
            organSound.organ.setVolume(locationData.soundParams.volume.value);
            organSound.organDist.setVolume(locationData.soundParams.distVolume.value);
          }
          if (panIndex < panArr.length -1) {
            panIndex++;
          } else {
            panIndex = 0;
          }
          console.log('organSound', organSound);
        });
      }

      function handlePrecipitation(locationData, weatherCheck, arpScaleArray, arpPart) {
        var isPrecip = false;
        // Handle precipitation
        if (weatherCheck.isPrecip(locationData.precipType, locationData.precipIntensity.value)) {
          playArp(precipCategory(locationData), arpScaleArray);
          isPrecip = true;
        } else {
          arpPart.stop(0);
          isPrecip = false;
        }
        return isPrecip;
      }

      function handleFineWeather(locationData, weatherCheck, scaleArray) {
        if (weatherCheck.isFine(locationData.temperature.value, locationData.windSpeed.value, locationData.cloudCover.value)) {
          console.log('is fine');
          console.log('choralSounds.length', choralSounds.length);
          choralSounds.forEach(function(choralSound, i) {
            console.log('choralSound', choralSound);
            console.log('scaleArray', scaleArray);
            choralSound.loop();
            choralSound.rate(scaleArray[i]);
            choralSound.setVolume(0.17);
          });
          console.log('choralSounds', choralSounds);
        } else {
          console.log('weather is not fine');
        }
      }

			function playSounds(locationData, scaleArray, arpScaleArray) {
        // Rain
        handlePrecipitation(locationData, weatherCheck, arpScaleArray, arpPart);
        // Fine conditions
        handleFineWeather(locationData, weatherCheck, scaleArray);
        // Play bass
        publishBass = channel.subscribe('triggerBass', function() {
          if (weatherCheck.isCloudy(locationData.cloudCover.value)) {
            playBass(scaleArray);
          }
        });
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          if (weatherCheck.isWindy(locationData.windSpeed.value)) {
            playBrassBass(scaleArray);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          if (weatherCheck.isWindy(locationData.windSpeed.value)) {
            playBrassBassTwo(scaleArray);
          }
        });
        //Organ
        playOrgan(locationData, weatherCheck, scaleArray);
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
          while (numPadNotes > count) {
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
        //  Use equal temperament scale for cold & warm
        //  use arbitrary scale for freezing
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

      function createMusicalScale(locationData, weatherCheck, allNotesArray, numNotes) {
        var centreNoteIndex = locationData.soundParams.soundPitchOffset;
        var scaleArray = [];
        var heptMajorIntervals = intervals.heptMajorIntervals;
        var heptMinorIntervals = intervals.heptMinorIntervals;
        console.log('centreNoteIndex', centreNoteIndex);
        console.log('numPadNotes: ', numPadNotes);
        //error check
        if (numNotes > intervals.heptMajorIntervals.length) {
          console.log('not enough notes in hept major scale');
          heptMajorIntervals = duplicateArray(intervals.heptMajorIntervals, 3);
        }
        if (numNotes > intervals.heptMinorIntervals.length) {
          console.log('not enough notes in hept minor scale');
          heptMinorIntervals = duplicateArray(intervals.heptMinorIntervals, 3);
        }

        if (weatherCheck.isClement(locationData.cloudCover.value, locationData.windSpeed.value)) {
          for (var i = 0; i < numNotes; i++) {
            var newMajorNote = allNotesArray[heptMajorIntervals[i] + centreNoteIndex];
            scaleArray.push(newMajorNote);
          }
        } else {
          for (var j = 0; j < numNotes; j++) {
            var newMinorNote = allNotesArray[heptMinorIntervals[j] + centreNoteIndex];
            console.log('minorIntervals');
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
					//TODO
					//Dist and volume are at odds with each other

					//cloud cover determines level of brass distorition
					locationData.soundParams.distVolume.value = sketch.map(Math.round(locationData.cloudCover.value),
            locationData.cloudCover.min,
            locationData.cloudCover.max,
            locationData.soundParams.distVolume.min,
            locationData.soundParams.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundParams.volume.value = sketch.map(Math.round(locationData.windSpeed.value),
            locationData.windSpeed.min, locationData.windSpeed.max,
            locationData.soundParams.volume.min,
            locationData.soundParams.volume.max) - locationData.soundParams.distVolume.value/3;
					//Pressure determines root note. Range 1 octave
					locationData.soundParams.soundPitchOffset = Math.round(sketch.map(locationData.pressure.value, locationData.pressure.min, locationData.pressure.max, 0 + avSettings.scaleSize, (avSettings.numOctaves * avSettings.numSemitones) - avSettings.scaleSize));
					//visibility is filter freq
					locationData.soundParams.freq.value = sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max);
          var padScaleArray = createMusicalScale(locationData, weatherCheck, allNotesScaleType(locationData, weatherCheck), numPadNotes);
          var arpScaleArray = createMusicalScale(locationData, weatherCheck, allNotesScaleType(locationData, weatherCheck), 12);
          playSounds(locationData, padScaleArray, arpScaleArray);
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
			function OrganSound(organ, organDist, organLoop) {
				this.organ = organ;
				this.organDist = organDist;
				this.organLoop = organLoop;
			}

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
        if (audioSupported) {
          for (var i = 0; i < numPadNotes; i++) {
            organSounds[i] = new OrganSound(
              sketch.loadSound('/audio/organ-C2.mp3'),
              sketch.loadSound('/audio/organ-C2d.mp3'),
              sketch.loadSound('/audio/organ-C2-loop.mp3')
            );
          }
          for (var j = 0; j < 2; j++) {
            choralSounds.push(sketch.loadSound('/audio/choral.mp3'));
          }
          dropSound = sketch.loadSound('/audio/drop.mp3');
          dropLightSound = sketch.loadSound('/audio/drop-light.mp3');
          bass = sketch.loadSound('/audio/bass.mp3');
          brassBass = sketch.loadSound('/audio/brassbass.mp3');
          brassBass2 = sketch.loadSound('/audio/brassbass.mp3');
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
				avSettings.animAmount = Math.round(locationData.windSpeed.value);
				avSettings.noiseInc = sketch.map(avSettings.animAmount, locationData.windSpeed.min, locationData.windSpeed.max, 0.01, 0.05);
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
        if (sketch.frameCount % 300 === 0) {
          channel.publish('triggerBass');
        }
        if (sketch.frameCount % 400 === 0) {
          channel.publish('triggerBrassOne');
        }
        if (sketch.frameCount % 500 === 0) {
          channel.publish('triggerBrassTwo');
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
    init(data);
	});

  channel.subscribe('dialogOpen', function() {
    dialogIsOpen = true;
  });

  channel.subscribe('dialogClosed', function() {
    dialogIsOpen = false;
  });

  channel.subscribe('stop', function() {
    killCurrentSounds();
  });

	return true;
};
