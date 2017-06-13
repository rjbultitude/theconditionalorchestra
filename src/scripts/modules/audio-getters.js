'use strict';

var microU = require('../utilities/micro-utilities');

module.exports = (function() {

  // utilities
  // doesn't need exporting
  function hasMajor(intervalString) {
    var _hasMajor = /Major/;
    return _hasMajor.test(intervalString);
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

  function getNumChords(lwData, avSettings) {
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

  function getPadType(wCheck) {
    var padType = '';
    // playlogic
    // Start with harshest conditions
    // and work our way up

    // isBitter generates a non western scale
    // organ is used so as not to use a sound
    // that might clash with the brass barritone
    // when conditions are windy
    if (wCheck.isBitter) {
      padType = 'organ';
    } else if (wCheck.isStormy) {
      padType = 'guitar';
    } else if (wCheck.isSmoggy) {
      padType = 'zither';
    } else if (wCheck.isFine) {
      padType = 'aeroflute';
    } else if (wCheck.isMild) {
      padType = 'vocal';
    } else if (wCheck.isCold) {
      padType = 'saxophone';
    } else {
      padType = 'harmonium';
    }
    console.log('padType', padType);
    return padType;
  }

  // Only applies to inversions
  function getChordType(wCheck) {
    // Inversions are Fine | freezing | windy
    var _chordType;
    //playlogic
    if (wCheck.isClement && wCheck.isCold) {
      _chordType = 'heptatonicMinorIntervals';
    } else if (wCheck.isFine) {
      _chordType = 'heptatonicMajorIntervals';
    } else if (wCheck.isCold) {
      _chordType = 'minorSeventhIntervals';
    } else if (wCheck.isStormy) {
      _chordType = 'octatonicMinorIntervals';
    } else {
      _chordType = 'majorSeventhIntervals';
    }
    return _chordType;
  }

  // Quieten the pad when the harp plays
  function getPadVolume(wCheck, sCheck, padType, avSettings) {
    if(wCheck.isFoggy) {
      return avSettings[padType].volume / 6;
    } else if (sCheck.harpCanPlay && wCheck.isMild) {
      return avSettings[padType].volume / 2;
    } else {
      return avSettings[padType].volume;
    }
  }

  function isRootNoteGrtrMedian(rootNote, rootNoteRange) {
    var _totalRange = Math.abs(rootNoteRange.rangeMinus) + rootNoteRange.rangePlus;
    var _rootNoteMedian = Math.round(_totalRange / 2);
    return rootNote + _rootNoteMedian >= _rootNoteMedian;
  }

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

  function getSeqRepeatMaxMult(numChords, avSettings) {
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

  function getMainSeqRepeatNum(lwData, numChords, upperMult) {
    //playlogic
    return Math.round(microU.mapRange(
      lwData.apparentTemperature.value,
      lwData.apparentTemperature.min,
      lwData.apparentTemperature.max,
      numChords * upperMult,
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
    // playlogic
    // bearing decides which note in scale to play
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
      return [0.75, 0.875, 1];
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
    // Max length 10 seconds
    return Math.round(microU.mapRange(
      lwData.visibility.value,
      lwData.visibility.min,
      lwData.visibility.max,
      10,
      2
    ));
  }

  function getReverbDecay(lwData) {
    // Max decay 100
    return Math.round(microU.mapRange(
      lwData.visibility.value,
      lwData.visibility.min,
      lwData.visibility.max,
      100,
      30
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
      _leadVolume = 0.8;
    } else {
      _leadVolume = 0.55;
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

  function getPrecipArpIntervalType(chordType) {
    if (hasMajor(chordType)) {
      return 'safeNthMajorIntervals';
    } else {
      return 'safeNthMinorIntervals';
    }
  }

  function getMasterFilterFreq(lwData, avSettings) {
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

  return {
    getLongNoteType: getLongNoteType,
    getNumPadNotes: getNumPadNotes,
    getNumChords: getNumChords,
    getNumSemisPerOctave: getNumSemisPerOctave,
    getPadType: getPadType,
    getChordType: getChordType,
    getPadVolume: getPadVolume,
    isRootNoteGrtrMedian: isRootNoteGrtrMedian,
    getChordSeqKey: getChordSeqKey,
    getInversionOffsetKey: getInversionOffsetKey,
    getSeqRepeatMaxMult: getSeqRepeatMaxMult,
    getMainSeqRepeatNum: getMainSeqRepeatNum,
    getRootNoteRange: getRootNoteRange,
    getRootNote: getRootNote,
    getLongNoteIndex: getLongNoteIndex,
    isLongNoteHigh: isLongNoteHigh,
    getLongNoteVolArr: getLongNoteVolArr,
    getExtraChordsOffset: getExtraChordsOffset,
    getReverbLength: getReverbLength,
    getReverbDecay: getReverbDecay,
    getBrassVolume: getBrassVolume,
    getBrassBpm: getBrassBpm,
    getLeadSoundVolume: getLeadSoundVolume,
    getPrecipCategory: getPrecipCategory,
    getPrecipArpBpm: getPrecipArpBpm,
    getHumidArpBpm: getHumidArpBpm,
    getHumidArpIntervals: getHumidArpIntervals,
    getPrecipArpIntervalType: getPrecipArpIntervalType,
    getMasterFilterFreq: getMasterFilterFreq,
    isRootNoteHigh: isRootNoteHigh,
    getRideCymbalRate: getRideCymbalRate,
    getRideCymbalsBpm: getRideCymbalsBpm,
    getRideCymbalMaxVolume: getRideCymbalMaxVolume,
    getRideCymbalVolumeArr: getRideCymbalVolumeArr,
    getNoteLengthMult: getNoteLengthMult,
    getNoteLengths: getNoteLengths,
    getLeadNoteLengthStart: getLeadNoteLengthStart,
    getHarpVolArr: getHarpVolArr,
    getHarpCanPlay: getHarpCanPlay,
    getTimpaniCanPlay: getTimpaniCanPlay,
    getChoralCanPlay: getChoralCanPlay
  };
})();
