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
var coDisplayDataFn = require('./co-display-data');
var updateStatus = require('./update-status');
var weatherCheck = require('./weather-checker-fns');
var microU = require('../utilities/micro-utilities');
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
  var harpSoundTwo;
  //Percussion
  var cymbals;
  //clement / brass
  var harpSound;
  var humidArpPhrase;
  var humidArpPart;
  //long notes
  var longNotes;
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
  // dialog / modal
  var dialogIsOpen = false;
  // Visuals
  var temperatureColour = 0;
  // For audioContext support
  var pee5 = new P5();
  //Subscriptions
  var publishBrassOne;
  var publishBrassTwo;
  //Display data
  var coDisplayData = coDisplayDataFn();
  //DOM
  var cdContainer = document.querySelector('.conditions-display__list');

  function fadeInDisplayItem(thisDisplayItem) {
    var _opacity = 0;
    var _aniLoop = setInterval(function() {
      if (_opacity < 1) {
        thisDisplayItem.style.opacity = _opacity + '';
        _opacity += 0.05;
      } else {
        clearInterval(_aniLoop);
      }
    }, 50);
  }

  function fadeOutDisplayItem(thisDisplayItem, index, totalItems) {
    var _opacity = 1;
    var _aniLoop = setInterval(function() {
      if (_opacity > 0) {
        thisDisplayItem.style.opacity = _opacity + '';
        _opacity -= 0.05;
      } else {
        clearInterval(_aniLoop);
        //empty the cdContainer
        //when all are done
        if (index + 1 === totalItems) {
          cdContainer.innerHTML = '';
        }
      }
    }, 50);
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

  function fadeLongNotes() {
    for (var _longNote in longNotes) {
      if (longNotes.hasOwnProperty(_longNote)) {
        longNotes[_longNote].fade(0, avSettings.fadeTime);
        setTimeout(function(){
          longNotes[_longNote].stop();
        }, avSettings.fadeTime * 1000);
      }
    }
  }

  function killCurrentSounds(autoStart) {
      // Stop arrpeggios
      rainArpPart.stop(0);
      rainArpPart.removePhrase('rainDrops');
      rainArpPart.removePhrase('rainDropsLight');
      humidArpPart.stop(0);
      humidArpPart.removePhrase('flttrBrass');
      padSounds.forEach(fadeOutPadSounds);
      choralSounds.forEach(fadeChoralSounds);
      fadeLongNotes();
      brassBaritone.fade(0, avSettings.fadeTime);
      brassBaritone2.fade(0, avSettings.fadeTime);
      harpSoundTwo.fade(0, avSettings.fadeTime);
      windChime.fade(0, avSettings.fadeTime);
      bass.fade(0, avSettings.fadeTime);
      setTimeout(function(){
        brassBaritone.stop();
        brassBaritone2.stop();
        harpSoundTwo.stop();
        windChime.stop();
        bass.stop();
        cymbals.stop();
      }, avSettings.fadeTime * 1000);
      //Unsubs
      publishBrassOne.unsubscribe();
      publishBrassTwo.unsubscribe();
      isPlaying = false;
      console.log('autoStart', autoStart);
      channel.publish('allStopped', autoStart);
  }

  function makeHarpSound(time, playbackRate, volume) {
    harpSound.rate(playbackRate);
    harpSound.setVolume(0.15);
    harpSound.play(time, playbackRate, volume);
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

  function getLongNoteType(lwData) {
    var _longNoteType;
    //playlogic
    if (lwData.precipProbability.value > 0.5) {
      _longNoteType = 'harmonica';
    } else {
      _longNoteType = 'flute';
    }
    return _longNoteType;
  }

  function hasMajor(intervalString) {
    var _hasMajor = /Major/;
    return _hasMajor.test(intervalString);
  }

  function getNumPadNotes(wCheck, avSettings) {
    var _numPadNotes;
    //playlogic
    // We use a non western scale
    // and the guitar sound for windy and freezing
    // so only use 3 notes in a chord
    if (wCheck.isWindy && wCheck.isFreezing) {
      _numPadNotes = 3;
    } else if (wCheck.isFine) {
      _numPadNotes = 4;
    } else {
      _numPadNotes = avSettings.numPadNotes; //5
    }
    return _numPadNotes;
  }

  function getNumChords(lwData) {
    var _numChords;
    var _numExtraChords;
    //playlogic
    _numChords = Math.round(microU.mapRange(
      lwData.dewPoint.value,
      lwData.dewPoint.min,
      lwData.dewPoint.max,
      2,
      6
    ));
    _numExtraChords = Math.round(microU.mapRange(
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
      //TODO
      //Use another instrument here
      padType = 'organ';
    } else if (wCheck.isStormy) {
      //TODO watch out for clash between
      //guitar and brass
      //stormy plays less notes
      padType = 'guitar';
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
    if (wCheck.isClement && wCheck.isCold) {
      _chordType = 'octatonicMinorIntervals';
    } else if (wCheck.isFine) {
      _chordType = 'heptatonicMajorIntervals';
    } else if (wCheck.isCold) {
      _chordType = 'minorSeventhIntervals';
    } else if (wCheck.isStormy) {
      _chordType = 'heptatonicMinorIntervals';
    } else {
      _chordType = 'majorSeventhIntervals';
    }
    return _chordType;
  }

  function getChordSeqKey(wCheck, rootNoteHigh) {
    var _key;
    //playlogic
    // important!
    // may need to include isPrecip
    if (wCheck.isFine || wCheck.isFreezing || wCheck.isWindy) {
      _key = 'noChordOffset';
    } else if (wCheck.isClement) {
      if (rootNoteHigh) {
        _key = 'blissfulDownward';
      } else {
        _key = 'blissfulUpward';
      }
    } else {
      if (rootNoteHigh) {
        _key = 'melancholyDownward';
      } else {
        _key = 'melancholyUpward';
      }
    }
    console.log('chord seq type', _key);
    return _key;
  }

  //Inversions manager
  function getInversionOffsetKey(wCheck) {
    var _key;
    // playlogic
    // important!
    if (wCheck.isFine) {
      _key = 'inversionsDownward';
    } else if (wCheck.isWindy) {
      _key = 'inversionsMixed';
    } else if (wCheck.isFreezing) {
      _key = 'inversionsUpward';
    } else {
      _key = 'inversionsNoOffset';
    }
    console.log('inversion chords ', _key);
    return _key;
  }

  function getMainSeqRepeatNum(lwData, numChords) {
    // TODO consider rounding to the nearest
    // multiple of numChords
    //playlogic
    return Math.round(microU.mapRange(
      lwData.apparentTemperature.value,
      lwData.apparentTemperature.min,
      lwData.apparentTemperature.max,
      numChords * 6,
      numChords * 1
    ));
  }

  function getRootNote(lwData, numSemisPerOctave) {
    //Add global values to the main data object
    //Pressure determines root note. Range 2.5 octaves
    //In western scale it will be between + or - 18
    var _rangePlus = Math.round(numSemisPerOctave + numSemisPerOctave / 2);
    var _rangeMinus = -Math.abs(_rangePlus);
    //playlogic
    var _rootNote = Math.round(microU.mapRange(
      lwData.pressure.value,
      lwData.pressure.min,
      lwData.pressure.max,
      _rangeMinus,
      _rangePlus
    ));
    if (_rootNote === -0) {
      _rootNote = 0;
    }
    return _rootNote;
  }

  function getRootNoteLetter(numSemisPerOctave, rootNote) {
    var _rootNoteLetter = '';
    var _rootNoteNumber = rootNote + 1;
    if (numSemisPerOctave !== 12) {
      _rootNoteLetter = microU.getOrdinal(_rootNoteNumber) + ' note in a non western scale';
    } else {
      if (rootNote < 0) {
        _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[getFreqScales.CHROMATIC_SCALE.length - 1 + rootNote];
      } else {
        _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[rootNote];
      }
    }
    return _rootNoteLetter;
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

  function getLongNoteOffset(lwData) {
    return Math.round(microU.mapRange(
      lwData.visibility.value,
      lwData.visibility.min,
      lwData.visibility.max,
      3,
      0
    ));
  }

  function getPrecipCategory(lwData) {
    if (lwData.precipType === undefined) {
      return undefined;
    } else if (lwData.precipType === 'rain' && lwData.precipIntensity.value > 0.2) {
      return 'hard';
    } else if (lwData.precipType === 'sleet' || lwData.precipIntensity.value <= 0.2) {
      return 'soft';
    } else if (lwData.precipType === 'snow' || lwData.precipIntensity.value <= 0.1) {
      return 'light';
    }
  }

  function getPrecipArpBpm(lwData) {
    // playlogic
    return Math.round(microU.mapRange(
      lwData.precipIntensity.value,
      lwData.precipIntensity.min,
      lwData.precipIntensity.max,
      60,
      150
    ));
  }

  function getHumidArpBpm(lwData) {
    return Math.round(microU.mapRange(
      lwData.humidity.value,
      lwData.humidity.min,
      lwData.humidity.max,
      40,
      70
    ));
  }

  function getHumidArpIntervals(wCheck, chordType) {
    var _hIntervals;
    //playlogic
    if (wCheck.isWindy) {
      if (hasMajor(chordType)) {
        _hIntervals = 'closeMajorIntervals';
      } else {
        _hIntervals = 'closeMinorIntervals';
      }
    } else {
      if (hasMajor(chordType)) {
        _hIntervals = 'farMajorIntervals';
      } else {
        _hIntervals = 'farMinorIntervals';
      }
    }
    return _hIntervals;
  }

  function getMasterFilterFreq(lwData) {
    //Use math.abs for all pitch and volume values?
    // Set filter. Visibility is filter freq
    // playlogic
    return microU.mapRange(
      lwData.cloudCover.value,
      lwData.cloudCover.max,
      lwData.cloudCover.min,
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

  function getCymbalsRate(lwData) {
    return microU.mapRange(
      Math.round(lwData.nearestStormBearing.value),
      lwData.nearestStormBearing.min,
      lwData.nearestStormBearing.max,
      0.5,
      1.2
    );
  }

  function getCymbalsVolume(lwData) {
    return microU.mapRange(
      Math.round(lwData.nearestStormDistance.value),
      lwData.nearestStormDistance.min,
      lwData.nearestStormDistance.max,
      0.8,
      0
    );
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
    humidArpPhrase = new P5.Phrase('flttrBrass', makeHarpSound, flttrBrassPattern);
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
      isClement: weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value, lwData.humidity.value),
      isStormy: weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value)
    };
    console.log('wCheck', wCheck);
    //Get and set core values
    var numPadNotes = getNumPadNotes(wCheck, avSettings);
    var numChords = getNumChords(lwData).numChords;
    var numExtraChords = getNumChords(lwData, avSettings, wCheck).numExtraChords;
    var chordNumGreatest = numChords > numExtraChords ? numChords : numExtraChords;
    var numSemisPerOctave = getNumSemisPerOctave(avSettings, wCheck);
    var precipCategory = getPrecipCategory(lwData);
    var precipArpBpm = getPrecipArpBpm(lwData);
    var padType = getPadType(wCheck);
    var chordType = getChordType(wCheck);
    var inversionOffsetType = getInversionOffsetKey(wCheck);
    var humidArpBpm = getHumidArpBpm(lwData);
    var humidArpIntervals = getHumidArpIntervals(wCheck, chordType);
    var seqRepeatNum = getMainSeqRepeatNum(lwData, numChords);
    var rootNote = getRootNote(lwData, numSemisPerOctave);
    var rootNoteHigh = isRootNoteHigh(rootNote);
    var longNoteIndex = getLongNoteIndex(lwData, numPadNotes);
    var longNoteOffset = getLongNoteOffset(lwData);
    var longNoteType = getLongNoteType(lwData);
    var masterFilterFreq = getMasterFilterFreq(lwData);
    var chordSeqKey = getChordSeqKey(wCheck, rootNoteHigh);
    var cymbalsRate = getCymbalsRate(lwData);
    var cymbalsVolume = getCymbalsVolume(lwData);

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
              _newScaleArr.splice(_newScaleArr.length - 1, 0, 0, 0, 0);
            }
          } else if (i % 2 !== 0) {
            _newScaleArr.push(scaleArray[i]);
            if (includeFills) {
              _newScaleArr.splice(_newScaleArr.length - 1, 0, 0, 0, 0);
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

      function getAllegrettoRhythmType(humidArpScaleArray) {
        var _newNotesArray = [];
        //playlogic
        if (wCheck.isWindy) {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, true);
        } else {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, false);
        }
        return _newNotesArray;
      }

      function humidArpEnd(notesArray) {
        var _randomNote = sketch.random(notesArray);
        //Setup reverb
        harpSoundTwo.disconnect();
        reverb.process(harpSoundTwo, 4, 10);
        reverb.amp(1);
        harpSoundTwo.play();
        //TODO rate is wrong
        harpSoundTwo.rate(_randomNote * 3);
        harpSoundTwo.setVolume(1);
      }

      function playHumidArp(humidArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray = getAllegrettoRhythmType(humidArpScaleArray);
        humidArpPhrase.sequence = _newNotesArray;
        //Play Sequence
        humidArpPart.addPhrase(humidArpPhrase);
        humidArpPart.setBPM(humidArpBpm);
        humidArpPart.playingMelody = true;
        humidArpPart.loop();
        console.log('humidArpPart', humidArpPart);
      }

      function playRainArp(rainArpScaleArray) {
        //Overwrite sequence with new notes
        var _newNotesArray = addRandomStops(rainArpScaleArray).reverse();
        rainArpDropPhrase.sequence = _newNotesArray;
        rainArpDropLightPhrase.sequence = _newNotesArray;
        //Only use dropSound for rain
        if (precipCategory === 'hard') {
          rainArpPart.addPhrase(rainArpDropPhrase);
          //TODO add phrase for light as well as soft
        } else {
          rainArpPart.addPhrase(rainArpDropLightPhrase);
        }
        rainArpPart.setBPM(precipArpBpm);
        rainArpPart.playingMelody = true;
        rainArpPart.loop();
      }

      function playBrassBaritone(scale) {
        brassBaritone.rate(scale[brassOneScaleArrayIndex]);
        brassBaritone.setVolume(0.9);
        brassBaritone.play();
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
        brassBaritone2.rate(_newScaleArr[brassTwoScaleArrayIndex] * _randomRateMultVal);
        brassBaritone2.setVolume(0.4);
        brassBaritone2.play();
        if (brassTwoScaleArrayIndex >= scale.length -1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
      }

      function playLongNote(scale, extraSeqPlaying) {
        //playlogic
        var longNote = longNotes[longNoteType];
        longNote.disconnect();
        longNote.connect(soundFilter);
        //TODO could drop this now that
        //the octave is determined by lwData
        if (extraSeqPlaying) {
          longNote.rate(scale[longNoteIndex] / 2);
        } else {
          if (longNoteOffset) {
            longNote.rate(scale[longNoteIndex] / longNoteOffset);
          }
        }
        longNote.pan(sketch.random(panArr));
        longNote.setVolume(sketch.random([0.1, 0.20, 0.5]));
        longNote.playMode('restart');
        longNote.play();
      }

      function playBass(scale) {
        bass.rate(scale[0]);
        //TODO could set the volume
        //based on the amount of cloudCover
        bass.setVolume(0.5);
        bass.playMode('restart');
        bass.play();
        //Play 1st note of each chord
      }

      function setScaleSetIndex(scaleSet, numExtraChords) {
        if (scaleSetIndex >= scaleSet.length - 1 - numExtraChords) {
          scaleSetIndex = 0;
        } else {
          scaleSetIndex++;
        }
        return scaleSetIndex;
      }

      function playPad(scaleSet, padTypeKey) {
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
          padSounds[i][padTypeKey].disconnect();
          padSounds[i][padTypeKey].connect(soundFilter);
          padSounds[i][padTypeKey].rate(scaleSet[scaleSetIndex][i]);
          padSounds[i][padTypeKey].pan(panArr[_panIndex]);
          padSounds[i][padTypeKey].setVolume(avSettings[padTypeKey].volume);
          padSounds[i][padTypeKey].playMode('restart');
          padSounds[i][padTypeKey].play();
          padSounds[i][padTypeKey].onended(function() {
            padCallback(scaleSet, padTypeKey);
          });
          _panIndex = getPanIndex(_panIndex);
        }
        //playlogic
        //Avoid sound clash with Brass
        if (wCheck.isCloudy && !wCheck.isWindy) {
          playBass(scaleSet[scaleSetIndex]);
        }
        playLongNote(scaleSet[scaleSetIndex], extraSeqPlaying);
        //increment indices
        setScaleSetIndex(scaleSet, numExtraChords);
      }

      function padCallback(scaleSet, padTypeKey) {
        if (isPlaying) {
          padIndexCount++;
          // When all the sounds have played once, loop
          if (padIndexCount === padSounds.length) {
            playPad(scaleSet, padTypeKey);
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
            //console.log('weather is fine or freezing. playing choralSounds rate ', choralSound);
          });
        } else {
          //console.log('weather is not fine or freezing. No choralSounds');
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
        var _downFirst = false;
        if (_lowestNoteIndex > _highestNoteIndex) {
          _downFirst = true;
        }
        //console.log('creating array with ' + _totalOctaves + ' octaves ');
        var _allNotesScaleCentreNoteObj = getFreqScales.createEqTempMusicalScale(1, _totalOctaves, semisInOct, _downFirst);
        return {
          allNotesScale: _allNotesScaleCentreNoteObj.scale,
          centreNoteIndex: _allNotesScaleCentreNoteObj.centreFreqIndex,
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
      function errorCheckIntervalsArr(chosenIntervals, numNotes, semisInOct, repeatMultiple) {
        var _newIntervals;
        var _difference = numNotes - chosenIntervals.length;
        var _semitonesInOct;
        var _repeatMultiple = repeatMultiple || 0;
        //When using non western scale
        //ensure numbers don't balloon
        if (semisInOct > avSettings.numSemitones) {
          _semitonesInOct = 0;
        } else {
          _semitonesInOct = semisInOct;
        }
        //Error check
        if (_difference > 0) {
          _newIntervals = addMissingArrayItems(chosenIntervals, _difference, _semitonesInOct, _repeatMultiple);
          console.log('added missing items to', _newIntervals);
        } else {
          _newIntervals = chosenIntervals;
        }
        return _newIntervals;
      }

      function errorCheckScaleIntervals(scaleIntervals, intervalIndexOffset, numNotes) {
        var _scaleIntervals = [];
        var _highestIndex = intervalIndexOffset + numNotes;
        if (_highestIndex > scaleIntervals.length) {
          var _diff = _highestIndex - scaleIntervals.length;
          _scaleIntervals = addMissingArrayItems(scaleIntervals, _diff, null, null);
        } else {
          _scaleIntervals = scaleIntervals;
        }
        return _scaleIntervals;
      }

      function getPitchesFromIntervals(allNotesScale, scaleIntervals, centreNoteIndex, numNotes, intervalIndexOffset, type) {
        //console.log('type of instrument', type);
        var _scaleArray = [];
        var _intervalIndexOffset = intervalIndexOffset || 0;
        //add missing scale intervals
        var _scaleIntervals = errorCheckScaleIntervals(scaleIntervals, _intervalIndexOffset, numNotes);
        var _newNote;
        var _prevNote;
        for (var i = 0; i < numNotes; i++) {
          _newNote = allNotesScale[_scaleIntervals[_intervalIndexOffset] + centreNoteIndex];
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

      function createMusicalScale(numNotes, centreNoteOffset, key, intervalIndexOffset, repeatMultiple, type) {
        var _numOcts;
        var _allNotesScale = [];
        var _centreFreqIndex;
        var _scaleArray = [];
        var _rootAndOffset = rootNote + centreNoteOffset;
        var _scaleIntervals = errorCheckIntervalsArr(intervals[key], numNotes, numSemisPerOctave, repeatMultiple);
        var _largestPosNumber = getLargestPosNumInArr(_scaleIntervals);
        var _largestNegNumber = getLargestNegNumInArr(_scaleIntervals);
        //Once we know the total range required
        //get all the notes/frequencies
        var _allNotesNumOctsCentreFreq = getAllNotesScale(_largestPosNumber, _largestNegNumber, _rootAndOffset, numSemisPerOctave);
        _allNotesScale = _allNotesNumOctsCentreFreq.allNotesScale;
        _centreFreqIndex = _allNotesNumOctsCentreFreq.centreNoteIndex;
        _numOcts = _allNotesNumOctsCentreFreq.numOctaves;
        //Get centre note
        //After all notes scale has been created
        var _centreNoteIndex = _centreFreqIndex + _rootAndOffset;
        _scaleArray = getPitchesFromIntervals(_allNotesScale, _scaleIntervals, _centreNoteIndex, numNotes, intervalIndexOffset, type);
        return _scaleArray;
      }

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _diff;
        _chordOffsetArr = intervals[chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = addMissingArrayItems(_chordOffsetArr, _diff, null, null);
        }
        return _chordOffsetArr;
      }

      function getInversionOffsetArr(numChords) {
        var _chordInversionOffSetArr = intervals[inversionOffsetType];
        var _diff;
        if (numChords > _chordInversionOffSetArr.length) {
          _diff = numChords - _chordInversionOffSetArr.length;
          _chordInversionOffSetArr = addMissingArrayItems(_chordInversionOffSetArr, _diff, null, null);
        }
        return _chordInversionOffSetArr;
      }

      //If the key's not from a sequence
      //then get the generic chord type
      function getValidChordType(key) {
        var _chordType;
        if (key) {
          _chordType = key;
        } else {
          _chordType = chordType;
        }
        return _chordType;
      }

      function makeChordSequence(numChords, numExtraChords, numSemisPerOctave) {
        var _chordSeq = [];
        //Chord shift
        var _chordSeqOffsetArr = getChordSeqOffsetArr(chordNumGreatest);
        //Chord inversion shift
        var _inversionOffsetArr = getInversionOffsetArr(chordNumGreatest);
        //TODO for chord sequences with offset
        //we should use more harmonious chords
        //by getting different chord types
        if (chordNumGreatest > _chordSeqOffsetArr.length) {
          _chordSeqOffsetArr = addMissingArrayItems(_chordSeqOffsetArr, chordNumGreatest - _chordSeqOffsetArr.length, null, null);
        }
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(createMusicalScale(numPadNotes, _chordSeqOffsetArr[i].index, getValidChordType(_chordSeqOffsetArr[i].key), _inversionOffsetArr[i], 0, 'pad'));
        }
        //Adding extra chord(s) - pitched down
        for (var j = 0; j < numExtraChords; j++) {
          _chordSeq.push(createMusicalScale(numPadNotes, _chordSeqOffsetArr[j].index - numSemisPerOctave, getValidChordType(_chordSeqOffsetArr[j].key), _inversionOffsetArr[j], 0, 'padLower'));
        }
        return _chordSeq;
      }

      function setFilter() {
        soundFilter.freq(masterFilterFreq);
        soundFilter.res(20);
      }

      function createHumidArpScale(numSemisPerOctave) {
        var _repeatMultiple = 0;
        var _intervalIndexOffset = 0;
        var _hArpCNoteOffset = 0;
        //playlogic
        //TODO might double it for freezing
        //and offset it by an octave for fine
        if (wCheck.isFreezing) {
          //Bug?
          _hArpCNoteOffset = -Math.abs(numSemisPerOctave);
        }
        return createMusicalScale(avSettings.numCArpNotes, _hArpCNoteOffset, humidArpIntervals, _intervalIndexOffset, _repeatMultiple, 'humid arp');
      }

      function createRainArpScale(numSemisPerOctave) {
        var _rArpCNoteOffset = -Math.abs(numSemisPerOctave * 2);
        var _repeatMultiple = 1;
        var _intervalIndexOffset = 0;
        var _intervalType;
        if (hasMajor(chordType)) {
          _intervalType = 'safeNthMajorIntervals';
        } else {
          _intervalType = 'safeNthMinorIntervals';
        }
        _repeatMultiple = 2;
        //console.log('rain arp _intervalType', _intervalType);
        return createMusicalScale(avSettings.numRArpNotes, _rArpCNoteOffset, _intervalType, _intervalIndexOffset, _repeatMultiple, 'rain arp');
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
        if (wCheck.isHumid && !wCheck.isPrecip) {
          _humidArpScaleArray = createHumidArpScale(numSemisPerOctave);
        }
        playSounds(_organScaleSets, _rainArpScaleArray, _humidArpScaleArray);
			}

      function outputChordSeqType() {
        if (chordSeqKey === 'noChordOffset') {
          return 'Using inversions';
        } else {
          return microU.addSpacesToString(chordSeqKey);
        }
      }

      function outputPrecipArpType() {
        if (precipCategory === 'hard') {
          return 'forwards';
        } else {
          return 'backwards';
        }
      }

      function mapConditionsToDisplayData(rawCoDisplayData) {
        var _lwDataArr = Object.keys(lwData);
        var _wCheckArr = Object.keys(wCheck);
        var _coDisplayDataLw = rawCoDisplayData.map(function(coDisplayObj) {
          for (var i = 0; i < _lwDataArr.length; i++) {
            if (coDisplayObj.key === _lwDataArr[i]) {
              coDisplayObj.value = lwData[_lwDataArr[i]].value === undefined ? lwData[_lwDataArr[i]] : lwData[_lwDataArr[i]].value;
            }
          }
          return coDisplayObj;
        });
        //TODO not sure this does anthing
        var _coDisplayDataLwNeg = _coDisplayDataLw.map(function(coDisplayObj) {
          for (var i = 0; i < _lwDataArr.length; i++) {
            if (coDisplayObj.negativeKey === _lwDataArr[i]) {
              coDisplayObj.negativeValue = lwData[_lwDataArr[i]].value;
            }
          }
          return coDisplayObj;
        });
        var _coDisplayDataWCheck = _coDisplayDataLwNeg.map(function(coDisplayObj) {
          for (var i = 0; i < _wCheckArr.length; i++) {
            if (coDisplayObj.key === _wCheckArr[i]) {
              coDisplayObj.value = wCheck[_wCheckArr[i]];
            }
          }
          return coDisplayObj;
        });
        var _coDisplayDataWCheckNeg = _coDisplayDataWCheck.map(function(coDisplayObj) {
          for (var i = 0; i < _wCheckArr.length; i++) {
            if (coDisplayObj.negativeKey === _wCheckArr[i]) {
              coDisplayObj.negativeValue = wCheck[_wCheckArr[i]];
            }
          }
          return coDisplayObj;
        });
        return _coDisplayDataWCheckNeg;
      }

      function constrainDecimals(rawCoDisplayData) {
        return rawCoDisplayData.map(function(coProp) {
          if (typeof coProp.value === 'number' && coProp.constrain) {
            coProp.value = coProp.value.toFixed(2);
          }
          return coProp;
        });
      }

      function unitiseData(rawCoDisplayData) {
        return rawCoDisplayData.map(function(coProp) {
          if (coProp.key === 'temperature' || coProp.key === 'apparentTemperature') {
            coProp.value = frnhtToCelcius(coProp.value).toFixed(2);
            coProp.unit = 'C' + he.decode('&deg');
          }
          if (coProp.key === 'windBearing' || coProp.key === 'nearestStormBearing') {
            coProp.unit = he.decode('&deg');
          }
          if (coProp.key === 'cloudCover' || coProp.key === 'humidity') {
            coProp.unit = he.decode('&#37');
          }
          return coProp;
        });
      }

      function exceptionCheckData(rawCoDisplayData) {
        return rawCoDisplayData.map(function(coProp) {
          if (coProp.key === 'precipIntensity' && coProp.value === 0) {
            coProp.value = false;
          }
          return coProp;
        });
      }

      function setIconPath(rawCoDisplayData) {
        return rawCoDisplayData.map(function(coProp) {
          if (coProp.value) {
            //TODO add probability
            if(coProp.key === 'precipType' || coProp.key === 'precipIntensity') {
              coProp.iconPath = '/img/' + lwData.precipType + '-icon.svg';
            }
          }
          return coProp;
        });
      }

      function addPrimaryMusicValues(rawCoDisplayData) {
        return rawCoDisplayData.map(function(coProp) {
            switch (coProp.key) {
              case 'dewPoint':
                coProp.musicValue = numChords;
                break;
              case 'ozone':
                coProp.musicValue = numExtraChords;
                break;
              case 'pressure':
                coProp.musicValue = getRootNoteLetter(numSemisPerOctave, rootNote);
                break;
              case 'cloudCover':
                coProp.musicValue = Math.round(masterFilterFreq);
                break;
              case 'apparentTemperature':
                coProp.musicValue = Math.round(seqRepeatNum / numChords);
                break;
              case 'windSpeed':
                coProp.musicValue = windChimeRate.toFixed(2);
                break;
              case 'windBearing':
                coProp.musicValue = microU.getOrdinal(longNoteIndex);
                break;
              case 'temperature':
                coProp.musicValue = numSemisPerOctave;
                break;
              case 'visibility':
                coProp.musicValue = longNoteOffset;
                break;
              case 'precipIntensity':
                coProp.musicValue = precipArpBpm;
                break;
              case 'precipType':
                coProp.value = !coProp.value ? false : precipCategory + ' ' + coProp.value;
                coProp.musicValue = outputPrecipArpType();
                break;
              case 'precipProbability':
                coProp.musicValue = longNoteType;
                break;
              case 'nearestStormBearing':
                coProp.musicValue = cymbalsRate.toFixed(2);
                break;
              case 'nearestStormDistance':
                coProp.musicValue = cymbalsVolume.toFixed(2);
                break;
              case 'windSpeedHigh':
                coProp.musicValue = humidArpBpm;
                break;
              case 'isWindyArp':
                coProp.musicValue = humidArpIntervals;
                break;
            }
          return coProp;
        });
      }

      function isvalidConditionTrue(displayDataGroup) {
          var _anyValidPropTrue = false;
          for (var i = 0; i < displayDataGroup.length; i++) {
            if (displayDataGroup[i].key !== 'isOther' && displayDataGroup[i].value) {
              return true;
            }
          }
          return _anyValidPropTrue;
      }

      function addOtherMusicValues(displayDataGroup, musicValue) {
        var _validConditionTrue = isvalidConditionTrue(displayDataGroup);
        return displayDataGroup.map(function(displayProp) {
          var _musicValue;
          //if any other value is true
          if (displayProp.key === 'isOther' && _validConditionTrue) {
            displayProp.value = false;
          }
          //Add spaces where necessary
          if (typeof musicValue === 'string') {
            _musicValue = microU.removeStr('inversions', musicValue);
            displayProp.musicValue = microU.addSpacesToString(_musicValue);
          } else {
            displayProp.musicValue = musicValue;
          }
          return displayProp;
        });
      }

      function manageHumidityArpDisplay(displayDataGroup) {
        return displayDataGroup.map(function(displayProp) {
          if (wCheck.isHumid) {
            displayProp.value = false;
          }
          return displayProp;
        });
      }

      function configureDisplay() {
        var _finalCoData = [];
        var _currArr;
        for (var coDataGroup in coDisplayData) {
          if (coDisplayData.hasOwnProperty(coDataGroup)) {
            var _mappedDisplayData = mapConditionsToDisplayData(coDisplayData[coDataGroup]);
            var _unitisedDisplayData = unitiseData(_mappedDisplayData);
            var _exceptionCheckedData = exceptionCheckData(_unitisedDisplayData);
            var _iconisedData = setIconPath(_exceptionCheckedData);
            var _constrainedDisplayData = constrainDecimals(_iconisedData);
            switch (coDataGroup) {
              case 'primaryMap':
                _currArr = addPrimaryMusicValues(_constrainedDisplayData);
                break;
              case 'chordTypeMap':
                _currArr = addOtherMusicValues(_constrainedDisplayData, chordType);
                break;
              case 'chordSeqTypeMap':
                _currArr = addOtherMusicValues(_constrainedDisplayData, outputChordSeqType());
                break;
              case 'padTypeMap':
                _currArr = addOtherMusicValues(_constrainedDisplayData, padType);
                break;
              case 'inversionMap':
                _currArr = addOtherMusicValues(_constrainedDisplayData, inversionOffsetType);
                break;
              case 'numNotesMap':
                _currArr = addOtherMusicValues(_constrainedDisplayData, numPadNotes);
                break;
              case 'humidArpMap':
                _currArr = manageHumidityArpDisplay(_constrainedDisplayData, humidArpBpm);
                console.log('humidArpMap _currArr', _currArr);
                break;
            }
            _finalCoData.push.apply(_finalCoData, _currArr);
          }
        }
        //console.log('_finalCoData', _finalCoData);
        _finalCoData.forEach(function(coProp) {
          //Only show true or valid values
          //Zero is valid for most conditions
          if (coProp.value !== undefined && coProp.value !== false) {
            //filter out negative values that are true
            //or don't exist
            if (coProp.negativeValue === undefined || coProp.negativeValue === false) {
              var _itemTmpl = appTemplate(coProp);
              cdContainer.insertAdjacentHTML('beforeend', _itemTmpl);
              var _lastItem = cdContainer.lastElementChild;
              fadeInDisplayItem(_lastItem);
            }
          } else {
            //console.log('Not displayed because not defined or false ', coProp);
          }
        });
      }

			//Sound constructor
			function PadSound(organ, guitar, sax, trumpet) {
				this.organ = organ;
				this.guitar = guitar;
				this.saxophone = sax;
				this.trumpet = trumpet;
			}

      function LongNotes(harmonica, flute) {
        this.harmonica = harmonica;
        this.flute = flute;
      }

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
        if (audioSupported) {
          //Pad sounds for various weather types
          for (var i = 0; i < numPadNotes; i++) {
            padSounds.push(new PadSound(
              sketch.loadSound('/audio/organ-C2.mp3'),
              sketch.loadSound('/audio/guitar-C2.mp3'),
              sketch.loadSound('/audio/sax-C2.mp3'),
              sketch.loadSound('/audio/trumpet-C2.mp3')
            ));
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
          harpSound = sketch.loadSound('/audio/harp-C3.mp3');
          harpSoundTwo = sketch.loadSound('/audio/harp-C3.mp3');
          longNotes = new LongNotes(
            sketch.loadSound('/audio/harmonica-C3.mp3'),
            sketch.loadSound('/audio/flute-C3.mp3')
          );
          windChime = sketch.loadSound('/audio/wooden-wind-chime-edit3a.mp3');
          cymbals = sketch.loadSound('/audio/cymbals.mp3');
        }
			};

			sketch.setup = function setup() {
				sketch.frameRate(25);
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

      function updateCymbals() {
        if (sketch.frameCount % 1000 === 0 && sketch.frameCount !== 0) {
          cymbals.play();
          cymbals.setVolume(cymbalsVolume);
          cymbals.rate(cymbalsRate);
        }
      }

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
        //TODO is this the right part?
        var _humidArpPhrase = humidArpPart.getPhrase('flttrBrass');
        if (sketch.frameCount % 1200 === 0 && sketch.frameCount !== 0) {
          if (humidArpPart.playingMelody) {
            humidArpPart.stop();
            humidArpPart.playingMelody = false;
            humidArpEnd(_humidArpPhrase.sequence);
            console.log('humidArpPart should have stopped');
          } else {
            humidArpPart.setBPM(humidArpBpm);
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
        //playlogic
        if (wCheck.isCloudy || wCheck.isWindy) {
          updateCymbals();
        }
        if (wCheck.isWindy) {
          updateBrass();
        }
        if (wCheck.isPrecip) {
          updateRainArp();
        }
        if (wCheck.isHumid && !wCheck.isPrecip) {
          updateHumidArp();
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

		});
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
    var _allDisplayItems = document.querySelectorAll('.conditions-display__item');
    for (var i = 0; i < _allDisplayItems.length; i++) {
      fadeOutDisplayItem(_allDisplayItems[i], i, _allDisplayItems.length);
    }
    killCurrentSounds(autoStart);
  });

	return true;
};
