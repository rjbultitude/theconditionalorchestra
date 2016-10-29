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
  var panArr = [-0.8,0,0.8];
  var rainDropsPattern = [];
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
      organSounds.forEach(fadeOutOrganSounds);
      // Fade bass
      bass.fade(0, avSettings.fadeTime);
      //Fade brassbass
      brassBass.fade(0, avSettings.fadeTime);
      brassBass2.fade(0, avSettings.fadeTime);
      // Fade choral
      choralSounds.forEach(fadeChoralSounds);
      // TODO find better way of avoiding mutation
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

  function checkIntervalsVNotes(intervals, numOrganNotes) {
    for (var scale in intervals) {
      if (intervals[scale] < numOrganNotes) {
        console.error('interval scales have too few items for the number of notes', intervals[scale]);
        return false;
      } else {
        return true;
      }
    }
  }

  function setNumPadNotes(lwData, avSettings, isStormy) {
        var _numOrganNotes;
        if (isStormy) {
          _numOrganNotes = 7;
        } else {
          _numOrganNotes = avSettings.numOrganNotes;
        }
        //error check
        checkIntervalsVNotes(intervals, _numOrganNotes);
        return _numOrganNotes;
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
	function init(lwData) {
    console.log('lwData', lwData);
    //Init scoped values
    var brassOneScaleArrayIndex = 0;
    var brassTwoScaleArrayIndex = 0;
    var scaleSetIndex = 0;
    // weather checks
    var isPrecip = weatherCheck.isPrecip(lwData.precipType, lwData.precipIntensity.value);
    var isFine = weatherCheck.isFine(lwData.temperature.value, lwData.windSpeed.value, lwData.cloudCover.value);
    var isCold = weatherCheck.isCold(lwData.temperature.value);
    var isFreezing = weatherCheck.isFreezing(lwData.temperature.value);
    var isClement = weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value);
    var isWindy = weatherCheck.isWindy(lwData.windSpeed.value);
    var isCloudy = weatherCheck.isCloudy(lwData.cloudCover.value);
    var isStormy = weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value);
    var numOrganNotes = setNumPadNotes(lwData, avSettings, isStormy);

		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

      function precipCategory(lwData) {
        if (lwData.precipType === 'rain' && lwData.precipIntensity.value > 0.2) {
          return 'hard';
        } else if (lwData.precipType === 'sleet' && lwData.precipIntensity.value <= 0.2) {
          return 'soft';
        } else if (lwData.precipType === 'snow' || lwData.precipIntensity.value <= 0.1) {
          return 'softest';
        } else {
          console.log('no rain? type is: ', lwData.precipType);
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
        bass.setVolume(0.4);
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

      function getPanIndex(panIndex) {
        if (panIndex < panArr.length -1) {
          panIndex++;
        } else {
          panIndex = 0;
        }
        return panIndex;
      }

      function setScaleSetIndex(scaleSet) {
        if (scaleSetIndex >= scaleSet.length -1) {
          scaleSetIndex = 0;
        } else {
          scaleSetIndex++;
        }
        return scaleSetIndex;
      }

      function playOrgan(lwData, scaleSet) {
        //Pan
        var _panIndex = 0;
        // must loop before rate is set
        // issue in Chrome only
        organSounds.map(function(organSound, i) {
          organSound.organ.disconnect();
          organSound.organ.connect(soundFilter);
          organSound.organ.play();
          organSound.organ.onended(function() { organCallback(lwData, scaleSet, i); });
          organSound.organ.rate(scaleSet[scaleSetIndex][i]);
          organSound.organ.pan(panArr[_panIndex]);
          organSound.organ.setVolume(0.8);
          _panIndex = getPanIndex(_panIndex);
        });
        console.log('organ playing');
      }

      function playOrganDist(lwData, scaleSet) {
        var _panIndex = 0;
        organSounds.map(function(organSound, i) {
          organSound.organDist.disconnect();
          organSound.organDist.connect(soundFilter);
          organSound.organDist.play();
          organSound.organDist.onended(function() { organDistCallback(lwData, scaleSet, i); });
          organSound.organDist.rate(scaleSet[scaleSetIndex][i]);
          organSound.organDist.pan(panArr[_panIndex]);
          organSound.organDist.setVolume(0.4);
          _panIndex = getPanIndex(_panIndex);
        });
        console.log('organ dist playing');
      }

      function playOrganLoop(lwData, scaleSet) {
        var _panIndex = 0;
        // must loop before rate is set
        // issue in Chrome only
        organSounds.map(function(organSound, i) {
          organSound.organLoop.disconnect();
          organSound.organLoop.connect(soundFilter);
          organSound.organLoop.play();
          organSound.organLoop.onended(function() { organLoopCallback(lwData, scaleSet, i); });
          organSound.organLoop.rate(scaleSet[scaleSetIndex][i]);
          organSound.organLoop.pan(panArr[_panIndex]);
          organSound.organLoop.setVolume(lwData.soundParams.volume.value);
          _panIndex = getPanIndex(_panIndex);
        });
        console.log('organ loop playing');
      }

      function organCallback(lwData, scaleSet, organIndex) {
        if (organIndex === organSounds.length - 1) {
          playOrgan(lwData, scaleSet);
          setScaleSetIndex(scaleSet);
        }
      }

      function organDistCallback(lwData, scaleSet, organDistIndex) {
        if (organDistIndex === organSounds.length - 1) {
          playOrganDist(lwData, scaleSet);
          setScaleSetIndex(scaleSet);
        }
      }

      function organLoopCallback(lwData, scaleSet, organLoopIndex) {
        if (organLoopIndex === organSounds.length - 1) {
          playOrganLoop(lwData, scaleSet);
          setScaleSetIndex(scaleSet);
        }
      }

      function handlePrecipitation(lwData, arpScaleArray, arpPart) {
        // Handle precipitation
        if (isPrecip) {
          playArp(precipCategory(lwData), arpScaleArray);
        } else {
          arpPart.stop(0);
        }
      }

      function handleFineWeather(lwData, scaleArray) {
        if (isFine) {
          console.log('weather is fine. choralSound should play');
          choralSounds.forEach(function(choralSound, i) {
            console.log('choralSound', choralSound);
            console.log('scaleArray', scaleArray);
            choralSound.loop();
            choralSound.rate(scaleArray[i]);
            choralSound.setVolume(0.17);
          });
        } else {
          console.log('weather is not fine. No choralSounds');
        }
      }

			function playSounds(lwData, scaleArray, scaleAltArray, arpScaleArray) {
        // Make scale set array for sequence
        var scaleSet = [scaleArray, scaleAltArray];
        // Rain
        handlePrecipitation(lwData, arpScaleArray, arpPart);
        // Fine conditions
        handleFineWeather(lwData, scaleArray);
        // Play bass
        publishBass = channel.subscribe('triggerBass', function() {
          if (isCloudy) {
            playBass(scaleArray);
          }
        });
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          if (isWindy) {
            playBrassBass(scaleArray);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          if (isWindy) {
            playBrassBassTwo(scaleArray);
          }
        });
        //Organ
        if (isStormy) {
          playOrganLoop(lwData, scaleSet);
        } else if (!isStormy && isCloudy) {
          playOrganDist(lwData, scaleSet);
        } else {
          playOrgan(lwData, scaleSet);
        }
        channel.publish('playing', audioSupported);
			}

      /*
        Use an equal temperament scale
        Major scale for clement weather
				Minor octave for anything else
			*/
			function createEqTempPitchesArr(lwData, isWesternScale) {
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
			function createArbitraryPitchesArr(lwData) {
        var allNotesArray = [];
        var count = 0;
				mappedValsLoop:
				for (var condition in lwData) {
          while (numOrganNotes > count) {
            if (lwData.hasOwnProperty(condition)) {
              console.log('condition', condition);
              if (condition === 'name' || condition === 'soundParams') {
                continue mappedValsLoop;
              }
              allNotesArray.push(sketch.map(lwData[condition].value, lwData[condition].min, lwData[condition].max, lwData.soundParams.pitch.min, lwData.soundParams.pitch.max).toFixed(4));
            }
            count++;
            continue mappedValsLoop;
          }
				}
        return allNotesArray;
			}

      function allNotesScaleType(lwData) {
        //  Use equal temperament scale for cold & warm
        //  use arbitrary scale for freezing
        var allNotesArray = [];
        if (isCold) {
          allNotesArray = createEqTempPitchesArr(lwData, false);
        }
        else if (isFreezing) {
          allNotesArray = createArbitraryPitchesArr(lwData);
        }
        // and heptatonic for warm weather
        else {
          allNotesArray = createEqTempPitchesArr(lwData, true);
        }
        return allNotesArray;
      }

      function createMusicalScale(lwData, allNotesArray, numNotes, centreNoteOffset) {
        var centreNoteIndex = centreNoteOffset || lwData.soundParams.soundPitchOffset;
        var scaleArray = [];
        var heptMajorIntervals = intervals.heptMajorIntervals;
        var heptMinorIntervals = intervals.heptMinorIntervals;
        console.log('centreNoteIndex', centreNoteIndex);
        //error check
        if (numNotes > intervals.heptMajorIntervals.length) {
          console.log('not enough notes in hept major scale');
          heptMajorIntervals = duplicateArray(intervals.heptMajorIntervals, 3);
        }
        if (numNotes > intervals.heptMinorIntervals.length) {
          console.log('not enough notes in hept minor scale');
          heptMinorIntervals = duplicateArray(intervals.heptMinorIntervals, 3);
        }

        if (isClement) {
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
			function configureSounds(lwData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object
					//Pressure determines root note. Range 1 octave
					lwData.soundParams.soundPitchOffset = Math.round(sketch.map(lwData.pressure.value, lwData.pressure.min, lwData.pressure.max, 0 + avSettings.scaleSize, (avSettings.numOctaves * avSettings.numSemitones) - avSettings.scaleSize));
					// Set filter
					// visibility is filter freq
					lwData.soundParams.freq.value = sketch.map(Math.round(lwData.visibility.value), lwData.visibility.min, lwData.visibility.max, lwData.soundParams.freq.min, lwData.soundParams.freq.max);
  				soundFilter.freq(lwData.soundParams.freq.value);
  				soundFilter.res(20);
          // Create scales for playback
          var organScaleArray = createMusicalScale(lwData, allNotesScaleType(lwData), numOrganNotes);
          var organAltScaleArray = createMusicalScale(lwData, allNotesScaleType(lwData), numOrganNotes, lwData.soundParams.soundPitchOffset - 4);
          var arpScaleArray = createMusicalScale(lwData, allNotesScaleType(lwData), 12);
          playSounds(lwData, organScaleArray, organAltScaleArray, arpScaleArray);
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
          for (var i = 0; i < numOrganNotes; i++) {
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
				avSettings.animAmount = Math.round(lwData.windSpeed.value);
				avSettings.noiseInc = sketch.map(avSettings.animAmount, lwData.windSpeed.min, lwData.windSpeed.max, 0.01, 0.05);
				temperatureColour = sketch.map(lwData.temperature.value, lwData.temperature.min, lwData.temperature.max, 25, 255);
        //--------------------
        // handle sounds
        // --------------------
        if (audioSupported) {
          configureSounds(lwData);
        } else {
          updateStatus('error', lwData.name, true);
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
    if(pee5.noWebAudioCtx) {
      return false;
    } else {
      createP5SoundObjs();
      return true;
    }
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
