/*
	This module manages the
  sonic and visual output of the app
 */

'use strict';
//3rd party
var P5 = require('../libs/p5');
require('../libs/p5.sound');
var postal = require('postal');
var channel = postal.channel();
var appTemplate = require('../templates/index').codisplay;
var he = require('he');
//custom
var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var codisplayData = require('./co-display-data');
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
    and constants
  */
  var audioSupported = true;
  var isPlaying = false;
  //bass
  var bass;
  //Windy/ Brass
  var brassBaritone;
  var brassBaritone2;
  var brassBaritone3;
  //clement / brass
  var brassStabSound;
  var clementArpPhrase;
  var humidArpPart;
  //long note
  var longNote;
  //Rain / drops
  var dropSound;
  var dropLightSound;
  var rainArpDropPhrase;
  var rainArpDropLightPhrase;
  var rainArpPart;
  //windChime
  var windChime;
  //Globals
  var soundFilter;
  var freezingFilter;
  var reverb;
  //pan
  var angle = 0;
  var sinVal = 0;
  var cosVal = 0;
  var panArr = [-0.8, 0, 0.8];
  var rainDropsPattern = [];
  var flttrBrassPattern = [];
  //Sound objects
  var padSounds = [];
  var choralSounds = [];
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
  //DOM
  var cdContainer = document.querySelector('.conditions-display__list');

  /*
    Utility functions
  */

	// Is this size or smaller
	function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  }

  function mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  function getOrdinal(number) {
    var oSuffix = ['th','st','nd','rd'];
    var remainder = number % 100;
    return number + (oSuffix[(remainder - 20) % 10] || oSuffix[remainder] || oSuffix[0]);
  }

  function addSpacesToString(string) {
    return string.replace(/([A-Z][a-z]+)/g, ' ' + '$&');
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

  function killCurrentSounds(autoStart) {
      // Stop arrpeggios
      rainArpPart.stop(0);
      rainArpPart.removePhrase('rainDrops');
      rainArpPart.removePhrase('rainDropsLight');
      humidArpPart.stop(0);
      humidArpPart.removePhrase('flttrBrass');
      // Fades organ sounds
      padSounds.forEach(fadeOutPadSounds);
      choralSounds.forEach(fadeChoralSounds);
      longNote.fade(0, avSettings.fadeTime);
      brassBaritone.fade(0, avSettings.fadeTime);
      brassBaritone2.fade(0, avSettings.fadeTime);
      brassBaritone3.fade(0, avSettings.fadeTime);
      windChime.fade(0, avSettings.fadeTime);
      bass.fade(0, avSettings.fadeTime);
      setTimeout(function(){
        longNote.stop();
        brassBaritone.stop();
        brassBaritone2.stop();
        brassBaritone3.stop();
        windChime.stop();
        bass.stop();
      }, avSettings.fadeTime * 1000);
      //Unsubs
      publishBrassOne.unsubscribe();
      publishBrassTwo.unsubscribe();
      isPlaying = false;
      console.log('autoStart', autoStart);
      channel.publish('allStopped', autoStart);
  }

  function makeFlttrBrassSound(time, playbackRate, volume) {
    brassStabSound.rate(playbackRate);
    brassStabSound.setVolume(0.15);
    brassStabSound.play(time, playbackRate, volume);
  }

  function makeDropSound(time, playbackRate, volume) {
    dropSound.rate(playbackRate);
    dropSound.setVolume(0.2);
    dropSound.play(time, playbackRate, volume);
  }

  function makeDropLightSound(time, playbackRate, volume) {
    dropLightSound.rate(playbackRate);
    dropLightSound.setVolume(0.2);
    dropLightSound.play(time, playbackRate, volume);
  }

  function getNumPadNotes(wCheck, avSettings) {
    var _numPadNotes;
    //playlogic
    if (wCheck.isWindy && wCheck.isFreezing) {
      _numPadNotes = 3;
    } else {
      _numPadNotes = avSettings.numPadNotes; //4
    }
    return _numPadNotes;
  }

  function getNumChords(lwData, avSettings, wCheck) {
    var _numChords;
    var _numExtraChords;
    //playlogic
    // We use a non western scale for freezing
    // so only play two chords
    if (wCheck.isWindy && wCheck.isFreezing) {
      _numChords = 2;
    } else if (wCheck.isStormy || wCheck.isFine) {
      _numChords = 3;
    } else {
      _numChords = avSettings.numChords; //4
    }
    //TODO could use better data point
    //Dew point perhaps?
    _numExtraChords = Math.round(mapRange(
      lwData.ozone.value,
      lwData.ozone.min,
      lwData.ozone.max,
      0,
      _numChords * 2
    ));
    return {
      numChords: _numChords,
      numExtraChords: _numExtraChords
    };
  }

  function getNumSemisPerOctave(avSettings, wCheck) {
    //  Use equal temperament scale for cold & warm
    //  use arbitrary scale for freezing
    var _numSemitones;
    //playlogic
    // non western eq temp scale
    if (wCheck.isWindy && wCheck.isFreezing) {
      _numSemitones = avSettings.numSemitones * 2; //24
      console.log('non western: ', _numSemitones);
    } else {
      _numSemitones = avSettings.numSemitones; //12
    }
    return _numSemitones;
  }

  function getPadType(wCheck) {
    var padType = '';
    //playlogic
    //Start with harshest conditions
    //and work our way up

    //This setting uses non western scale
    if (wCheck.isWindy && wCheck.isFreezing) {
      padType = 'organ';
    } else if (wCheck.isStormy) {
      //TODO watch out for clash between
      //organDist and brass
      //stormy plays less notes
      padType = 'organDist';
    } else if (wCheck.isFreezing) {
      padType = 'trumpet';
    } else if (wCheck.isCold) {
      padType = 'saxophone';
    } else {
      padType = 'organ';
    }
    return padType;
  }

  function getChordType(wCheck) {
    var _chordType;
    //playlogic
    if (wCheck.isFine) {
      _chordType = 'heptatonicMajorIntervals';
    } else if (wCheck.isClement) {
      _chordType = 'majorSeventhIntervals';
    } else if (wCheck.isStormy) {
      _chordType = 'heptatonicMinorIntervals';
    } else {
      _chordType = 'minorSeventhIntervals';
    }
    console.log('_chordType', _chordType);
    return _chordType;
  }

  function getChordSeqKey(wCheck, rootNoteHigh) {
    var _key;
    console.log('rootNoteHigh', rootNoteHigh);
    //For humid weather we use
    //the available notes in the intervals
    //therefore no offset is required
    //value to use
    //playlogic
    if (wCheck.isFine) {
      if (rootNoteHigh) {
        _key = 'chordsPositiveDown';
      } else {
        _key = 'chordsPositiveUp';
      }
    } else if (wCheck.isClement) {
      _key = 'chordsNoOffset';
    } else {
      if (rootNoteHigh) {
        _key = 'chordsMelancholyDown';
      } else {
        _key = 'chordsMelancholyUp';
      }
    }
    console.log('chord seq type', _key);
    return _key;
  }

  function getMainSeqRepeatNum(wCheck, numChords, numExtraChords) {
    var _seqRepeatNum = 0;
    var _seqLength = numChords - numExtraChords;
    //playlogic
    if (wCheck.isFine || wCheck.isFreezing) {
      _seqRepeatNum = _seqLength * 3; //was 4
    } else if (wCheck.isCold) {
      _seqRepeatNum = _seqLength * 2; //was 3
    } else {
      _seqRepeatNum = _seqLength * 1; //was 2
    }
    console.log('_seqRepeatNum', _seqRepeatNum);
    return _seqRepeatNum;
  }

  function getRootNote(lwData, numSemisPerOctave) {
    //Add global values to the main data object
    //Pressure determines root note. Range 2.5 octaves
    //In western scale it will be between + or - 12
    var _rangePlus = Math.round(numSemisPerOctave + numSemisPerOctave / 2);
    var _rangeMinus = -Math.abs(_rangePlus);
    //playlogic
    var _rootNote = Math.round(mapRange(
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

  function getLongNoteIndex(lwData, numPadNotes) {
    var _longNoteIndex;
    var _timesToDivide = numPadNotes;
    var _bearingSlice = 360 / _timesToDivide;
    //playlogic
    //bearing decides which note in scale to play
    //Could use reduce
    for (var i = 0; i < _timesToDivide; i++) {
      var _currentBearingSlice = _bearingSlice * i;
      if (lwData.windBearing.value <= _currentBearingSlice) {
        _longNoteIndex = i;
      } else {
        _longNoteIndex = _timesToDivide - 1;
      }
    }
    return _longNoteIndex;
  }

  function getPrecipCategory(lwData) {
    if (lwData.precipType === 'rain' && lwData.precipIntensity.value > 0.2) {
      return 'hard';
    } else if (lwData.precipType === 'sleet' || lwData.precipIntensity.value <= 0.2) {
      return 'soft';
    } else if (lwData.precipType === 'snow' || lwData.precipIntensity.value <= 0.1) {
      return 'softest';
    } else {
      console.log('no rain? type is: ', lwData.precipType);
      return null;
    }
  }

  function getPrecipArpBpm(precipCategory) {
    // playlogic
    var _arpBpm = 110;
    switch (precipCategory) {
      case 'hard':
        _arpBpm = 150;
        console.log('hard');
        break;
      case 'soft':
        _arpBpm = 120;
        console.log('soft');
        break;
      case 'softest':
        _arpBpm = 90;
        console.log('softest');
        break;
      default:
        console.log('problem with arrpeggio type', precipCategory);
    }
    return _arpBpm;
  }

  function getMasterFilterFreq(lwData) {
    //Use math.abs for all pitch and volume values?
    // Set filter. Visibility is filter freq
    // playlogic
    return mapRange(
      Math.round(lwData.visibility.value),
      lwData.visibility.min,
      lwData.visibility.max,
      avSettings.masterFilter.min,
      avSettings.masterFilter.max
    );
  }

  function isRootNoteHigh(rootNote) {
    if (rootNote > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * [createP5SoundObjs creates various P5 sound objects if AudioContext is supported]
   */
  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    freezingFilter = new P5.HighPass();
    reverb = new P5.Reverb();
    // Create phrase: name, callback, sequence
    rainArpDropPhrase = new P5.Phrase('rainDrops', makeDropSound, rainDropsPattern);
    rainArpDropLightPhrase = new P5.Phrase('rainDropsLight', makeDropLightSound, rainDropsPattern);
    clementArpPhrase = new P5.Phrase('flttrBrass', makeFlttrBrassSound, flttrBrassPattern);
    humidArpPart = new P5.Part();
    rainArpPart = new P5.Part();
  }

	// main app init
	function init(lwData) {
    console.log('lwData', lwData);
    //Init scoped values
    var mainSeqCount = 0;
    var extraSeqCount = 0;
    var extraSeqPlaying = false;
    var brassOneScaleArrayIndex = 0;
    var brassTwoScaleArrayIndex = 0;
    var scaleSetIndex = 0;
    var padIndexCount = 0;
    var freezingFilterFreq = 2000;
    var windChimeRate = 1;
    var windChimeVol = 0.4;
    var masterGain = 0;
    //clear data
    padSounds = [];
    choralSounds = [];
    // grouped weather booleans
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
    var numPadNotes = getNumPadNotes(wCheck, avSettings);
    var numChords = getNumChords(lwData, avSettings, wCheck).numChords;
    var numExtraChords = getNumChords(lwData, avSettings, wCheck).numExtraChords;
    var numSemisPerOctave = getNumSemisPerOctave(avSettings, wCheck);
    var precipCategory = getPrecipCategory(lwData);
    var precipArpBpm = getPrecipArpBpm(precipCategory);
    var padType = getPadType(wCheck);
    var chordType = getChordType(wCheck);
    var seqRepeatNum = getMainSeqRepeatNum(wCheck, numChords, numExtraChords);
    var rootNote = getRootNote(lwData, numSemisPerOctave);
    var rootNoteHigh = isRootNoteHigh(rootNote);
    var longNoteIndex = getLongNoteIndex(lwData, numPadNotes);
    var masterFilterFreq = getMasterFilterFreq(lwData);
    var chordSeqKey = getChordSeqKey(wCheck, rootNoteHigh);

		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

      channel.subscribe('allStopped', function() {
        sketch.noLoop();
      });

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
          if (i % 2 === 0) {
            _newScaleArr.push(scaleArray[i]);
            _newScaleArr.push(0);
            _newScaleArr.push(scaleArray[i]);
            if (!includeFills) {
              _newScaleArr.push(scaleArray[i]);
            }
            if (includeFills) {
              _newScaleArr.push(0);
            }
          } else if (i % 2 !== 0) {
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

      function setScaleSetIndex(scaleSet, numExtraChords) {
        if (scaleSetIndex >= scaleSet.length - 1 - numExtraChords) {
          scaleSetIndex = 0;
        } else {
          scaleSetIndex++;
        }
        return scaleSetIndex;
      }

      function getAllegrettoRhythmType(humidArpScaleArray) {
        var _newNotesArray = [];
        //playlogic
        if (wCheck.isHumid) {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, true);
        } else {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, false);
        }
        return _newNotesArray;
      }

      function clemArpEnd(notesArray) {
        var _randomNote = sketch.random(notesArray);
        //Setup reverb
        brassBaritone3.disconnect();
        reverb.process(brassBaritone3, 4, 10);
        brassBaritone3.play();
        brassBaritone3.rate(_randomNote * 3);
        brassBaritone3.setVolume(1);
      }

      function playHumidArp(humidArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray = getAllegrettoRhythmType(humidArpScaleArray);
        clementArpPhrase.sequence = _newNotesArray;
        console.log('clementArpPhrase.sequence', clementArpPhrase.sequence);
        //Play Sequence
        humidArpPart.addPhrase(clementArpPhrase);
        humidArpPart.setBPM(104);
        humidArpPart.playingMelody = true;
        humidArpPart.loop();
      }

      function playRainArp(rainArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray = addRandomStops(rainArpScaleArray).reverse();
        rainArpDropPhrase.sequence = _newNotesArray;
        rainArpDropLightPhrase.sequence = _newNotesArray;
        //Only use dropSound for rain
        if (precipCategory === 'hard') {
          rainArpPart.addPhrase(rainArpDropPhrase);
        } else {
          rainArpPart.addPhrase(rainArpDropLightPhrase);
        }
        rainArpPart.setBPM(precipArpBpm);
        rainArpPart.playingMelody = true;
        rainArpPart.loop();
      }

      function playBass(scaleSet) {
        bass.play();
        //Play 1st note of each chord
        console.log('bass paying at rate', scaleSet[scaleSetIndex][0]);
        bass.rate(scaleSet[scaleSetIndex][0]);
        //TODO could set the volume
        //based on the amount of cloudCover
        bass.setVolume(0.5);
      }

      function playBrassBaritone(scale) {
        brassBaritone.play();
        brassBaritone.rate(scale[brassOneScaleArrayIndex]);
        brassBaritone.setVolume(0.9);
        if (brassOneScaleArrayIndex >= 1) {
          brassOneScaleArrayIndex = 0;
        } else {
          brassOneScaleArrayIndex++;
        }
      }

      function playBrassBaritoneTwo(scale) {
        var _newScaleArr = scale.slice().reverse();
        var _rateMultArr = [1, 2];
        var _randomRateMultVal = sketch.random(_rateMultArr);
        brassBaritone2.play();
        brassBaritone2.rate(_newScaleArr[brassTwoScaleArrayIndex] * _randomRateMultVal);
        brassBaritone2.setVolume(0.4);
        if (brassTwoScaleArrayIndex >= scale.length -1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
      }

      function playLongNote(scale, extraSeqPlaying) {
        longNote.disconnect();
        longNote.connect(soundFilter);
        longNote.play();
        if (extraSeqPlaying) {
          longNote.rate(scale[longNoteIndex] / 2);
        } else {
          longNote.rate(scale[longNoteIndex]);
        }
        longNote.pan(sketch.random(panArr));
        longNote.setVolume(sketch.random([0.1, 0.20, 0.5]));
      }

      function playPad(scaleSet, key) {
        var _panIndex = 0;
        // Master sequence
        if (mainSeqCount === seqRepeatNum && numExtraChords > 0) {
          //If we've played the whole sequence
          //seqRepeatNum number of times
          //play the first chord of extraChords
          scaleSetIndex = scaleSet.length - numExtraChords + extraSeqCount;
          extraSeqCount++;
          extraSeqPlaying = true;
          //Once we've played all the extraChords
          //start over
          if (extraSeqCount === numExtraChords) {
            mainSeqCount = 0;
            extraSeqCount = 0;
          }
        } else {
          extraSeqPlaying = false;
          mainSeqCount++;
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
        playLongNote(scaleSet[scaleSetIndex], extraSeqPlaying);
        //increment indices
        setScaleSetIndex(scaleSet, numExtraChords);
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

      function handleChoralSound(scaleArray) {
        // playlogic
        if (wCheck.isFine || wCheck.isFreezing) {
          choralSounds.forEach(function(choralSound, i) {
            // must loop before rate is set
            // issue in Chrome only
            if (wCheck.isFreezing) {
              choralSound.disconnect();
              choralSound.connect(freezingFilter);
            }
            choralSound.loop();
            //playlogic
            if (wCheck.isFreezing) {
              choralSound.rate(scaleArray[i] / 2);
              choralSound.setVolume(0.23);
            } else {
              choralSound.rate(scaleArray[i]);
              choralSound.setVolume(0.1);
            }
            console.log('weather is fine or freezing. playing choralSounds rate ', choralSound);
          });
        } else {
          console.log('weather is not fine or freezing. No choralSounds');
        }
      }

      /**
       * playSounds Handles playback logic
       * Though some of this is delegated
       * @param  {Array} padScales    sets of notes to play
       * @param  {Array} rainArpScaleArray a set of notes fot the sequencer to play
       * @param  {Array} humidArpScaleArray a set of notes fot the sequencer to play
       * @return {boolean}               default value
       */
			function playSounds(padScales, rainArpScaleArray, humidArpScaleArray) {
        // Fine conditions
        handleChoralSound(padScales[0]);
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBaritone(padScales[scaleSetIndex]);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBaritoneTwo(padScales[scaleSetIndex]);
          }
        });
        //Organ
        playPad(padScales, padType);
        //Clement arpeggio
        if (humidArpScaleArray.length > 0) {
          playHumidArp(humidArpScaleArray);
        }
        //Rain arpeggio
        if (rainArpScaleArray.length > 0) {
          playRainArp(rainArpScaleArray);
        }
        windChime.loop();
        windChime.rate(windChimeRate);
        windChime.setVolume(windChimeVol);
        //Tell rest of app we're playing
        isPlaying = true;
        channel.publish('playing', audioSupported);
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
          allNotesScale: getFreqScales.createEqTempMusicalScale(1, _totalOctaves, semisInOct),
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
          //error check
          if (_newNote !== undefined || isNaN(_newNote) === false) {
            _scaleArray.push(_newNote);
            _prevNote = _newNote;
          } else {
            console.error('undefined or NaN note');
            // TODO is this necessary?
            //_scaleArray.push(-Math.abs(_prevNote));
          }
          _intervalIndexOffset++;
        }
        return _scaleArray;
      }

      function getRootNoteLetter(numSemisPerOctave) {
        var _rootNoteLetter = '';
        var _rootNoteNumber = rootNote + 1;
        if (numSemisPerOctave !== 12) {
          _rootNoteLetter = getOrdinal(_rootNoteNumber) + ' note in a non western scale';
        } else {
          if (rootNote < 0) {
            _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[getFreqScales.CHROMATIC_SCALE.length - 1 + rootNote];
          } else {
            _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[rootNote];
          }
        }
        console.log('_rootNoteLetter', _rootNoteLetter);
        return _rootNoteLetter;
      }

      function createMusicalScale(numNotes, centreNoteOffset, key, intervalIndexOffset, constrainBy) {
        var _numOcts;
        var _allNotesScale = [];
        var _scaleArray = [];
        var _rootAndOffset = rootNote + centreNoteOffset;
        var _scaleIntervals = errorCheckIntervalsArr(intervals[key], numNotes, numSemisPerOctave, constrainBy);
        var _largestPosNumber = getLargestPosNumInArr(_scaleIntervals);
        var _largestNegNumber = getLargestNegNumInArr(_scaleIntervals);
        //Once we know the total range required
        //get all the notes/frequencies
        var _allNotesScaleAndNumOcts = getAllNotesScale(_largestPosNumber, _largestNegNumber, _rootAndOffset, numSemisPerOctave);
        _allNotesScale = _allNotesScaleAndNumOcts.allNotesScale;
        _numOcts = _allNotesScaleAndNumOcts.numOctaves;
        //Get centre note
        //After all notes scale has been created
        var _centreFreqIndex = getFreqScales.findCentreFreqIndex(_numOcts, numSemisPerOctave);
        var _centreNoteIndex = _centreFreqIndex + _rootAndOffset;
        _scaleArray = getPitchesFromIntervals(_allNotesScale, _scaleIntervals, _centreNoteIndex, numNotes, intervalIndexOffset);
        return _scaleArray;
      }

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _diff;
        _chordOffsetArr = intervals[chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = addMissingArrayItems(_chordOffsetArr, _diff, null);
        }
        return _chordOffsetArr;
      }

      function getIntervalIndexOffsetKey() {
        var _key;
        //playlogic
        if (wCheck.isClement) {
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

      function makeChordSequence(numChords, numExtraChords, numSemisPerOctave) {
        console.log('numChords', numChords);
        console.log('numExtraChords', numExtraChords);
        var _chordSeq = [];
        //Chord shift
        var _chordSeqOffsetArr = getChordSeqOffsetArr(numChords);
        //Chord from within intervals shift
        var _intIndOffsetArr = getIntervalIndexOffsetArr(numChords);
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(createMusicalScale(numPadNotes, _chordSeqOffsetArr[i], chordType, _intIndOffsetArr[i]));
        }
        //Adding extra chord
        for (var j = 0; j < numExtraChords; j++) {
          _chordSeq.push(createMusicalScale(numPadNotes, _chordSeqOffsetArr[j] - numSemisPerOctave, chordType, _intIndOffsetArr[j]));
        }
        return _chordSeq;
      }

      function setFilter() {
        soundFilter.freq(masterFilterFreq);
        soundFilter.res(20);
      }

      function createClementArpScale(numSemisPerOctave) {
        var _cArpCNoteOffset = 0;
        var _cIntervals;
        //playlogic
        if (wCheck.isFreezing) {
          _cArpCNoteOffset = -Math.abs(numSemisPerOctave);
        }
        if (wCheck.isStormy || wCheck.isWindy) {
          _cIntervals = 'closeIntervalsAlt';
        } else {
          _cIntervals = 'closeIntervals';
        }
        var _constrainBy = 0;
        var _intervalIndexOffset = 0;
        return createMusicalScale(avSettings.numCArpNotes, _cArpCNoteOffset, _cIntervals, _intervalIndexOffset, _constrainBy);
      }

      function hasWordSeventh(intervalString) {
        var hasSeventh = /Seventh/;
        return hasSeventh.test(intervalString);
      }

      function createRainArpScale(numSemisPerOctave) {
        var _rArpCNoteOffset = -Math.abs(numSemisPerOctave * 2);
        var _constrainBy = 1;
        var _intervalIndexOffset = 0;
        var _intervalType;
        if (hasWordSeventh(chordType)) {
          console.log('hasWordSeventh');
          _intervalType = 'safeSeventhIntervals';
          _constrainBy = 2;
        } else {
          console.log('does not hasWordSeventh');
          _intervalType = 'safeIntervals';
        }
        return createMusicalScale(avSettings.numRArpNotes, _rArpCNoteOffset, _intervalType, _intervalIndexOffset, _constrainBy);
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
        var _rainArpScaleArray = [];
        var _humidArpScaleArray = [];
        // Set filter for pad sounds
        setFilter();
        //Make arrays of frequencies for playback
        //TODO do we need to pass init scoped members?
        _organScaleSets = makeChordSequence(numChords, numExtraChords, numSemisPerOctave);
        //playlogic
        if (wCheck.isPrecip) {
          _rainArpScaleArray = createRainArpScale(numSemisPerOctave);
        }
        if (wCheck.isHumid) {
          _humidArpScaleArray = createClementArpScale(numSemisPerOctave);
        }
        playSounds(_organScaleSets, _rainArpScaleArray, _humidArpScaleArray);
			}

      function outputChordSeqType() {
        if (chordSeqKey === 'chordsNoOffset') {
          return 'using inversions';
        } else {
          return chordSeqKey;
        }
      }

      function mapConditionsToDisplayData() {
        var lwDataArr = Object.keys(lwData);
        var wCheckArr = Object.keys(wCheck);
        for (var i = 0; i < codisplayData.length; i++) {
          for (var j = 0; j < lwDataArr.length; j++) {
            if (codisplayData[i].key === lwDataArr[j]) {
              codisplayData[i].value = lwData[lwDataArr[j]].value || lwData[lwDataArr[j]];
            }
          }
        }
        for (var k = 0; k < codisplayData.length; k++) {
          for (var l = 0; l < wCheckArr.length; l++) {
            if (codisplayData[k].key === wCheckArr[l]) {
              codisplayData[k].value = wCheck[wCheckArr[l]];
            }
          }
        }
        return codisplayData;
      }

      function unitiseData(codisplayData) {
        return codisplayData.map(function(coProp) {
          if (coProp.key === 'temperature' || coProp.key === 'apparentTemperature') {
            coProp.value = frnhtToCelcius(coProp.value).toFixed(2);
            coProp.unit = 'C' + he.decode('&deg');
          }
          if (coProp.key === 'windBearing') {
            coProp.unit = he.decode('&deg');
          }
          if (coProp.key === 'cloudCover' || coProp.key === 'humidity') {
            coProp.unit = he.decode('&#37');
          }
          return coProp;
        });
      }

      function addMusicValues(codisplayData) {
        return codisplayData.map(function(coProp) {
          switch (coProp.key) {
            case 'ozone':
                coProp.musicValue = numExtraChords;
                break;
            case 'pressure':
                coProp.musicValue = getRootNoteLetter(numSemisPerOctave);
                break;
            case 'visibility':
                coProp.musicValue = Math.round(masterFilterFreq);
                break;
            case 'apparentTemperature':
                coProp.musicValue = seqRepeatNum;
                break;
            case 'summary':
                coProp.musicValue = addSpacesToString(chordType);
                break;
            case 'isStormy':
                coProp.musicValue = numChords;
                break;
            case 'isClement':
                coProp.musicValue = outputChordSeqType();
                break;
            case 'windSpeed':
                coProp.musicValue = windChimeRate.toFixed(2);
                break;
            case 'windBearing':
                coProp.musicValue = getOrdinal(longNoteIndex);
                break;
            case 'temperature':
                coProp.musicValue = numSemisPerOctave;
                break;
            case 'precipType':
                coProp.musicValue = precipArpBpm;
                break;
            case 'summaryAlt':
                //TODO output a weather value
                coProp.musicValue = addSpacesToString(padType);
                break;
            case 'extremeWeather':
                //TODO output a weather value
                coProp.musicValue = numPadNotes;
                break;
            }
          return coProp;
        });
      }

      function configureDisplay() {
        var _mappedData = mapConditionsToDisplayData();
        var _unitisedData = unitiseData(_mappedData);
        var _musicValData = addMusicValues(_unitisedData);
        console.log('_musicValData', _musicValData);
        _musicValData.forEach(function(condition) {
          if (condition.value) {
            var html = appTemplate(condition);
            cdContainer.insertAdjacentHTML('beforeend', html);
          } else {
            console.log('Not displayed because not truthy ', condition);
          }
        });
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
        //TODO consider using different sound
        //distorted guiter perhaps
				this.organDist = organDist;
				this.saxophone = sax;
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
          brassBaritone = sketch.loadSound('/audio/brassbass.mp3');
          brassBaritone2 = sketch.loadSound('/audio/brassbass.mp3');
          brassBaritone3 = sketch.loadSound('/audio/brassbass.mp3');
          brassStabSound = sketch.loadSound('/audio/brass-stab-C3.mp3');
          longNote = sketch.loadSound('/audio/longnote-C3.mp3');
          windChime = sketch.loadSound('/audio/wooden-wind-chime-edit3a.mp3');
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
        // playlogic
        windChimeRate = sketch.map(lwData.windSpeed.value, lwData.windSpeed.min, lwData.windSpeed.max, 0.5, 1.4);
        windChimeVol = sketch.map(lwData.windSpeed.value, lwData.windSpeed.min, lwData.windSpeed.max, 0.1, 0.6);
        //--------------------------
        // Handle sounds / Start app
        // -------------------------
        if (audioSupported) {
          configureSounds();
          configureDisplay();
        } else {
          updateStatus('error', lwData.name, true);
        }
			};

      function updateBrass() {
        if (angle > 360) {
          angle = 0;
        }
        sinVal = sketch.sin(angle);
        cosVal = sketch.cos(angle);
        brassBaritone.pan(sinVal);
        brassBaritone2.pan(cosVal);
        if (sketch.frameCount % 350 === 0) {
          channel.publish('triggerBrassOne');
        }
        if (sketch.frameCount % 650 === 0) {
          channel.publish('triggerBrassTwo');
        }
        angle += 0.03;
      }

      function updateFilter() {
        if (freezingFilterFreq >= 5500) {
          freezingFilterFreq = 0;
        }
        freezingFilter.freq(freezingFilterFreq);
        freezingFilter.res(33);
        freezingFilterFreq++;
      }

      function updateHumidArp() {
        var _humidArpPhrase = humidArpPart.getPhrase('flttrBrass');
        if (sketch.frameCount % 1200 === 0 && sketch.frameCount !== 0) {
          if (humidArpPart.playingMelody) {
            humidArpPart.stop();
            humidArpPart.playingMelody = false;
            clemArpEnd(_humidArpPhrase.sequence);
            console.log('humidArpPart should have stopped');
          } else {
            humidArpPart.loop();
            humidArpPart.playingMelody = true;
            console.log('humidArpPart should be playing');
          }
        }
      }

      function updateRainArp() {
        if (sketch.frameCount % 1800 === 0 && sketch.frameCount !== 0) {
          if (rainArpPart.playingMelody) {
            rainArpPart.stop();
            rainArpPart.playingMelody = false;
            console.log('rainArpPart should have stopped');
          } else {
            rainArpPart.loop();
            rainArpPart.playingMelody = true;
            console.log('rainArpPart should be playing');
          }
        }
      }

			sketch.draw = function draw() {
        sketch.frameRate(30);
				sketch.background(0, 0, 0, 0);
        if (dialogIsOpen) {
          for (var i = 0; i < shapeSet.length; i++) {
            shapeSet[i].update(sketch, avSettings.noiseInc, avSettings.animAmount);
            shapeSet[i].paint(sketch, temperatureColour, avSettings.colourDim);
          }
        }
        //playlogic
        if (wCheck.isWindy) {
          updateBrass();
        }
        if (wCheck.isHumid) {
          updateHumidArp();
        }
        if (wCheck.isPrecip) {
          updateRainArp();
        }
        if (wCheck.isFreezing) {
          updateFilter();
        }
        //Master volume
        //Fade in on play
        sketch.masterVolume(masterGain);
        if (masterGain < 0.9) {
          masterGain += 0.01;
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

  channel.subscribe('stop', function(autoStart) {
    killCurrentSounds(autoStart);
    cdContainer.innerHTML = '';
  });

	return true;
};
