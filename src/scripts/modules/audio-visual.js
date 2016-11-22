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
var getFreqScales = require('../utilities/create-freq-scales');
var duplicateArray = require('../utilities/duplicate-array-vals');
var getLargestPosNumInArr = require('../utilities/largest-pos-num-in-array');
var getLargestNegNumInArr = require('../utilities/largest-neg-num-in-array');
var addMissingArrayItems = require('../utilities/add-missing-array-items');
var avSettings = require('../settings/av-settings');

module.exports = function() {
  /*
    Module scoped vars
  */
  var isPlaying = false;
	// Sound containers
	var padSounds = [];
  var choralSounds = [];
  //sequencer
  var mainSeqCount = 0;
  //bass
  var bass;
  //Windy/ Brass
  var brassBass;
  var brassBass2;
  //clement / brass
  var brassStabSound;
  var clementArpPhrase;
  var clementArpPart;
  //long note
  var longNote;
  //Rain / drops
  var dropSound;
  var dropLightSound;
  var rainArpDropPhrase;
  var rainArpDropLightPhrase;
  var rainArpPart;
  //Globals
  var soundFilter;
  var freezingFilter;
  var freezingFilterFreq = 2000;
  var masterGain;
  //pan
  var angle = 0;
  var sinVal = 0;
  var cosVal = 0;
  var panArr = [-0.8,0,0.8];
  var rainDropsPattern = [];
  var flttrBrassPattern = [];
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

  function fadeBass() {
    bass.fade(0, avSettings.fadeTime);
    bass.stop();
  }

  function killCurrentSounds() {
      // Stop arrpeggios
      rainArpPart.stop(0);
      rainArpPart.removePhrase('rainDrops');
      rainArpPart.removePhrase('rainDropsLight');
      clementArpPart.stop(0);
      clementArpPart.removePhrase('flttrBrass');
      // Fade organ sounds
      padSounds.forEach(fadeOutPadSounds);
      // Fade choral
      choralSounds.forEach(fadeChoralSounds);
      // Fade bass
      fadeBass();
      // Fade longNote
      longNote.fade(0, avSettings.fadeTime);
      longNote.stop();
      //Fade brassbass
      brassBass.fade(0, avSettings.fadeTime);
      brassBass.stop();
      brassBass2.fade(0, avSettings.fadeTime);
      brassBass2.stop();
      publishBrassOne.unsubscribe();
      publishBrassTwo.unsubscribe();
      isPlaying = false;
      channel.publish('allStopped');
  }

  function makeFlttrBrassSound(time, playbackRate) {
    brassStabSound.rate(playbackRate);
    brassStabSound.setVolume(0.25);
    brassStabSound.play(time);
  }

  function makeDropSound(time, playbackRate) {
    dropSound.rate(playbackRate);
    dropSound.setVolume(0.25);
    dropSound.play(time);
  }

  function makeDropLightSound(time, playbackRate) {
    dropLightSound.rate(playbackRate);
    dropLightSound.setVolume(0.25);
    dropLightSound.play(time);
  }

  function getNumPadNotes(lwData, avSettings, isStormy) {
    var _numPadNotes;
    if (isStormy) {
      _numPadNotes = 3;
    } else {
      _numPadNotes = avSettings.numPadNotes; //4
    }
    return _numPadNotes;
  }

  /**
   * [createP5SoundObjs creates various P5 sound objects if AudioContext is supported]
   */
  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    freezingFilter = new P5.HighPass();
    // Create phrase: name, callback, sequence
    rainArpDropPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
    rainArpDropLightPhrase = new P5.Phrase('rainDropsLight', makeDropLightSound, rainDropsPattern);
    clementArpPhrase = new P5.Phrase('flttrBrass', makeFlttrBrassSound, flttrBrassPattern);
    clementArpPart = new P5.Part();
    rainArpPart = new P5.Part();
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
    var wCheck = {
      //single concept items
      isPrecip: weatherCheck.isPrecip(lwData.precipType, lwData.precipIntensity.value),
      isHumid: weatherCheck.isHumid(lwData.humidity.value),
      isWindy: weatherCheck.isWindy(lwData.windSpeed.value),
      isCloudy: weatherCheck.isCloudy(lwData.cloudCover.value),
      //temperature
      isCold: weatherCheck.isCold(lwData.temperature.value),
      isFreezing: weatherCheck.isFreezing(lwData.temperature.value),
      //broad conditions
      isFine: weatherCheck.isFine(lwData.cloudCover.value, lwData.windSpeed.value, lwData.temperature.value),
      isClement: weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value),
      isStormy: weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value)
    };
    console.log('wCheck', wCheck);
    var numPadNotes = getNumPadNotes(lwData, avSettings, wCheck.isStormy);
    console.log('numPadNotes', numPadNotes);

		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

      function precipCategory() {
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
        var _newNotesArray = duplicateArray(notesArray, 10);
        var _randomStopCount = _newNotesArray.length / 2;
        var _randomIndex;
        //Add stops
        for (var i = 0; i < _randomStopCount; i++) {
          _randomIndex = sketch.random(0,_newNotesArray.length);
          _newNotesArray.splice(_randomIndex, 0, 0);
        }
        return _newNotesArray;
      }

      function getAllegrettoRhythm(scaleArray, includeFills) {
        var _newScaleArr = [];
        for (var i = 0; i < scaleArray.length; i++) {
          //TODO is brittle
          //will only work if array is long enough
          if (i === 0 || i === 2) {
            _newScaleArr.push(scaleArray[i]);
            _newScaleArr.push(0);
            _newScaleArr.push(scaleArray[i]);
            if (!includeFills) {
              _newScaleArr.push(scaleArray[i]);
            }
            if (includeFills) {
              _newScaleArr.push(0);
            }
          } else if (i === 1 || i === 3) {
            _newScaleArr.push(scaleArray[i]);
            if (includeFills) {
              _newScaleArr.push(0);
              _newScaleArr.push(scaleArray[i]);
            }
          }
        }
        return _newScaleArr;
      }

      function getPanIndex(panIndex) {
        if (panIndex < panArr.length -1) {
          panIndex++;
        } else {
          panIndex = 0;
        }
        return panIndex;
      }

      function getLongNoteIndex(scale) {
        var _longNoteIndex;
        var _timesToDivide = scale.length;
        var _bearingSlice = 360 / _timesToDivide;
        //playlogic
        //bearing decides which note in scale to play
        //Could use reduce
        for (var i = 0; i < scale.length; i++) {
          var _currentBearingSlice = _bearingSlice * i;
          if (lwData.windBearing.value <= _currentBearingSlice) {
            _longNoteIndex = i;
          } else {
            _longNoteIndex = _timesToDivide - 1;
          }
        }
        return _longNoteIndex;
      }

      function getMainSeqRepeatNum(scaleSet) {
        var _seqRepeatNum = 0;
        var _seqLength = scaleSet.length - 1;
        //playlogic
        if (wCheck.isFine || wCheck.isFreezing) {
          _seqRepeatNum = _seqLength * 3;
        } else if (wCheck.isCold) {
          _seqRepeatNum = _seqLength * 2;
        } else {
          _seqRepeatNum = _seqLength;
        }
        console.log('_seqRepeatNum', _seqRepeatNum);
        return _seqRepeatNum;
      }

      function setScaleSetIndex(scaleSet) {
        //Using two because we have an extra chord
        //as the last item in the array
        if (scaleSetIndex >= scaleSet.length -2) {
          scaleSetIndex = 0;
        } else {
          scaleSetIndex++;
        }
        return scaleSetIndex;
      }

      function playClementArp(clementArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray;
        //playlogic
        if (wCheck.isStormy || wCheck.isWindy) {
          _newNotesArray = getAllegrettoRhythm(clementArpScaleArray, true);
        } else {
          _newNotesArray = getAllegrettoRhythm(clementArpScaleArray, false);
        }
        console.log('clement arp _newNotesArray', _newNotesArray);
        clementArpPhrase.sequence = _newNotesArray;
        clementArpPart.addPhrase(clementArpPhrase);
        clementArpPart.setBPM(104);
        clementArpPart.start();
        clementArpPart.loop();
        console.log('clementArpPart', clementArpPart);
      }

      function playRainArp(arpeggioType, rainArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray = addRandomStops(rainArpScaleArray).reverse();
        rainArpDropPhrase.sequence = _newNotesArray;
        rainArpDropLightPhrase.sequence = _newNotesArray;
        //Only use dropSound for rain
        if (arpeggioType === 'hard') {
          rainArpPart.addPhrase(rainArpDropPhrase);
        } else {
          rainArpPart.addPhrase(rainArpDropLightPhrase);
        }
        rainArpPart.setBPM(60);
        // Type logic
        switch (arpeggioType) {
          case 'hard':
            rainArpPart.setBPM(150);
            console.log('hard');
            break;
          case 'soft':
            rainArpPart.setBPM(120);
            console.log('soft');
            break;
          case 'softest':
            rainArpPart.setBPM(90);
            console.log('softest');
            break;
          default:
            console.log('problem with arrpeggio ', arpeggioType);
        }
        rainArpPart.start();
        rainArpPart.loop();
        console.log('rainArpPart', rainArpPart);
      }

      function playBass(scaleSet) {
        bass.play();
        //Play 1st note of each chord
        console.log('bass scaleSetIndex', scaleSetIndex);
        console.log('bass rate', scaleSet[scaleSetIndex][0]);
        bass.rate(scaleSet[scaleSetIndex][0]);
        bass.setVolume(0.5);
      }

      function playBrassBass(scaleSetArray) {
        brassBass.play();
        brassBass.rate(scaleSetArray[brassOneScaleArrayIndex]);
        brassBass.setVolume(1);
        if (brassOneScaleArrayIndex >= 1) {
          brassOneScaleArrayIndex = 0;
        } else {
          brassOneScaleArrayIndex++;
        }
      }

      function playBrassBassTwo(scaleArray) {
        var _newScaleArr = scaleArray.slice().reverse();
        brassBass.play();
        brassBass.rate(_newScaleArr[brassTwoScaleArrayIndex]);
        brassBass.setVolume(1);
        if (brassTwoScaleArrayIndex >= scaleArray.length -1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
      }

      function playLongNote(scale) {
        var _longNoteIndex = getLongNoteIndex(scale);
        longNote.disconnect();
        longNote.connect(soundFilter);
        longNote.play();
        console.log('longNote rate', scale[_longNoteIndex]);
        longNote.rate(scale[_longNoteIndex]);
        longNote.pan(sketch.random(panArr));
        longNote.setVolume(sketch.random([0.1, 0.20, 0.5]));
      }

      function playPad(scaleSet, key) {
        var _panIndex = 0;
        var _mainSeqRepeat = getMainSeqRepeatNum(scaleSet);
        // Master sequence
        if (mainSeqCount === _mainSeqRepeat) {
          scaleSetIndex = scaleSet.length - 1;
          mainSeqCount = 0;
        }
        for (var i = 0; i < padSounds.length; i++) {
          padSounds[i][key].disconnect();
          padSounds[i][key].connect(soundFilter);
          padSounds[i][key].play();
          padSounds[i][key].rate(scaleSet[scaleSetIndex][i]);
          padSounds[i][key].pan(panArr[_panIndex]);
          padSounds[i][key].setVolume(avSettings[key].volume);
          padSounds[i][key].onended(function() { padCallback(scaleSet, key); });
          _panIndex = getPanIndex(_panIndex);
        }
        //playlogic
        //Avoid sound clash with Brass
        if (wCheck.isCloudy && !wCheck.isWindy) {
          playBass(scaleSet);
        }
        playLongNote(scaleSet[scaleSetIndex]);
        console.log('scaleSet', scaleSet);
        console.log('scaleSetIndex', scaleSetIndex);
        //increment indices
        setScaleSetIndex(scaleSet);
        mainSeqCount++;
      }

      function padCallback(scaleSet, key) {
        if (isPlaying) {
          padIndexCount++;
          // When all the sounds have played once, loop
          if (padIndexCount === padSounds.length) {
            playPad(scaleSet, key);
            padIndexCount = 0;
          }
        }
      }

      function handlePrecipitation(rainArpScaleArray, rainArpPart) {
        // Handle precipitation
        // playlogic
        if (wCheck.isPrecip) {
          playRainArp(precipCategory(), rainArpScaleArray);
        } else {
          rainArpPart.stop(0);
        }
      }

      function handleChoralSound(scaleArray) {
        // playlogic
        if (wCheck.isFine || wCheck.isFreezing) {
          choralSounds.forEach(function(choralSound, i) {
            // must loop before rate is set
            // issue in Chrome only
            //choralSound.fade(0.17, avSettings.fadeTime);
            if (wCheck.isFreezing) {
              choralSound.disconnect();
              choralSound.connect(freezingFilter);
            }
            choralSound.loop();
            choralSound.rate(scaleArray[i]);
            choralSound.setVolume(0.17);
            console.log('choralSound', choralSound);
          });
        } else {
          console.log('weather is not fine. No choralSounds');
        }
      }

      function handlePadType(scaleSet) {
        //playlogic
        //Start with harshest conditions
        //and work our way up

        //This setting uses non western scale
        if (wCheck.isStormy && wCheck.isFreezing) {
          playPad(scaleSet, 'organ');
        } else if (wCheck.isStormy) {
          //TODO watch out for clash between
          //organDist and brass
          //stormy plays less notes
          playPad(scaleSet, 'organDist');
        } else if (wCheck.isFreezing) {
          playPad(scaleSet, 'trumpet');
        } else if (wCheck.isCold) {
          playPad(scaleSet, 'sax');
        } else {
          playPad(scaleSet, 'organ');
        }
      }

      /**
       * playSounds Handles playback logic
       * Though some of this is delegated
       * @param  {Object} lwData        Main weather data object
       * @param  {Array} padScales    sets of notes to play
       * @param  {Array} rainArpScaleArray a set of notes fot the sequencer to play
       * @return {boolean}               default value
       */
			function playSounds(padScales, rainArpScaleArray, clementArpScaleArray) {
        // Rain
        handlePrecipitation(rainArpScaleArray, rainArpPart);
        // Fine conditions
        handleChoralSound(padScales[0]);
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBass(padScales[0]);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBassTwo(padScales[0]);
          }
        });
        //Organ
        handlePadType(padScales);
        //playlogic
        if (wCheck.isClement) {
          playClementArp(clementArpScaleArray);
        }
        //Tell rest of app we're playing
        isPlaying = true;
        channel.publish('playing', audioSupported);
			}

      function getNumSemisPerOctave() {
        //  Use equal temperament scale for cold & warm
        //  use arbitrary scale for freezing
        var _numSemitones;
        //playlogic
        // non western eq temp scale
        if (wCheck.isStormy && wCheck.isFreezing) {
          _numSemitones = avSettings.numSemitones + (avSettings.numSemitones / 2); //18
          console.log('non western: ', _numSemitones);
        } else {
          _numSemitones = avSettings.numSemitones; //12
        }
        return _numSemitones;
      }

      /*
        Use an equal temperament scale
        Major scale for clement weather
        Minor octave for anything else
        Returns an object containing
        the complete musical scale and the
        number of semitones in an octave
      */
      function createEqTempPitchesArr(numOctaves) {
        var _allNotesArray = [];
        var _numSemitones = getNumSemisPerOctave();
        var _numOctaves = numOctaves || avSettings.numOctaves;
        _allNotesArray = getFreqScales.createEqTempMusicalScale(1, _numOctaves, _numSemitones);
        return _allNotesArray;
      }

      function getRootNote() {
        //Add global values to the main data object
        //Pressure determines root note. Range 2 octaves
        //In western scale it will be between + or - 12
        var _numSemitones = getNumSemisPerOctave();
        var _rangePlus = _numSemitones;
        var _rangeMinus = -Math.abs(_rangePlus);
        var _rootNote = Math.round(sketch.map(
          lwData.pressure.value,
          lwData.pressure.min,
          lwData.pressure.max,
          _rangeMinus,
          _rangePlus
        ));
        if (_rootNote === -0) {
          _rootNote = 0;
        }
        console.log('_rootNote', _rootNote);
        return _rootNote;
      }

      /**
       * Critical function - if the correct number of octaves
       * are not produced the app fails
       * @param  {Number}  largestNumber  [highest positive number]
       * @param  {Number}  smallestNumber [highest negative number]
       * @param  {Number}  rootAndOffset  [root note plus the chord offset]
       * @param  {Number} semisInOct      [Number of semitones in octave]
       * @return {Object}                 [The scale and the total number of octaves]
       */
      function getAllNotesScale(largestNumber, smallestNumber, rootAndOffset, semisInOct) {
        var _highestNoteIndex = largestNumber + Math.abs(rootAndOffset);
        var _lowestNoteIndex = Math.abs(smallestNumber) + Math.abs(rootAndOffset);
        var _highestFraction = _highestNoteIndex / semisInOct;
        var _lowestFraction = _lowestNoteIndex / semisInOct;
        var _numUpperOctaves = Math.ceil(_highestFraction);
        var _numLowerOctaves = Math.ceil(_lowestFraction);
        var _totalOctaves = _numUpperOctaves + _numLowerOctaves;
        console.log('creating array with ' + _totalOctaves + ' octaves ');
        return {
          allNotesScale: createEqTempPitchesArr(_totalOctaves),
          numOctaves: _totalOctaves
        };
      }

      /**
       * Returns a set of intervals that is
       * long enough for the sequence to play
       * @param  {Array} chosenIntervals  [Set of initial intervals]
       * @param  {Number} numNotes      [Number of notes needed]
       * @return {Array}                [current or new array]
       */
      function errorCheckIntervalsArr(chosenIntervals, numNotes, semisInOct, constrainBy) {
        var _newIntervals;
        var _difference = numNotes - chosenIntervals.length;
        var _numUpperOcts;
        var _constrainBy = constrainBy || 0;
        //When using non western scale
        //ensure numbers don't balloon
        if (semisInOct > avSettings.numSemitones) {
          _numUpperOcts = 0;
        } else {
          _numUpperOcts = semisInOct;
        }
        //Error check
        if (_difference > 0) {
          _newIntervals = addMissingArrayItems(chosenIntervals, _difference, _numUpperOcts, _constrainBy);
          console.log('added missing items to', _newIntervals);
        } else {
          _newIntervals = chosenIntervals;
        }
        return _newIntervals;
      }

      function getPitchesFromIntervals(allNotesScale, scaleIntervals, centreNoteIndex, numNotes, intervalIndexOffset) {
        var _scaleArray = [];
        var _newNote;
        var _prevNote;
        var _intervalIndexOffset = intervalIndexOffset || 0;
        for (var i = 0; i < numNotes; i++) {
          _newNote = allNotesScale[scaleIntervals[_intervalIndexOffset] + centreNoteIndex];
          //console.log('scaleIntervals[_intervalIndexOffset]', scaleIntervals[_intervalIndexOffset]);
          //console.log('scaleIntervals[_intervalIndexOffset] + centreNoteIndex', scaleIntervals[_intervalIndexOffset] + centreNoteIndex);
          //console.log('_newNote', _newNote);
          //error check
          if (_newNote !== undefined || isNaN(_newNote) === false) {
            _scaleArray.push(_newNote);
            _prevNote = _newNote;
          } else {
            console.error('undefined or NaN note');
            //_scaleArray.push(-Math.abs(_prevNote));
          }
          _intervalIndexOffset++;
        }
        return _scaleArray;
      }

      function createMusicalScale(numNotes, centreNoteOffset, key, intervalIndexOffset, constrainBy) {
        var _numOcts;
        var _allNotesScale = [];
        var _scaleArray = [];
        var _rootNote = getRootNote();
        var _rootAndOffset = _rootNote + centreNoteOffset;
        var _semisInOct = getNumSemisPerOctave();
        var _scaleIntervals = errorCheckIntervalsArr(intervals[key], numNotes, _semisInOct, constrainBy);
        var _largestPosNumber = getLargestPosNumInArr(_scaleIntervals);
        var _largestNegNumber = getLargestNegNumInArr(_scaleIntervals);
        //Once we know the total range required
        //get all the notes/frequencies
        var _allNotesScaleAndNumOcts = getAllNotesScale(_largestPosNumber, _largestNegNumber, _rootAndOffset, _semisInOct);
        _allNotesScale = _allNotesScaleAndNumOcts.allNotesScale;
        _numOcts = _allNotesScaleAndNumOcts.numOctaves;
        //Get centre note
        //After all notes scale has been created
        var _centreFreqIndex = getFreqScales.findCentreFreqIndex(_numOcts, _semisInOct);
        var _centreNoteIndex = _centreFreqIndex + _rootAndOffset;
        _scaleArray = getPitchesFromIntervals(_allNotesScale, _scaleIntervals, _centreNoteIndex, numNotes, intervalIndexOffset);
        return _scaleArray;
      }

      function isRootNoteHigh() {
        var _rootNote = getRootNote();
        if (_rootNote > 0) {
          return true;
        } else {
          return false;
        }
      }

      function getChordSeqKey() {
        var _key;
        var _rootNoteIsHigh = isRootNoteHigh();
        console.log('_rootNoteIsHigh', _rootNoteIsHigh);
        //For humid weather we use
        //the available notes in the intervals
        //therefore no offset is required
        //TODO not sure humidity is the best
        //value to use
        //playlogic
        if (wCheck.isHumid || wCheck.isPrecip) {
          _key = 'chordsNoOffset';
        }
        //otherwise we use various offsets
        else if (wCheck.isClement) {
          if (_rootNoteIsHigh) {
            _key = 'chordsPositiveDown';
          } else {
            _key = 'chordsPositiveUp';
          }
        }
        else {
          if (_rootNoteIsHigh) {
            _key = 'chordsMelancholyDown';
          } else {
            _key = 'chordsMelancholyUp';
          }
        }
        console.log('chord seq type', _key);
        return _key;
      }

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _chordSeqKey = getChordSeqKey();
        var _diff;
        _chordOffsetArr = intervals[_chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = addMissingArrayItems(_chordOffsetArr, _diff, null);
        }
        return _chordOffsetArr;
      }

      function getChordType() {
        var _chordType;
        //playlogic
        if (wCheck.isFine) {
          _chordType = 'majorSeventhIntervals';
        } else if (wCheck.isClement) {
          _chordType = 'heptMajorIntervals';
        } else if (wCheck.isStormy) {
          _chordType = 'heptMinorIntervals';
        } else {
          _chordType = 'minorSeventhIntervals';
        }
        console.log('_chordType', _chordType);
        return _chordType;
      }

      function getNumChords() {
        var _numChords;
        //playlogic
        // We use a non western scale for freezing
        // so only play two chords
        if (wCheck.isStormy && wCheck.isFreezing) {
          _numChords = 2;
        } else if (wCheck.isStormy || wCheck.isFine) {
          _numChords = 3;
        } else {
          _numChords = avSettings.numChords; //4
        }
        console.log('_numChords', _numChords);
        return _numChords;
      }

      function getIntervalIndexOffsetKey() {
        var _key;
        //playlogic
        if (wCheck.isHumid || wCheck.isPrecip) {
          _key = 'chordIndexes';
        } else {
          _key = 'chordIndexesNoOffset';
        }
        console.log('interval arr for chord ', _key);
        return _key;
      }

      function getIntervalIndexOffsetArr(numChords) {
        var _chordIndexOffSetArr = [];
        var _chordIndexOffSetKey = getIntervalIndexOffsetKey();
        var _diff;
        _chordIndexOffSetArr = intervals[_chordIndexOffSetKey];
        if (numChords > _chordIndexOffSetArr.length) {
          _diff = numChords - _chordIndexOffSetArr.length;
          _chordIndexOffSetArr = addMissingArrayItems(_chordIndexOffSetArr, _diff, null, null);
        }
        return _chordIndexOffSetArr;
      }

      function makeChordSequence(numChords) {
        var _chordSeq = [];
        var _chordType = getChordType();
        var _numSemitones = getNumSemisPerOctave();
        //Chord shift
        var _chordSeqOffsetArr = getChordSeqOffsetArr(numChords);
        var _eChordVal = _chordSeqOffsetArr[0] - _numSemitones;
        //Chord from within intervals shift
        var _intervalIndexOffsetArr = getIntervalIndexOffsetArr(numChords);
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(createMusicalScale(numPadNotes, _chordSeqOffsetArr[i], _chordType, _intervalIndexOffsetArr[i]));
        }
        //Adding extra chord
        _chordSeq.push(createMusicalScale(numPadNotes, _eChordVal, _chordType, _intervalIndexOffsetArr[0]));
        return _chordSeq;
      }

      function setFilter() {
        //Use math.abs for all pitch and volume values?
        // Set filter. Visibility is filter freq
        lwData.sParams.freq.value = sketch.map(Math.round(lwData.visibility.value), lwData.visibility.min, lwData.visibility.max, lwData.sParams.freq.min, lwData.sParams.freq.max);
        soundFilter.freq(lwData.sParams.freq.value);
        soundFilter.res(20);
      }

      function createClementArpScale() {
        var _clementArpCNoteOffset = 0;
        var _clementIntervals;
        //playlogic
        if (wCheck.isFreezing) {
          _clementArpCNoteOffset = -Math.abs(getNumSemisPerOctave());
        }
        if (wCheck.isStormy || wCheck.isWindy) {
          _clementIntervals = 'closeIntervalsAlt';
        } else {
          _clementIntervals = 'closeIntervals';
        }
        var _constrainBy = 0;
        var _intervalIndexOffset = 0;
        return createMusicalScale(avSettings.numClementArpNotes, _clementArpCNoteOffset, _clementIntervals, _intervalIndexOffset, _constrainBy);
      }

      function createRainArpScale() {
        var _semisInOct = getNumSemisPerOctave();
        var _rainArpCNoteOffset = -Math.abs(_semisInOct * 2);
        var _constrainBy = 1;
        var _intervalIndexOffset = 0;
        return createMusicalScale(avSettings.numRainArpNotes, _rainArpCNoteOffset, 'safeIntervals', _intervalIndexOffset, _constrainBy);
      }

      /*
      	Sound config algorithm
      	---------------
      	The distortion is set by cloud cover
      	The note volume is set by wind speed
      	The root key is set by the air pressure
      	The filter frequency is set by visibility
       */
			function configureSounds() {
        var _organScaleSets = [];
        var _rainArpScaleArray = [0];
        var _clementArpScaleArray = [0];
        var _numChords = getNumChords();
        // Set filter for pad sounds
        setFilter();
        //Make arrays of frequencies for playback
        _organScaleSets = makeChordSequence(_numChords);
        //TODO only create necessary scales
        _rainArpScaleArray = createRainArpScale();
        _clementArpScaleArray = createClementArpScale();
        console.log('_organScaleSets', _organScaleSets);
        console.log('_rainArpScaleArray', _rainArpScaleArray);
        console.log('_clementArpScaleArray', _clementArpScaleArray);
        playSounds(_organScaleSets, _rainArpScaleArray, _clementArpScaleArray);
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
          //Pad sounds for various weather types
          for (var i = 0; i < numPadNotes; i++) {
            padSounds[i] = new PadSound(
              sketch.loadSound('/audio/organ-C2.mp3'),
              sketch.loadSound('/audio/organ-C2d.mp3'),
              sketch.loadSound('/audio/sax-C2.mp3'),
              sketch.loadSound('/audio/trumpet-C2.mp3')
            );
          }
          //choral sounds for fine weather
          for (var j = 0; j < 2; j++) {
            choralSounds.push(sketch.loadSound('/audio/choral.mp3'));
          }
          dropSound = sketch.loadSound('/audio/drop.mp3');
          dropLightSound = sketch.loadSound('/audio/drop-light.mp3');
          bass = sketch.loadSound('/audio/bass.mp3');
          brassBass = sketch.loadSound('/audio/brassbass.mp3');
          brassBass2 = sketch.loadSound('/audio/brassbass.mp3');
          brassStabSound = sketch.loadSound('/audio/brass-stab-C3.mp3');
          longNote = sketch.loadSound('/audio/longnote-C3.mp3');
        }
			};

			sketch.setup = function setup() {
        //TODO create master channel
        //masterGain.amp(0, 0, 0);
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
          configureSounds();
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
        //Brass section
        if (angle > 360) {
          angle = 0;
        }
        sinVal = sketch.sin(angle);
        cosVal = sketch.cos(angle);
        brassBass.pan(sinVal);
        brassBass2.pan(cosVal);
        angle += 0.05;
        if (sketch.frameCount % 350 === 0) {
          channel.publish('triggerBrassOne');
        }
        if (sketch.frameCount % 650 === 0) {
          channel.publish('triggerBrassTwo');
        }
        //Update filter
        freezingFilterFreq++;
        if (freezingFilterFreq >= 5500) {
          freezingFilterFreq = 0;
        }
        freezingFilter.freq(freezingFilterFreq);
        freezingFilter.res(33);
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
