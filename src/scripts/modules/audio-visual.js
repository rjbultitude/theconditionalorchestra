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
var work = require('webworkify');
//custom
var coDisplayData = require('./co-display-data');
var weatherCheck = require('./weather-checker-fns');
var microU = require('../utilities/micro-utilities');
var intervals = require('../utilities/intervals');
var getFreqScales = require('../utilities/create-freq-scales');
var duplicateArray = require('../utilities/duplicate-array-vals');
var getLargestPosNumInArr = require('../utilities/largest-pos-num-in-array');
var getLargestNegNumInArr = require('../utilities/largest-neg-num-in-array');
var addMissingArrayItems = require('../utilities/add-missing-array-items');
var avSettings = require('../settings/av-settings');
var makeFibSequence = require('../utilities/fib-sequence');
var coFns = require('./co-display-fns');

module.exports = function() {
  /*
    Module scoped vars
    and constants
  */
  var isPlaying = false;
  var maxMasterVolSet = false;
  //rate
  var appFrameRate = 30;
  var sequenceStart = true;
  var rootNoteRate;
  //bass
  var bass;
  var bass2;
  //Windy/ Brass
  var brassBaritone;
  var brassBaritone2;
  //Percussion
  var chineseCymbal;
  var timpani;
  var rideCymbal;
  var djembe;
  var djembeVolArr = [0.45, 0.8, 0.2, 0.65];
  //clement / brass
  var harpSound;
  //long notes
  var longNote;
  //precipitation / drops
  var dropSound;
  //Lead sounds
  var rhodes;
  //Globals
  var soundFilter;
  var freezingFilter;
  var reverb;
  //pan
  var angle = 0;
  var sinVal = 0;
  var cosVal = 0;
  var panArr = [-0.8, 0, 0.8];
  //Sound objects
  var padSounds = [];
  var choralSounds = [];
  var synchedSoundsChords = [];
  //Lead
  var leadBarComplete = false;
  var leadSoundIndex = 0;
  //Subscriptions
  var publishBrassOne;
  var publishBrassTwo;
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

  function fadeOutDisplayItems(thisDisplayItem, index, totalItems, doneFn,
    autoStart) {
    var _opacity = 1;
    var _aniLoop = setInterval(function() {
      if (_opacity > 0) {
        thisDisplayItem.style.opacity = _opacity + '';
        _opacity -= 0.05;
      } else {
        clearInterval(_aniLoop);
        //when all are done
        if (index + 1 === totalItems) {
          //Run the callback
          doneFn(autoStart);
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
    soundItem.fade(0, avSettings.fadeTime);
    stopPadSounds(soundItem);
  }

  function fadeChoralSounds(soundItem) {
    soundItem.fade(0, avSettings.fadeTime);
    setTimeout(function() {
      soundItem.stop();
    }, avSettings.fadeTime * 1000);
  }

  function killCurrentSounds(autoStart) {
    //Fades
    brassBaritone.fade(0, avSettings.fadeTime);
    brassBaritone2.fade(0, avSettings.fadeTime);
    bass.fade(0, avSettings.fadeTime);
    bass2.fade(0, avSettings.fadeTime);
    chineseCymbal.fade(0, avSettings.fadeTime);
    choralSounds.forEach(fadeChoralSounds);
    djembe.fade(0, avSettings.fadeTime);
    dropSound.fade(0, avSettings.fadeTime);
    harpSound.fade(0, avSettings.fadeTime);
    longNote.fade(0, avSettings.fadeTime);
    padSounds.forEach(fadeOutPadSounds);
    rhodes.fade(0, avSettings.fadeTime);
    rideCymbal.fade(0, avSettings.fadeTime);
    timpani.fade(0, avSettings.fadeTime);
    //Stop after fades
    setTimeout(function() {
      brassBaritone.stop();
      brassBaritone2.stop();
      bass.stop();
      bass2.stop();
      chineseCymbal.stop();
      djembe.stop();
      harpSound.stop();
      dropSound.stop();
      longNote.stop();
      rhodes.stop();
      rideCymbal.stop();
      timpani.stop();
    }, avSettings.fadeTime * 1000);
    //Unsubs
    publishBrassOne.unsubscribe();
    publishBrassTwo.unsubscribe();
    isPlaying = false;
    channel.publish('allStopped', autoStart);
  }

  function getLongNoteType(wCheck) {
    var _longNoteType;
    //playlogic
    // TODO This errs towards the flute
    if (wCheck.isMuggy || wCheck.isOminous) {
      _longNoteType = 'harmonica';
    } else if (wCheck.isSirocco) {
      //Very rare
      _longNoteType = 'shiney';
    } else if (wCheck.isCrisp) {
      _longNoteType = 'string';
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
    // and the guitar sound for stormy
    // so only use 3 notes in a chord
    if (wCheck.isBitter || wCheck.isStormy) {
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
    //TODO needs to be tested for realism
    //Is it possible to have a max dew point
    //and a max ozone level?
    //playlogic
    _numChords = Math.round(microU.mapRange(
      lwData.dewPoint.value,
      lwData.dewPoint.min,
      lwData.dewPoint.max,
      avSettings.numChordsMin,
      avSettings.numChordsMax
    ));
    _numExtraChords = Math.round(microU.mapRange(
      lwData.ozone.value,
      lwData.ozone.min,
      lwData.ozone.max,
      2,
      Math.round(avSettings.numChordsMax * 2)
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
    if (wCheck.isBitter) { //organ
      _numSemitones = avSettings.numSemitones * 2; //24
      console.log('non western: ', _numSemitones);
    } else if (wCheck.isViolentStorm) { //guitar
      _numSemitones = avSettings.numSemitones * 1.5; //18
      console.log('non western: ', _numSemitones);
    } else {
      _numSemitones = avSettings.numSemitones; //12
    }
    return Math.round(_numSemitones);
  }

  //TODO return early
  function getPadType(wCheck) {
    var padType = '';
    //playlogic
    //Start with harshest conditions
    //and work our way up

    //isBitter generates a non western scale
    //organ is used so as not to use a sound
    //that might clash with the brass barritone
    //when conditions are windy
    if (wCheck.isBitter) {
      padType = 'organ';
    } else if (wCheck.isStormy) {
      padType = 'guitar';
    } else if (wCheck.isCold) {
      padType = 'saxophone';
    } else if (wCheck.isMild) {
      padType = 'vocal';
    } else if (wCheck.isSmoggy) {
      padType = 'homeswinger';
    } else if (wCheck.isFine) {
      padType = 'aeroflute';
    } else {
      padType = 'harmonium'; //was horn
    }
    return padType;
  }

  //TODO return early
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

  // Quieten the pad when the harp plays
  function getPadVolume(wCheck, sCheck, padType) {
    if (sCheck.harpCanPlay && wCheck.isMild) {
      return avSettings[padType].volume / 3;
    } else {
      return avSettings[padType].volume;
    }
  }

  function isRootNoteGrtrMedian(rootNote, rootNoteRange) {
    var _totalRange = Math.abs(rootNoteRange.rangeMinus) + rootNoteRange.rangePlus;
    var _rootNoteMedian = Math.round(_totalRange / 2);
    return rootNote + _rootNoteMedian >= _rootNoteMedian;
  }

  //TODO return early
  function getChordSeqKey(wCheck, rootNoteGrtrMedian) {
    var _key;
    //playlogic
    if (wCheck.isFine || wCheck.isFreezing || wCheck.isWindy) {
      //Inversions
      _key = 'noChordOffset';
    } else if (wCheck.isClement) {
      if (rootNoteGrtrMedian) {
        _key = 'blissfulDownward';
      } else {
        _key = 'blissfulUpward';
      }
    } else if (wCheck.isPrecip || wCheck.isCloudy) {
      if (rootNoteGrtrMedian) {
        _key = 'melancholyDownward';
      } else {
        _key = 'melancholyUpward';
      }
    } else {
      _key = 'purposefulUpAndDown';
    }
    return _key;
  }

  //Inversions manager
  //TODO return early
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
      //No inversions
      _key = 'inversionsNoOffset';
    }
    return _key;
  }

  function getSeqRepeatMaxMult(numChords) {
    //If the number of chords is high
    //lower the multiplier
    var _mean = Math.round((avSettings.numChordsMin + avSettings.numChordsMax) /
      2);
    var _diff = avSettings.numChordsMax - _mean;
    if (numChords > _mean) {
      return avSettings.mainSeqRepeatMax - _diff;
    } else {
      return avSettings.mainSeqRepeatMax;
    }
  }

  function getMainSeqRepeatNum(lwData, numChords) {
    var _upperMult = getSeqRepeatMaxMult(numChords);
    //playlogic
    return Math.round(microU.mapRange(
      lwData.apparentTemperature.value,
      lwData.apparentTemperature.min,
      lwData.apparentTemperature.max,
      numChords * _upperMult,
      numChords * 1
    ));
  }

  function getRootNoteRange(numSemisPerOctave) {
    //In western scale it will be between + 6 or - 12
    return {
      rangePlus: Math.round(numSemisPerOctave / 2),
      rangeMinus: -Math.abs(numSemisPerOctave)
    };
  }

  function getRootNote(lwData, rootNoteRange) {
    //Pressure determines root note
    //playlogic
    var _rootNote = Math.round(microU.mapRange(
      lwData.pressure.value,
      lwData.pressure.min,
      lwData.pressure.max,
      rootNoteRange.rangeMinus,
      rootNoteRange.rangePlus
    ));
    if (_rootNote === -0) {
      _rootNote = 0;
    }
    return _rootNote;
  }

  function getLongNoteIndex(lwData, numPadNotes) {
    var _longNoteIndex = 0;
    var _timesToDivide = numPadNotes;
    var _bearingSlice = 360 / _timesToDivide;
    //playlogic
    //bearing decides which note in scale to play
    //Could use reduce
    for (var i = 0; i < _timesToDivide; i++) {
      var _mult = i + 1;
      var _currentBearingSlice = _bearingSlice * _mult;
      if (lwData.windBearing.value <= _currentBearingSlice) {
        _longNoteIndex = i;
        break;
      } else {
        _longNoteIndex = _timesToDivide - 1;
      }
    }
    return _longNoteIndex;
  }

  function isLongNoteHigh(rootNoteHigh, longNoteIndex, numPadNotes) {
    return rootNoteHigh && longNoteIndex + 1 >= Math.round(numPadNotes / 2);
  }

  function getLongNoteVolArr(wCheck) {
    if (wCheck.isVisbilityPoor) {
      return [0.425, 0.575, 0.825];
    } else {
      return [0.225, 0.375, 0.7125];
    }
  }

  function getExtraChordsOffset(rootNoteGrtrMedian, numSemisPerOctave) {
    if (rootNoteGrtrMedian) {
      return numSemisPerOctave;
    } else {
      return 5;
    }
  }

  function getReverbLength(lwData) {
    return Math.round(microU.mapRange(
      lwData.visibility.value,
      lwData.visibility.min,
      lwData.visibility.max,
      9,
      2
    ));
  }

  function getReverbDecay(lwData) {
    return Math.round(microU.mapRange(
      lwData.visibility.value,
      lwData.visibility.min,
      lwData.visibility.max,
      50,
      10
    ));
  }

  function getBrassVolume(lwData) {
    return microU.mapRange(
      lwData.windSpeed.value,
      lwData.windSpeed.min,
      lwData.windSpeed.max,
      0.6,
      1
    );
  }

  function getBrassBpm(lwData) {
    return Math.round(microU.mapRange(
      lwData.windSpeed.value,
      lwData.windSpeed.min,
      lwData.windSpeed.max,
      6,
      12
    ));
  }

  function getLeadSoundVolume(wCheck) {
    var _leadVolume;
    if (wCheck.isSublime) {
      _leadVolume = 0.6;
    } else {
      _leadVolume = 0.3;
    }
    return _leadVolume;
  }

  function getPrecipCategory(lwData) {
    if (lwData.precipType === 'rain') {
      return 'hard';
    } else if (lwData.precipType === 'sleet') {
      return 'soft';
    } else {
      return 'light'; //'snow' or undefined
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
      60,
      120
    ));
  }

  //TODO return early
  function getHumidArpIntervals(lwData, chordType) {
    var _hIntervals;
    //playlogic
    if (lwData.pressure.value > 1000) {
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
    console.log('_hIntervals', _hIntervals);
    return _hIntervals;
  }

  function getMasterFilterFreq(lwData) {
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

  function getRideCymbalRate(lwData) {
    return microU.mapRange(
      Math.round(lwData.nearestStormBearing.value),
      lwData.nearestStormBearing.min,
      lwData.nearestStormBearing.max,
      0.5,
      1.2
    );
  }

  function getRideCymbalsBpm(lwData) {
    return microU.mapRange(
      Math.round(lwData.precipProbability.value),
      lwData.precipProbability.min,
      lwData.precipProbability.max,
      40,
      78
    );
  }

  function getRideCymbalMaxVolume(lwData) {
    return microU.mapRange(
      Math.round(lwData.nearestStormDistance.value),
      lwData.nearestStormDistance.min,
      lwData.nearestStormDistance.max,
      0.9,
      0.3
    );
  }

  function getRideCymbalVolumeArr(rideCymbalMaxVolume) {
    var _rideCymbalVolumeArr = [];
    var _min = 0.1;
    for (var i = 0; i < 6; i++) {
      _rideCymbalVolumeArr.push(Math.random() * (rideCymbalMaxVolume - _min) + _min);
    }
    return _rideCymbalVolumeArr;
  }

  function getNoteLengthMult(lwData, avSettings) {
    return Math.round(microU.mapRange(
      lwData.temperature.value,
      lwData.temperature.min,
      lwData.temperature.max,
      avSettings.noteLengthMultMin,
      avSettings.noteLengthMultMax
    ));
  }

  //The higher the temperature
  //the bigger the gaps
  function getNoteLengths(appFrameRate, minMultiplier) {
    var _noteLengths = [];
    for (var i = 0; i < 3; i++) {
      var _multiplierAmt = minMultiplier + i;
      _noteLengths.push(_multiplierAmt * appFrameRate);
    }
    console.log('_noteLengths', _noteLengths);
    return _noteLengths;
  }

  //The higher the temperature
  //the bigger the gaps
  function getLeadNoteLengthStart(appFrameRate, lwData) {
    return Math.round(microU.mapRange(
      lwData.temperature.value,
      lwData.temperature.min,
      lwData.temperature.max,
      appFrameRate / 3,
      appFrameRate / 9
    ));
  }

  function getHarpVolArr(wCheck, sCheck) {
    if (sCheck.harpCanPlay && wCheck.isMild) {
      return [0.6, 0.8, 1];
    } else {
      return [0.45, 0.625, 0.8];
    }
  }

  function getHarpCanPlay(wCheck) {
    return wCheck.isHumid && !wCheck.isPrecip && !wCheck.isFine && !wCheck.isWindy;
  }

  function getTimpaniCanPlay(wCheck) {
    return wCheck.isArid || wCheck.isCrisp;
  }

  function getChoralCanPlay(wCheck) {
    return wCheck.isFine || wCheck.isFreezing;
  }

  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    freezingFilter = new P5.HighPass();
    reverb = new P5.Reverb();
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
    var chordIndex = 0;
    var padIndexCount = 0;
    var fibIndex = 0;
    var panIndex = 0;
    var humidArpScales = [];
    var humidArpReady = false;
    var humidArpScaleIndex = 0;
    var hArpSeqIndex = 0;
    var padReady = false;
    var leadSoundReady = false;
    var precipArpScales = [];
    var precipArpReady = false;
    var precipArpScaleIndex = 0;
    var pArpSeqIndex = 0;
    var freezingFilterFreq = 2000;
    var masterGain = 0;
    //clear data
    padSounds = [];
    choralSounds = [];
    // grouped weather booleans
    var wCheck = {
      //single concept items
      isPrecip: weatherCheck.isPrecip(lwData.precipType, lwData.precipIntensity.value),
      isWindy: weatherCheck.isWindy(lwData.windSpeed.value),
      isCloudy: weatherCheck.isCloudy(lwData.cloudCover.value),
      isVisbilityPoor: weatherCheck.isVisbilityPoor(lwData.visibility.value),
      //Humidity
      isHumid: weatherCheck.isHumid(lwData.humidity.value),
      isMuggy: weatherCheck.isMuggy(lwData.humidity.value, lwData.temperature.value),
      isSmoggy: weatherCheck.isSmoggy(lwData.humidity.value, lwData.apparentTemperature.value, lwData.cloudCover.value, lwData.visibility.value),
      isArid: weatherCheck.isArid(lwData.humidity.value, lwData.temperature.value),
      isCrisp: weatherCheck.isCrisp(lwData.humidity.value, lwData.temperature.value),
      isSirocco: weatherCheck.isSirocco(lwData.humidity.value, lwData.temperature.value, lwData.windSpeed.value),
      //temperature
      isCold: weatherCheck.isCold(lwData.temperature.value),
      isFreezing: weatherCheck.isFreezing(lwData.temperature.value),
      //broad conditions
      isMild: weatherCheck.isMild(lwData.temperature.value, lwData.windSpeed.value),
      isFine: weatherCheck.isFine(lwData.cloudCover.value, lwData.windSpeed.value, lwData.temperature.value),
      isSublime: weatherCheck.isSublime(lwData.cloudCover.value, lwData.windSpeed.value, lwData.temperature.value),
      isClement: weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value),
      isBitter: weatherCheck.isBitter(lwData.temperature.value, lwData.windSpeed.value),
      isStormy: weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value),
      isViolentStorm: weatherCheck.isViolentStorm(lwData.cloudCover.value,lwData.windSpeed.value, lwData.precipIntensity.value),
      isOminous: weatherCheck.isOminous(lwData.cloudCover.value, lwData.nearestStormDistance.value, lwData.precipProbability.value)
    };
    console.log('wCheck', wCheck);
    // grouped sound booleans
    // Only require these three as
    // all other sounds rely on just one condition
    var sCheck = {
      harpCanPlay : getHarpCanPlay(wCheck),
      timpaniCanPlay : getTimpaniCanPlay(wCheck),
      choralCanPlay : getChoralCanPlay(wCheck)
    };
    //Get and set core values
    var numPadNotes = getNumPadNotes(wCheck, avSettings);
    var numChords = getNumChords(lwData).numChords;
    var numExtraChords = getNumChords(lwData, avSettings, wCheck).numExtraChords;
    var chordNumGreatest = numChords > numExtraChords ? numChords : numExtraChords;
    var numSemisPerOctave = getNumSemisPerOctave(avSettings, wCheck);
    //Precipitation
    var precipCategory = getPrecipCategory(lwData);
    var precipArpBpm = getPrecipArpBpm(lwData);
    var precipArpBps = precipArpBpm / 60;
    var precipArpStepTime = Math.round(appFrameRate / precipArpBps);
    var leadVolume = getLeadSoundVolume(wCheck);
    var padType = getPadType(wCheck);
    var padVolume = getPadVolume(wCheck, sCheck, padType);
    var chordType = getChordType(wCheck);
    var inversionOffsetType = getInversionOffsetKey(wCheck);
    //Humidity
    var humidArpBpm = getHumidArpBpm(lwData);
    var humidArpBps = humidArpBpm / 60;
    var humidArpStepTime = Math.round(appFrameRate / humidArpBps);
    var humidArpIntervalsKey = getHumidArpIntervals(lwData, chordType);
    var harpVolArr = getHarpVolArr(wCheck, sCheck);
    console.log('harpVolArr', harpVolArr);
    var seqRepeatNum = getMainSeqRepeatNum(lwData, numChords);
    //Root note
    var rootNoteRange = getRootNoteRange(numSemisPerOctave);
    var rootNote = getRootNote(lwData, rootNoteRange);
    var rootNoteHigh = isRootNoteHigh(rootNote);
    var longNoteIndex = getLongNoteIndex(lwData, numPadNotes);
    var longNoteHigh = isLongNoteHigh(rootNoteHigh, longNoteIndex, numPadNotes);
    var longNoteVolArr = getLongNoteVolArr(wCheck);
    var reverbLength = getReverbLength(lwData);
    var reverbDecay = getReverbDecay(lwData);
    var longNoteType = getLongNoteType(wCheck);
    var masterFilterFreq = getMasterFilterFreq(lwData);
    var rootNoteGrtrMedian = isRootNoteGrtrMedian(rootNote, rootNoteRange);
    console.log('rootNoteGrtrMedian', rootNoteGrtrMedian);
    var extraSeqOffset = getExtraChordsOffset(rootNoteGrtrMedian, numSemisPerOctave);
    console.log('extraSeqOffset', extraSeqOffset);
    var invExtraSeqOffset = numSemisPerOctave - extraSeqOffset;
    console.log('invExtraSeqOffset', invExtraSeqOffset);
    var chordSeqKey = getChordSeqKey(wCheck, rootNoteGrtrMedian);
    var brassBaritoneVol = getBrassVolume(lwData);
    var brassBaritoneBpm = getBrassBpm(lwData);
    var brassBaritoneBps = brassBaritoneBpm / 60;
    var brassBaritoneStepTime = Math.round(appFrameRate / brassBaritoneBps);
    var brassBaritone2StepTime = brassBaritoneStepTime * 2 + 57;
    var rideCymbalRate = getRideCymbalRate(lwData);
    var rideCymbalBpm = getRideCymbalsBpm(lwData);
    var rideCymbalBps = rideCymbalBpm / 60;
    var rideCymbalStepTime = Math.round(appFrameRate / rideCymbalBps);
    var rideCymbalMaxVolume = getRideCymbalMaxVolume(lwData);
    var rideCymbalVolumeArr = getRideCymbalVolumeArr(rideCymbalMaxVolume);
    var noteLengthMult = getNoteLengthMult(lwData, avSettings);
    var noteLengths = getNoteLengths(appFrameRate, noteLengthMult);
    var leadNoteLengthStart = getLeadNoteLengthStart(appFrameRate, lwData);
    var leadNoteLengths = makeFibSequence(leadNoteLengthStart, numPadNotes * 2);
    //Set initial note lengths for use in draw
    var currNoteLength = noteLengths[0];
    var currLeadLength = leadNoteLengths[0];

    //Create p5 sketch
    var myP5 = new P5(function(sketch) {

      channel.subscribe('allStopped', function() {
        sketch.noLoop();
      });

      function addRandomStops(notesArray) {
        //duplicate notes
        var _newNotesArray = duplicateArray(notesArray, 2);
        var _randomStopCount = _newNotesArray.length / 2;
        var _randomIndex;
        //Add stops
        for (var i = 0; i < _randomStopCount; i++) {
          _randomIndex = sketch.random(0, _newNotesArray.length);
          _newNotesArray.splice(_randomIndex, 0, 0);
        }
        return _newNotesArray;
      }

      function getAllegrettoRhythm(scaleArray, includeFills) {
        var _newScaleArr = [];
        for (var i = 0, length = scaleArray.length; i < length; i++) {
          if (i % 2 === 0) {
            _newScaleArr.push(scaleArray[i]);
            _newScaleArr.push(0);
            _newScaleArr.push(scaleArray[i]);
            if (!includeFills) {
              _newScaleArr.push(scaleArray[i]);
            }
            if (includeFills) {
              _newScaleArr.splice(_newScaleArr.length - 1, 0, 0);
            }
          } else if (i % 2 !== 0) {
            _newScaleArr.push(scaleArray[i]);
            if (includeFills) {
              _newScaleArr.splice(_newScaleArr.length - 1, 0, 0);
              _newScaleArr.push(scaleArray[i]);
            }
          }
        }
        return _newScaleArr;
      }

      function updatePanIndex() {
        if (panIndex < panArr.length - 1) {
          panIndex++;
        } else {
          panIndex = 0;
        }
      }

      function getAllegrettoRhythmType(humidArpScaleArray) {
        var _newNotesArray = [];
        // playlogic
        // humard arpeggio doesn't play if
        // it's fine, raining or windy
        if (wCheck.isClement) {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, true);
        } else {
          _newNotesArray = getAllegrettoRhythm(humidArpScaleArray, false);
        }
        return _newNotesArray;
      }

      function prepareHumidArp(hScalesNoRests) {
        //Overwrite empty array with sequences
        //that include rests
        humidArpScales = hScalesNoRests.map(function(hArpScale) {
          return getAllegrettoRhythmType(hArpScale);
        });
        console.log('humidArpScales', humidArpScales);
        humidArpReady = true;
      }

      function preparePrecipArp(precipArpScaleNoRests) {
        //Overwrite sequence with new notes
        precipArpScales = precipArpScaleNoRests.map(function(pArpScale) {
          return addRandomStops(pArpScale).reverse();
        });
        console.log('precipArpScales', precipArpScales);
        precipArpReady = true;
      }

      function playBrassBaritone(scale) {
        brassBaritone.play();
        brassBaritone.setVolume(brassBaritoneVol);
        brassBaritone.rate(scale[brassOneScaleArrayIndex]);
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
        brassBaritone2.setVolume(0.4);
        brassBaritone2.rate(_newScaleArr[brassTwoScaleArrayIndex] * _randomRateMultVal);
        if (brassTwoScaleArrayIndex >= scale.length - 1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
      }

      function playLongNote() {
        //playlogic
        var _longNoteRate = synchedSoundsChords[chordIndex][longNoteIndex];
        var _longNoteVol;
        // playlogic
        // If weather is hot, dry and clear
        // play the longNote very quietly
        if (wCheck.isSublime) {
          _longNoteVol = longNoteVolArr[0];
        } else {
          _longNoteVol = sketch.random(longNoteVolArr);
        }
        // Lower by one octave
        // if the lower chords are playing
        if (extraSeqPlaying || longNoteHigh) {
          _longNoteRate = _longNoteRate / 2;
        }
        // Play the wet signal alone
        // if visibility is less than 8 miles /
        // if the reverb is long
        if (wCheck.isVisbilityPoor) {
          longNote.disconnect();
        }
        longNote.connect(reverb);
        longNote.playMode('restart');
        longNote.play();
        longNote.pan(sketch.random(panArr));
        longNote.setVolume(_longNoteVol);
        longNote.rate(_longNoteRate);
      }

      function bassCallback(bassRate) {
        bass2.playMode('restart');
        bass2.play();
        bass2.setVolume(0.5);
        bass2.rate(bassRate * 2);
      }

      function playBass() {
        //Play 1st note of each chord
        var _bassRate = synchedSoundsChords[chordIndex][0];
        bass.playMode('restart');
        bass.play();
        bass.setVolume(1);
        bass.rate(_bassRate);
        //playlogic
        if (wCheck.isClement) {
          bass.onended(function() {
            bassCallback(_bassRate);
          });
        }
      }

      function setChordIndex() {
        if (chordIndex >= synchedSoundsChords.length - 1 - numExtraChords) {
          chordIndex = 0;
        } else {
          chordIndex++;
        }
        return chordIndex;
      }

      function padCallBack() {
        if (isPlaying) {
          padIndexCount++;
          // When all the sounds have played once, loop
          if (padIndexCount === padSounds.length) {
            playSynchedSounds(true);
            padIndexCount = 0;
          }
        }
      }

      function updateNoteLength() {
        //If the lower chords are playing halve the time
        currNoteLength = extraSeqPlaying ? sketch.random(noteLengths) * 2 :
          sketch.random(noteLengths);
        //Start the call of the updateNoteLength fn again
        padReady = true;
      }

      //Set amount of time each lead note
      //plays using fibonacci sequence
      function updateLeadSoundLength() {
        currLeadLength = leadNoteLengths[fibIndex];
        if (fibIndex === leadNoteLengths.length - 1) {
          fibIndex = 0;
        } else {
          fibIndex++;
        }
        leadSoundReady = true;
      }

      function updateLeadSoundIndex() {
        if (leadSoundIndex === numPadNotes - 1) {
          leadSoundIndex = 0;
          leadBarComplete = true;
        } else {
          leadSoundIndex++;
          leadBarComplete = false;
        }
      }

      function playPad(playFullNotes) {
        for (var i = 0, length = padSounds.length; i < length; i++) {
          padSounds[i].disconnect();
          padSounds[i].connect(soundFilter);
          padSounds[i].pan(panArr[panIndex]);
          padSounds[i].playMode('restart');
          padSounds[i].play();
          padSounds[i].setVolume(padVolume);
          padSounds[i].rate(synchedSoundsChords[chordIndex][i]);
          //If we want to play the play full note length
          //use the onended callback
          if (playFullNotes) {
            padSounds[i].onended(function() {
              padCallBack();
            });
          }
          updatePanIndex();
        }
      }

      function playSynchedSounds(playFullNotes) {
        // Master sequence
        if (mainSeqCount === seqRepeatNum && numExtraChords > 0) {
          //If we've played the whole sequence
          //seqRepeatNum number of times
          //play the first chord of extraChords
          chordIndex = synchedSoundsChords.length - numExtraChords +
            extraSeqCount;
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
        //Play the pad chord
        //and pass in the playback mode
        playPad(playFullNotes);
        //playlogic
        //Avoid sound clash with Brass
        if (wCheck.isCloudy && !wCheck.isWindy) {
          playBass();
        }
        playLongNote();
        //increment indices
        setChordIndex();
        //Start the lead over
        leadBarComplete = false;
      }

      function playChoralSound(scaleArray) {
        // playlogic
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
          console.log('choral sounds rate', scaleArray[i]);
        });
      }

      /**
       * playSounds Handles playback logic
       * Though some of this is delegated
       * @param  {Array} synchedSoundsChords    sets of notes to play
       * @param  {Array} precipArpScaleArray a set of notes fot the sequencer to play
       * @param  {Array} humidArpScaleArray a set of notes fot the sequencer to play
       * @return {boolean}               default value
       */
      function playSounds(pArpScalesNoRests, hScalesNoRests) {
        // playlogic
        // Only the first chord is passed in
        if (sCheck.choralCanPlay) {
          playChoralSound(synchedSoundsChords[0]);
        }
        //Play the lead if the weather is fine
        if (wCheck.isFine) {
          leadSoundReady = true;
        }
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBaritone(synchedSoundsChords[chordIndex]);
          }
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          //playlogic
          if (wCheck.isWindy) {
            playBrassBaritoneTwo(synchedSoundsChords[chordIndex]);
          }
        });
        //Pads, long note and bass
        //playlogic
        //Play full length of notes
        if (wCheck.isClement) {
          playSynchedSounds(true);
          padReady = false;
        } else {
          //Play the pad sounds
          //using the draw loop
          padReady = true;
        }
        //Humid arpeggio
        if (hScalesNoRests.length > 0) {
          prepareHumidArp(hScalesNoRests);
        }
        //Precipitation arpeggio
        if (pArpScalesNoRests.length > 0) {
          preparePrecipArp(pArpScalesNoRests);
        }
        //Tell rest of app we're playing
        isPlaying = true;
        channel.publish('playing', lwData.name);
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
      function getAllNotesScale(largestNumber, smallestNumber,
        rootAndOffset, semisInOct) {
        var _highestNoteIndex = largestNumber + Math.abs(rootAndOffset);
        var _lowestNoteIndex = Math.abs(smallestNumber) + Math.abs(
          rootAndOffset);
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
        var _allNotesScaleCentreNoteObj = getFreqScales.createEqTempMusicalScale(
          1, _totalOctaves, semisInOct, _downFirst);
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
      function errorCheckIntervalsArr(chosenIntervals, numNotes,
        amountToAdd, repeatMultiple, type) {
        var _newIntervals;
        var _difference = numNotes - chosenIntervals.length;
        var _amountToAdd;
        var _repeatMultiple = repeatMultiple || 0;
        //When using non western scale
        //ensure numbers don't balloon
        if (amountToAdd > avSettings.numSemitones) {
          _amountToAdd = 0;
        } else {
          _amountToAdd = amountToAdd;
        }
        //Error check
        if (_difference > 0) {
          _newIntervals = addMissingArrayItems(chosenIntervals,
            _difference, _amountToAdd, _repeatMultiple);
          console.log('added missing items to ' + type, _newIntervals);
        } else {
          _newIntervals = chosenIntervals;
        }
        return _newIntervals;
      }

      function errorCheckScaleIntervals(scaleIntervals,
        intervalIndexOffset, numNotes) {
        var _scaleIntervals = [];
        var _highestIndex = intervalIndexOffset + numNotes;
        if (_highestIndex > scaleIntervals.length) {
          var _diff = _highestIndex - scaleIntervals.length;
          _scaleIntervals = addMissingArrayItems(scaleIntervals, _diff,
            null, null);
        } else {
          _scaleIntervals = scaleIntervals;
        }
        return _scaleIntervals;
      }

      function getPitchesFromIntervals(allNotesScale, scaleIntervals,
        centreNoteIndex, numNotes, intervalIndexOffset) {
        var _scaleArray = [];
        var _intervalIndexOffset = intervalIndexOffset || 0;
        //add missing scale intervals
        var _scaleIntervals = errorCheckScaleIntervals(scaleIntervals,
          _intervalIndexOffset, numNotes);
        var _newNote;
        for (var i = 0; i < numNotes; i++) {
          _newNote = allNotesScale[_scaleIntervals[_intervalIndexOffset] +
            centreNoteIndex];
          //error check
          if (_newNote !== undefined || isNaN(_newNote) === false) {
            _scaleArray.push(_newNote);
          } else {
            console.error('undefined or NaN note');
          }
          _intervalIndexOffset++;
        }
        return _scaleArray;
      }

      //Accepts only an object
      function createMusicalScale(msConfig) {
        //Error check
        if (typeof msConfig !== 'object') {
          console.error('Musical Scale Config must be an object');
          return;
        }
        //Set vars
        var _numOcts;
        var _allNotesScale = [];
        var _centreFreqIndex;
        var _scaleArray = [];
        var _rootAndOffset = rootNote + msConfig.startNote;
        var _scaleIntervals = errorCheckIntervalsArr(
          intervals[msConfig.chordKey],
          msConfig.numNotes,
          msConfig.amountToAdd,
          msConfig.repeatMultiple,
          msConfig.type
        );
        var _largestPosNumber = getLargestPosNumInArr(_scaleIntervals);
        var _largestNegNumber = getLargestNegNumInArr(_scaleIntervals);
        //Once we know the total range required
        //get all the notes/frequencies
        var _allNotesNumOctsCentreFreq = getAllNotesScale(
          _largestPosNumber,
          _largestNegNumber,
          _rootAndOffset,
          numSemisPerOctave
        );
        _allNotesScale = _allNotesNumOctsCentreFreq.allNotesScale;
        _centreFreqIndex = _allNotesNumOctsCentreFreq.centreNoteIndex;
        _numOcts = _allNotesNumOctsCentreFreq.numOctaves;
        //Get centre note
        //After all notes scale has been created
        var _centreNoteIndex = _centreFreqIndex + _rootAndOffset;
        _scaleArray = getPitchesFromIntervals(
          _allNotesScale,
          _scaleIntervals,
          _centreNoteIndex,
          msConfig.numNotes,
          msConfig.inversionStartNote,
          msConfig.type
        );
        return _scaleArray;
      }

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _diff;
        _chordOffsetArr = intervals[chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = addMissingArrayItems(_chordOffsetArr, _diff,
            null, null);
        }
        return _chordOffsetArr;
      }

      function getInversionOffsetArr(numChords) {
        var _chordInversionOffSetArr = intervals[inversionOffsetType];
        var _diff;
        if (numChords > _chordInversionOffSetArr.length) {
          _diff = numChords - _chordInversionOffSetArr.length;
          _chordInversionOffSetArr = addMissingArrayItems(
            _chordInversionOffSetArr, _diff, null, null);
        }
        return _chordInversionOffSetArr;
      }

      // If the key's not from a sequence
      // i.e. it's an inversion
      // then get the generic chord type
      function getValidChordType(key) {
        var _chordType;
        if (key) {
          _chordType = key;
        } else {
          _chordType = chordType;
        }
        return _chordType;
      }

      function makeChordSequence() {
        var _chordSeq = [];
        //Chord shift
        var _chordSeqOffsetArr = getChordSeqOffsetArr(chordNumGreatest);
        //Chord inversion shift
        var _inversionOffsetArr = getInversionOffsetArr(chordNumGreatest);
        //Handle array lengths
        if (chordNumGreatest > _chordSeqOffsetArr.length) {
          _chordSeqOffsetArr = addMissingArrayItems(_chordSeqOffsetArr,
            chordNumGreatest - _chordSeqOffsetArr.length, null, null);
        }
        //Create primary chords
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(createMusicalScale({
            numNotes: numPadNotes,
            startNote: _chordSeqOffsetArr[i].index,
            chordKey: getValidChordType(_chordSeqOffsetArr[i].key),
            inversionStartNote: _inversionOffsetArr[i],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad'
          }));
        }
        //Adding extra chord(s)
        for (var j = 0; j < numExtraChords; j++) {
          _chordSeq.push(createMusicalScale({
            numNotes: numPadNotes,
            startNote: _chordSeqOffsetArr[j].index - extraSeqOffset,
            chordKey: getValidChordType(_chordSeqOffsetArr[j].key),
            inversionStartNote: _inversionOffsetArr[j],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad extra'
          }));
        }
        return _chordSeq;
      }

      function setFilter() {
        soundFilter.freq(masterFilterFreq);
        soundFilter.res(20);
      }

      function setReverb() {
        reverb.set(reverbLength, reverbDecay);
        reverb.amp(1);
      }

      function createHumidArpScales() {
        var _intervalIndexOffset = 0;
        var _hArpCNoteOffset = 0;
        var _hArpScalesNoRests = [];
        //var _numHumidArpNotes = avSettings.numHumidArpNotes;
        var _numHumidArpNotes = intervals[humidArpIntervalsKey].length;
        var _mainHArpScale = createMusicalScale({
          numNotes: _numHumidArpNotes,
          startNote: _hArpCNoteOffset,
          chordKey: humidArpIntervalsKey,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp'
        });
        var _extraHArpScale = createMusicalScale({
          numNotes: _numHumidArpNotes,
          startNote: _hArpCNoteOffset + invExtraSeqOffset,
          chordKey: humidArpIntervalsKey,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp'
        });
        _hArpScalesNoRests.push(_mainHArpScale, _extraHArpScale);
        return _hArpScalesNoRests;
      }

      function createPrecipArpScales() {
        var _pArpCNoteOffset = -Math.abs(numSemisPerOctave * 2);
        var _repeatMultiple = 1;
        var _intervalIndexOffset = 0;
        var _intervalType;
        var _pArpScalesNoRests = [];
        if (hasMajor(chordType)) {
          _intervalType = 'safeNthMajorIntervals';
        } else {
          _intervalType = 'safeNthMinorIntervals';
        }
        _repeatMultiple = 2;
        var _mainPArpScale = createMusicalScale({
          numNotes: avSettings.numPrecipArpNotes,
          startNote: _pArpCNoteOffset,
          chordKey: _intervalType,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp'
        });
        var _extraPArpScale = createMusicalScale({
          numNotes: avSettings.numPrecipArpNotes,
          startNote: _pArpCNoteOffset + invExtraSeqOffset,
          chordKey: _intervalType,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp'
        });
        _pArpScalesNoRests.push(_mainPArpScale, _extraPArpScale);
        return _pArpScalesNoRests;
      }

      /*
      	Create necessary scales
       */
      function configureSounds() {
        var _pArpScalesNoRests = [];
        var _hArpScalesNoRests = [];
        //Make arrays of frequencies for playback
        synchedSoundsChords = makeChordSequence();
        // Set filter for pad sounds
        setFilter();
        setReverb();
        //Set the root note rate
        //for use elsewhere in program
        rootNoteRate = synchedSoundsChords[chordIndex][0];
        //playlogic
        if (wCheck.isPrecip) {
          _pArpScalesNoRests = createPrecipArpScales();
        }
        //Humid arpeggio will not play if
        //other lead sounds are playing
        if (sCheck.harpCanPlay) {
          _hArpScalesNoRests = createHumidArpScales();
        }
        //Explicitly passing these arrays as args
        //For clarity
        playSounds(_pArpScalesNoRests, _hArpScalesNoRests);
      }

      function formatCoStrings(displayData) {
        return displayData.map(function(displayProp) {
          var _musicValueLowerCase;
          var _musicValue;
          //Add spaces where necessary
          if (typeof displayProp.musicValue === 'string') {
            _musicValue = microU.addSpacesToString(displayProp.musicValue);
            _musicValueLowerCase = microU.strToLowerCase(_musicValue);
            displayProp.musicValue = microU.removeStrFromStart('inversions', _musicValueLowerCase);
          }
          return displayProp;
        });
      }

      function buildDisplay(coDisplayData) {
        //Format strings and numbers
        var _formattedCoData = formatCoStrings(coDisplayData);
        //TODO perf - should use for loop for speed?
        _formattedCoData.forEach(function(coDisplayObj) {
          //Only show true or valid values
          //Zero is valid for most conditions
          if (coDisplayObj.value !== undefined && coDisplayObj.value !==
            false) {
            //filter out negative values that are true
            //or don't exist
            if (coDisplayObj.negativeValue === undefined || coDisplayObj.negativeValue === false) {
              var _itemTmpl = appTemplate(coDisplayObj);
              cdContainer.insertAdjacentHTML('beforeend', _itemTmpl);
              var _lastItem = cdContainer.lastElementChild;
              fadeInDisplayItem(_lastItem);
            }
          } else {
            //console.log('Not displayed because not defined or false ', coProp);
          }
        });
      }

      //TODO Should all the app vars
      //be in an object?
      function getDisplayDataVals() {
        return {
          numChords: numChords,
          numExtraChords: numExtraChords,
          numSemisPerOctave: numSemisPerOctave,
          rootNote: rootNote,
          noteLengthMult: noteLengthMult,
          masterFilterFreq: masterFilterFreq,
          seqRepeatNum: seqRepeatNum,
          longNoteIndex: longNoteIndex,
          reverbLength: reverbLength,
          precipArpBpm: precipArpBpm,
          precipCategory: precipCategory,
          rideCymbalBpm: rideCymbalBpm,
          rideCymbalRate: rideCymbalRate,
          rideCymbalMaxVolume: rideCymbalMaxVolume,
          humidArpBpm: humidArpBpm,
          humidArpIntervalsKey: humidArpIntervalsKey,
          chordType: chordType,
          chordSeqKey: chordSeqKey,
          padType: padType,
          longNoteType: longNoteType,
          inversionOffsetType: inversionOffsetType,
          numPadNotes: numPadNotes
        };
      }

      //Only used if web worker is not available
      function configureDisplay(musicDisplayVals) {
        //Set the data vals using
        //module scoped data
        var _setCoDisplayGroupVals = coFns(
          coDisplayData,
          lwData,
          wCheck,
          musicDisplayVals
        );
        var _finalCoData = _setCoDisplayGroupVals();
        buildDisplay(_finalCoData);
      }

      function configureAudioVisual() {
        var _musicDisplayVals = getDisplayDataVals();
        //Create a thread to set
        //values for display
        if (window.Worker) {
          var displayWorker = work(require('./display-worker.js'));
          displayWorker.addEventListener('message', function(result) {
            buildDisplay(result.data);
            displayWorker.terminate();
          });
          displayWorker.onerror = function(e) {
            console.log('Error with web worker on ' + 'Line #' + e.lineno +
              ' - ' + e.message + ' in ' + e.filename);
            configureDisplay(_musicDisplayVals);
          };
          displayWorker.postMessage({
            coDisplayData: coDisplayData,
            lwData: lwData,
            wCheck: wCheck,
            musicDisplayVals: _musicDisplayVals
          });
        }
        //Or just work it out in main thread
        else {
          configureDisplay(_musicDisplayVals);
        }
        //While other thread runs
        //configure Sounds
        configureSounds();
      }

      //P5 PRELOAD FN - 1
      sketch.preload = function() {
        //loadSound called during preload
        //will be ready to play in time for setup
        //Pad sounds for various weather types
        for (var i = 0; i < numPadNotes; i++) {
          padSounds.push(sketch.loadSound('/audio/' + padType +
            '-C2.mp3'));
        }
        //Long note accompanies pad
        longNote = sketch.loadSound('/audio/' + longNoteType +
          '-C3.mp3');
        dropSound = sketch.loadSound('/audio/drop-' + precipCategory +
          '.mp3');
        //choral sounds for fine/freezing weather
        for (var j = 0; j < 2; j++) {
          choralSounds.push(sketch.loadSound('/audio/choral.mp3'));
        }
        //TODO only load these if conditions are so
        bass = sketch.loadSound('/audio/bass.mp3');
        bass2 = sketch.loadSound('/audio/bass.mp3');
        brassBaritone = sketch.loadSound('/audio/brass-baritone.mp3');
        brassBaritone2 = sketch.loadSound('/audio/brass-baritone.mp3');
        harpSound = sketch.loadSound('/audio/harp-C3.mp3');
        chineseCymbal = sketch.loadSound('/audio/chinese-cymbal.mp3');
        timpani = sketch.loadSound('/audio/timpani.mp3');
        djembe = sketch.loadSound('/audio/djembe.mp3');
        rhodes = sketch.loadSound('/audio/rhodes.mp3');
        rideCymbal = sketch.loadSound('/audio/ride-cymbal.mp3');
      };

      //P5 SETUP FN - 2
      sketch.setup = function setup() {
        sketch.frameRate(appFrameRate);
        //--------------------------
        // Handle sounds / Start app
        // -------------------------
        configureAudioVisual();
      };

      function updateMasterVol() {
        sketch.masterVolume(masterGain);
        if (masterGain < 0.9) {
          masterGain += 0.01;
        } else {
          maxMasterVolSet = true;
        }
      }

      function updateSynchedSounds() {
        if (sketch.frameCount === 1 || sketch.frameCount % currNoteLength ===
          0) {
          playSynchedSounds(false);
          //Temporarily stop the call of this fn
          //while we set a new note length
          padReady = false;
          updateNoteLength();
        }
      }

      function updateLeadSound() {
        if (sketch.frameCount === 1 || sketch.frameCount % currLeadLength ===
          0) {
          //get the note
          var _leadSoundRate = synchedSoundsChords[chordIndex][
            leadSoundIndex
          ];
          leadSoundReady = false;
          //If we want to stop the lead
          //after each play of the notes in chord
          //if (!leadBarComplete) {
          rhodes.play();
          rhodes.setVolume(leadVolume);
          rhodes.rate(_leadSoundRate);
          //rhodes.pan(0.6);
          updateLeadSoundIndex();
          //}
          updateLeadSoundLength();
        }
      }

      function updateChinaCymbal() {
        if (sketch.frameCount % 1000 === 0 && sketch.frameCount !== 0) {
          chineseCymbal.play();
          chineseCymbal.setVolume(0.5);
          chineseCymbal.rate(rootNoteRate);
        }
      }

      function updateTimpani() {
        if (sketch.frameCount % 1000 === 0 && sketch.frameCount !== 0) {
          timpani.play();
          timpani.setVolume(0.5);
          timpani.rate(rootNoteRate);
        }
      }

      function updateRideCymbal() {
        if (sketch.frameCount % rideCymbalStepTime === 0) {
          var _rideVol = sketch.random(rideCymbalVolumeArr);
          rideCymbal.play();
          rideCymbal.setVolume(_rideVol);
          rideCymbal.rate(rideCymbalRate);
        }
      }

      function updateDjembe() {
        if (sketch.frameCount % rideCymbalStepTime === 0) {
          var _djembeVol = sketch.random(djembeVolArr);
          djembe.play();
          djembe.setVolume(_djembeVol);
          djembe.rate(1);
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
        if (sketch.frameCount % brassBaritoneStepTime === 0) {
          channel.publish('triggerBrassOne');
        }
        if (sketch.frameCount % brassBaritone2StepTime === 0) {
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
        if (sketch.frameCount % humidArpStepTime === 0) {
          var _harpVol = sketch.random(harpVolArr);
          //Handle extra seq
          if (extraSeqPlaying) {
            console.log('extraSeqPlaying', extraSeqPlaying);
            hArpSeqIndex = 1;
          } else {
            hArpSeqIndex = 0;
          }
          //Loop
          if (humidArpScaleIndex >= humidArpScales[hArpSeqIndex].length) {
            humidArpScaleIndex = 0;
          }
          harpSound.play();
          harpSound.setVolume(_harpVol);
          harpSound.rate(humidArpScales[hArpSeqIndex][humidArpScaleIndex]);
          humidArpScaleIndex++;
        }
      }

      function updatePrecipArp() {
        if (sketch.frameCount % precipArpStepTime === 0) {
          // Handle extra seq
          if (extraSeqPlaying) {
            console.log('extraSeqPlaying', extraSeqPlaying);
            pArpSeqIndex = 1;
          } else {
            pArpSeqIndex = 0;
          }
          // loop
          if (precipArpScaleIndex >= precipArpScales[pArpSeqIndex].length) {
            precipArpScaleIndex = 0;
          }
          dropSound.play();
          dropSound.setVolume(avSettings.dropSoundVol[precipCategory]);
          dropSound.rate(precipArpScales[pArpSeqIndex][precipArpScaleIndex]);
          precipArpScaleIndex++;
        }
      }

      //P5 DRAW LOOP - 3
      sketch.draw = function draw() {
        if (!sequenceStart) {
          updateRideCymbal();
        }
        if (padReady) {
          updateSynchedSounds();
        }
        if (leadSoundReady) {
          updateLeadSound();
        }
        //playlogic
        if (wCheck.isOminous) {
          updateChinaCymbal();
          if (!sequenceStart) {
            updateDjembe();
          }
        }
        if (sCheck.timpaniCanPlay) {
          updateTimpani();
        }
        if (wCheck.isWindy) {
          updateBrass();
        }
        if (wCheck.isPrecip) {
          if (precipArpReady && sequenceStart) {
            updatePrecipArp();
          }
        }
        if (sCheck.harpCanPlay) {
          if (humidArpReady && sequenceStart) {
            updateHumidArp();
          }
        }
        if (wCheck.isFreezing) {
          updateFilter();
        }
        //sequencer counter
        if (sketch.frameCount % 2000 === 0 && sequenceStart === false) {
          sequenceStart = true;
          console.log('sequenceStart', sequenceStart);
        } else if (sketch.frameCount % 2000 === 0 && sequenceStart === true) {
          sequenceStart = false;
          console.log('sequenceStart', sequenceStart);
        }
        //Master volume
        //Fade in on play
        if (!maxMasterVolSet) {
          updateMasterVol();
        }
      };
    });
    return myP5;
  }

  channel.subscribe('userUpdate', function(data) {
    createP5SoundObjs();
    init(data);
  });

  function clearAndStopWhenDone(autoStart) {
    cdContainer.innerHTML = '';
    killCurrentSounds(autoStart);
  }

  channel.subscribe('stop', function(autoStart) {
    var _allDisplayItems = document.querySelectorAll(
      '.conditions-display__item');
    for (var i = 0, length = _allDisplayItems.length; i < length; i++) {
      fadeOutDisplayItems(_allDisplayItems[i], i, _allDisplayItems.length,
        clearAndStopWhenDone, autoStart);
    }
  });

  return true;
};
