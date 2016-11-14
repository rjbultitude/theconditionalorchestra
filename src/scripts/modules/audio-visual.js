/*
	This module manages the
  sonic and visual output of the app
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
var duplicateAndPitchArray = require('../utilities/duplicate-pitch-array-vals');
var avSettings = require('../settings/av-settings');

module.exports = function() {
  /*
    Module scoped vars
  */
  var isPlaying = false;
	// Sound containers
	var padSounds = [];
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
  var masterGain;
  var panArr = [-0.8,0,0.8];
  var rainDropsPattern = [];
	// Array for all visual shapes
	var shapeSet = [];
  // dialog / modal
  var dialogIsOpen = false;
  // Visuals
  var sqSize = 25;
  var temperatureColour = 0;
  // For audioContext support
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

  function fadeOutPadSounds(soundItem) {
    function stopPadSounds(padSound) {
      setTimeout(function() {
        padSound.stop();
      }, avSettings.fadeTime * 1000);
    }
    for (var padSound in soundItem) {
      soundItem[padSound].fade(0, avSettings.fadeTime);
      stopPadSounds(soundItem[padSound]);
    }
  }

  function fadeChoralSounds(soundItem) {
    soundItem.fade(0, avSettings.fadeTime);
    setTimeout(function(){
      soundItem.stop();
    }, avSettings.fadeTime * 1000);
  }

  function killCurrentSounds() {
      // Stop arrpeggio
      arpPart.stop(0);
      arpPart.removePhrase('rainDrops');
      arpPart.removePhrase('rainDropsLight');
      // Fade organ sounds
      padSounds.forEach(fadeOutPadSounds);
      // Fade choral
      choralSounds.forEach(fadeChoralSounds);
      // Fade bass
      bass.fade(0, avSettings.fadeTime);
      bass.stop();
      //Fade brassbass
      brassBass.fade(0, avSettings.fadeTime);
      brassBass.stop();
      brassBass2.fade(0, avSettings.fadeTime);
      brassBass2.stop();
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

  function setNumPadNotes(lwData, avSettings, isStormy) {
    var _numPadNotes;
    if (isStormy) {
      _numPadNotes = 7;
    } else {
      _numPadNotes = avSettings.numPadNotes;
    }
    return _numPadNotes;
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
    masterGain = new P5.Gain();
  }

	// main app init
	function init(lwData) {
    console.log('lwData', lwData);
    //Init scoped values
    var brassOneScaleArrayIndex = 0;
    var brassTwoScaleArrayIndex = 0;
    var scaleSetIndex = 0;
    var padIndexCount = 0;
    // TODO find better way of avoiding mutation
    //Empty, clear;
    choralSounds = [];
    padSounds = [];
    // weather checks
    var isPrecip = weatherCheck.isPrecip(lwData.precipType, lwData.precipIntensity.value);
    var isFine = weatherCheck.isFine(lwData.temperature.value, lwData.windSpeed.value, lwData.cloudCover.value);
    var isCold = weatherCheck.isCold(lwData.temperature.value);
    var isFreezing = weatherCheck.isFreezing(lwData.temperature.value);
    var isClement = weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value);
    var isWindy = weatherCheck.isWindy(lwData.windSpeed.value);
    var isCloudy = weatherCheck.isCloudy(lwData.cloudCover.value);
    var isStormy = weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value);
    var numPadNotes = setNumPadNotes(lwData, avSettings, isStormy);

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

      function playPad(lwData, scaleSet, key) {
        var _panIndex = 0;
        for (var i = 0; i < padSounds.length; i++) {
          padSounds[i][key].disconnect();
          padSounds[i][key].connect(soundFilter);
          padSounds[i][key].play();
          padSounds[i][key].rate(scaleSet[scaleSetIndex][i]);
          padSounds[i][key].pan(panArr[_panIndex]);
          padSounds[i][key].setVolume(avSettings[key].volume);
          padSounds[i][key].onended(function() { padCallback(lwData, scaleSet, key); });
          _panIndex = getPanIndex(_panIndex);
          console.log('padSounds[i][key].playbackRate', padSounds[i][key].playbackRate);
        }
        setScaleSetIndex(scaleSet);
        console.log(key + ' is playing');
      }

      function padCallback(lwData, scaleSet, key) {
        if (isPlaying) {
          padIndexCount++;
          // When all the sounds have played once, loop
          if (padIndexCount === padSounds.length) {
            playPad(lwData, scaleSet, key);
            padIndexCount = 0;
          }
        }
      }

      function handlePrecipitation(lwData, arpScaleArray, arpPart) {
        // Handle precipitation
        // playlogic
        if (isPrecip) {
          playArp(precipCategory(lwData), arpScaleArray);
        } else {
          arpPart.stop(0);
        }
      }

      function handleFineWeather(lwData, scaleArray) {
        // playlogic
        if (isFine) {
          console.log('weather is fine. choralSound playing');
          choralSounds.forEach(function(choralSound, i) {
            // must loop before rate is set
            // issue in Chrome only
            //choralSound.fade(0.17, avSettings.fadeTime);
            choralSound.loop();
            choralSound.rate(scaleArray[i]);
            choralSound.setVolume(0.17);
          });
        } else {
          console.log('weather is not fine. No choralSounds');
        }
      }

      function handlePadType(lwData, scaleSet) {
        //playlogic
        if (isStormy) {
          playPad(lwData, scaleSet, 'organDist');
        } else if (isCloudy && isCold) {
          playPad(lwData, scaleSet, 'sax');
        } else if (isCloudy && isFreezing) {
          playPad(lwData, scaleSet, 'trumpet');
        } else {
          playPad(lwData, scaleSet, 'organ');
        }
      }

      /**
       * playSounds Handles playback logic
       * Though some of this is delegated
       * @param  {Object} lwData        Main weather data object
       * @param  {Array} padScales    sets of notes to play
       * @param  {Array} arpScaleArray a set of notes fot the sequencer to play
       * @return {boolean}               default value
       */
			function playSounds(lwData, padScales, arpScaleArray) {
        // Make scale set array for chord sequence

        sketch.masterVolume(1, 3, 0);
        // Rain
        handlePrecipitation(lwData, arpScaleArray, arpPart);
        // Fine conditions
        handleFineWeather(lwData, padScales[0]);
        // Play bass
        publishBass = channel.subscribe('triggerBass', function() {
          //playlogic
          if (isCloudy) {
            playBass(padScales[0]);
          }
        });
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          //playlogic
          if (isWindy) {
            playBrassBass(padScales[0]);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          //playlogic
          if (isWindy) {
            playBrassBassTwo(padScales[0]);
          }
        });
        //Organ
        handlePadType(lwData, padScales);
        //Tell rest of app we're playing
        isPlaying = true;
        channel.publish('playing', audioSupported);
			}

      /*
        Use an equal temperament scale
        Major scale for clement weather
				Minor octave for anything else
			*/
			function createEqTempPitchesArr(lwData, isWesternScale) {
        var _allNotesArray = [];
        var _numSemitones;
        if (isWesternScale) {
          _numSemitones = avSettings.numSemitones;
          console.log('western', _numSemitones);
        } else {
          _numSemitones = sketch.random(avSettings.numSemitones + 2, avSettings.numSemitones * 2);
          console.log('non western _numSemitones', _numSemitones);
        }
        _allNotesArray = generateFreqScales.createEqTempMusicalScale(1, avSettings.numOctaves, _numSemitones);
        return _allNotesArray;
			}

      function allNotesScaleType(lwData) {
        //  Use equal temperament scale for cold & warm
        //  use arbitrary scale for freezing
        var _allNotesArray = [];
        //playlogic
        // non western eq temp scale
        if (isFreezing) {
          _allNotesArray = createEqTempPitchesArr(lwData, false);
        }
        // western 12 note scale for warmer weather
        else {
          _allNotesArray = createEqTempPitchesArr(lwData, true);
        }
        return _allNotesArray;
      }

      function createIntervalsArray(initIntervals, numNotes) {
        var _newIntervals;
        if (numNotes > initIntervals.length) {
          _newIntervals = duplicateArray(duplicateAndPitchArray(initIntervals, 2), 2);
          return _newIntervals;
        } else {
          return initIntervals;
        }
      }

      function getPitchesFromIntervals(allNotesScale, scaleIntervals, centreNoteIndex, numNotes) {
        var _scaleArray = [];
        var _newNote;
        for (var i = 0; i < numNotes; i++) {
          _newNote = allNotesScale[scaleIntervals[i] + centreNoteIndex];
          if (_newNote !== undefined) {
            _scaleArray.push(_newNote);
          } else {
            console.log('undefined note');
          }
        }
        return _scaleArray;
      }

      function createMusicalScale(lwData, allNotesScale, numNotes, centreNoteOffset, scaleType) {
        console.log('allNotesScale.length', allNotesScale.length);
        var _scaleArray = [];
        var _centreNoteIndex = lwData.soundParams.soundPitchOffset + centreNoteOffset;
        var _scaleIntervals = [];
        console.log('_centreNoteIndex', _centreNoteIndex);

        if (scaleType === 'major') {
          console.log('major');
          _scaleIntervals = createIntervalsArray(intervals.heptMajorIntervals, numNotes);
        } else if (scaleType === 'minor') {
          console.log('minor');
          _scaleIntervals = createIntervalsArray(intervals.heptMinorIntervals, numNotes);
        } else if (scaleType === 'minorOct') {
          _scaleIntervals = createIntervalsArray(intervals.octMinorIntervals, numNotes);
        }
        _scaleArray = getPitchesFromIntervals(allNotesScale, _scaleIntervals, _centreNoteIndex, numNotes);
        return _scaleArray;
      }

      function isRootNoteHigh(allNotesScale) {
        if (lwData.soundParams.soundPitchOffset > Math.round(allNotesScale.length / 2)) {
          return true;
        } else {
          return false;
        }
      }

      function getChordOffsetKey(allNotesScale) {
        if (isClement) {
          if (isRootNoteHigh(allNotesScale)) {
            return 'chordsMelancholyDown';
          } else {
            return 'chordsMelancholyUp';
          }
        } else {
          if (isRootNoteHigh(allNotesScale)) {
            return 'chordsPositiveDown';
          } else {
            return 'chordsPositiveUp';
          }
        }
      }

      function getChordsOffsetArr(numChords, allNotesScale) {
        var chordOffsetArr = [];
        var chordOffsetKey = getChordOffsetKey(allNotesScale);
        function getChords(chordOffsetKey) {
          return intervals[chordOffsetKey].map(function(thisNumber) {
            return thisNumber;
          });
        }

        chordOffsetArr = getChords(chordOffsetKey);
        // error check
        if (numChords > chordOffsetArr.length) {
          chordOffsetArr = chordOffsetArr.concat(getChords());
        }
        console.log('chordOffsetArr', chordOffsetArr);
        return chordOffsetArr;
      }

      function makeChordSequence(lwData, numChords, allNotesScale) {
        var chordOffSetArr = getChordsOffsetArr(numChords, allNotesScale);
        var chordSeq = [];
        for (var i = 0; i < numChords; i++) {
          console.log('chordOffSet value', chordOffSetArr[i]);
          //playlogic
          if (isClement) {
            chordSeq.push(createMusicalScale(lwData, allNotesScale, numPadNotes, chordOffSetArr[i], 'major'));
          } else {
            chordSeq.push(createMusicalScale(lwData, allNotesScale, numPadNotes, chordOffSetArr[i], 'minor'));
          }
        }
        console.log('chordSeq', chordSeq);
        return chordSeq;
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
        var organScaleSets = [];
        // Create scales for playback
        var allNotesScale = allNotesScaleType(lwData);
        //Use math.abs for all pitch and volume values?
        //Add global values to the main data object
        //Pressure determines root note. Range 1 octave
        lwData.soundParams.soundPitchOffset = Math.round(sketch.map(
          lwData.pressure.value,
          lwData.pressure.min,
          lwData.pressure.max,
          avSettings.scaleStartIndexBuffer, //x amount from the beginning
          allNotesScale.length - avSettings.scaleStartIndexBuffer //x amount from the end
        ));
        console.log('lwData.soundParams.soundPitchOffset', lwData.soundParams.soundPitchOffset);
        // Set filter
        // visibility is filter freq
        lwData.soundParams.freq.value = sketch.map(Math.round(lwData.visibility.value), lwData.visibility.min, lwData.visibility.max, lwData.soundParams.freq.min, lwData.soundParams.freq.max);
        soundFilter.freq(lwData.soundParams.freq.value);
        soundFilter.res(20);
        //playlogic
        if (isStormy || isFine) {
          organScaleSets = makeChordSequence(lwData, 2, allNotesScale);
        } else {
          organScaleSets = makeChordSequence(lwData, 3, allNotesScale);
        }
        //TODO handle type for arpeggio
        var arpScaleArray = createMusicalScale(lwData, allNotesScale, avSettings.numArpNotes, 0, 'minor');
        playSounds(lwData, organScaleSets, arpScaleArray);
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
			function PadSound(organ, organDist, sax, trumpet) {
				this.organ = organ;
				this.organDist = organDist;
				this.sax = sax;
				this.trumpet = trumpet;
			}

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
        if (audioSupported) {
          for (var i = 0; i < numPadNotes; i++) {
            padSounds[i] = new PadSound(
              sketch.loadSound('/audio/organ-C2.mp3'),
              sketch.loadSound('/audio/organ-C2d.mp3'),
              sketch.loadSound('/audio/sax-C2.mp3'),
              sketch.loadSound('/audio/trumpet-C2.mp3')
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
        masterGain.amp(0, 0, 0);
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
