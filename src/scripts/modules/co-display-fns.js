'use strict';

var he = require('he');
var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var microU = require('../utilities/micro-utilities');
var avSettings = require('../settings/av-settings');
var getFreqScales = require('../utilities/create-freq-scales');

/**
 * Methods for setting display data
 * TODO make them chainable?
 * @type {Object}
 */
module.exports = function(coDisplayData, lwData, wCheck, mDVals) {

  function getMainMelodyTempoType(noteLengthMult, avSettings) {
    var _meanVal = Math.round((avSettings.noteLengthMultMin + avSettings.noteLengthMultMax) / 2);
    if (mDVals.noteLengthMult < _meanVal) {
      return 'swiftly';
    } else if (mDVals.noteLengthMult === _meanVal) {
      return 'moderately';
    } else {
      return 'slowly';
    }
  }

  function getRootNoteLetter(numSemisPerOctave, rootNote) {
    var _rootNoteLetter = '';
    //Add one as the 1st note is 0 based
    var _rootNoteNumber = rootNote + 1;
    if (numSemisPerOctave !== 12) {
      _rootNoteLetter = microU.getOrdinal(_rootNoteNumber) + ' note in a non western scale';
    } else {
      if (rootNote < 0) {
        _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[getFreqScales.CHROMATIC_SCALE.length + rootNote] + '2';
      } else {
        _rootNoteLetter = getFreqScales.CHROMATIC_SCALE[rootNote] + '3';
      }
    }
    return _rootNoteLetter;
  }

  function outputChordSeqType(chordSeqKey) {
    if (chordSeqKey === 'noChordOffset') {
      return 'Using inversions';
    } else {
      return microU.addSpacesToString(chordSeqKey);
    }
  }

  function outputPrecipArpType(precipCategory) {
    if (precipCategory === 'hard') {
      return 'forwards';
    } else if (precipCategory === 'soft') {
      return 'gently';
    } else {
      return 'backwards';
    }
  }

  function setLwDataVals(coDisplayDataGroup, lwDataArr) {
    return coDisplayDataGroup.map(function(coDisplayObj) {
      for (var i = 0, length = lwDataArr.length; i < length; i++) {
        if (coDisplayObj.key === lwDataArr[i]) {
          coDisplayObj.value = lwData[lwDataArr[i]].value === undefined ? lwData[lwDataArr[i]] : lwData[lwDataArr[i]].value;
        }
      }
      return coDisplayObj;
    });
  }

  //TODO too complex
  function setCoDisplayDataNegVals(coDisplayDataGroup, lwDataArr) {
    return coDisplayDataGroup.map(function(coDisplayObj) {
      //Negative values can come in arrays
      if (Array.isArray(coDisplayObj.negativeKey)) {
        for (var i = 0, length = coDisplayObj.negativeKey.length; i < length; i++) {
          if (lwDataArr.hasOwnProperty(coDisplayObj.negativeKey[i])) {
            //If any of the negativeKey props are true
            if (lwDataArr[coDisplayObj.negativeKey[i]] === true) {
              //Set the value to true
              //coDisplayObj.negativeValue = lwDataArr[coDisplayObj.negativeKey[i]];
              coDisplayObj.negativeValue = true;
              break;
            }
          }
        }
      } else if (typeof coDisplayObj.negativeKey === 'string') {
        if (lwDataArr.hasOwnProperty(coDisplayObj.negativeKey)) {
          coDisplayObj.negativeValue = lwDataArr[coDisplayObj.negativeKey];
        }
      }
      return coDisplayObj;
    });
  }

  function setWcheckDataVals(coDisplayDataGroup, wCheckArr) {
    return coDisplayDataGroup.map(function(coDisplayObj) {
      for (var i = 0, length = wCheckArr.length; i < length; i++) {
        if (coDisplayObj.key === wCheckArr[i]) {
          coDisplayObj.value = wCheck[wCheckArr[i]];
        }
      }
      return coDisplayObj;
    });
  }

  function mapConditionsToDisplayData(coDisplayDataGroup) {
    var _lwDataArr = Object.keys(lwData);
    var _wCheckArr = Object.keys(wCheck);
    var _coDisplayDataLw = setLwDataVals(coDisplayDataGroup, _lwDataArr);
    //TODO not sure this does anthing
    //because negativeValues can only apply to booleans
    var _coDisplayDataLwNeg = setCoDisplayDataNegVals(_coDisplayDataLw, lwData);
    var _coDisplayDataWCheck = setWcheckDataVals(_coDisplayDataLwNeg, _wCheckArr);
    var _coDisplayDataWCheckNeg = setCoDisplayDataNegVals(_coDisplayDataWCheck, wCheck);
    return _coDisplayDataWCheckNeg;
  }

  function unitiseData(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
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

  function convertPercentages(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
      if (coProp.key === 'cloudCover' || coProp.key === 'humidity' || coProp.key === 'precipProbability') {
        coProp.value = coProp.value *= 100;
      }
      return coProp;
    });
  }

  // make an exception for precipIntensity
  // because we're not using falsy values
  // to filter out display items
  // we're using undefined or false
  function exceptionCheckData(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
      if (coProp.key === 'precipIntensity' && coProp.value === 0) {
        coProp.value = false;
      }
      return coProp;
    });
  }

  function setIconPath(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
      if (coProp.value) {
        if(coProp.key === 'precipType' || coProp.key === 'precipIntensity' || coProp.key === 'precipProbability') {
          coProp.iconPath = '/img/' + lwData.precipType + '-icon.svg';
        }
      }
      return coProp;
    });
  }

  function constrainDecimals(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
      if (typeof coProp.value === 'number' && coProp.constrain) {
        if (coProp.key === 'precipIntensity') {
          coProp.value = coProp.value.toFixed(4);
        } else {
          coProp.value = coProp.value.toFixed(2);
        }
      }
      return coProp;
    });
  }

  function addPrimaryMusicVals(coDisplayDataGroup) {
    return coDisplayDataGroup.map(function(coProp) {
        switch (coProp.key) {
          case 'dewPoint':
            coProp.musicValue = mDVals.numChords;
            break;
          case 'ozone':
            coProp.musicValue = mDVals.numExtraChords;
            break;
          case 'pressure':
            coProp.musicValue = getRootNoteLetter(mDVals.numSemisPerOctave, mDVals.rootNote);
            break;
          case 'temperature':
            coProp.musicValue = getMainMelodyTempoType(mDVals.noteLengthMult, avSettings);
            break;
          case 'cloudCover':
            coProp.musicValue = Math.round(mDVals.masterFilterFreq);
            break;
          case 'apparentTemperature':
            coProp.musicValue = Math.round(mDVals.seqRepeatNum / mDVals.numChords);
            break;
          case 'windBearing':
            coProp.musicValue = microU.getOrdinal(mDVals.longNoteIndex + 1);
            break;
          case 'visibility':
            coProp.musicValue = mDVals.reverbLength;
            break;
          case 'precipIntensity':
            coProp.musicValue = mDVals.precipArpBpm;
            break;
          case 'precipType':
            coProp.value = !coProp.value ? false : coProp.value;
            coProp.musicValue = outputPrecipArpType(mDVals.precipCategory);
            break;
          case 'precipProbability':
            coProp.musicValue = mDVals.rideCymbalBpm;
            break;
          case 'nearestStormBearing':
            coProp.musicValue = mDVals.rideCymbalRate.toFixed(2);
            break;
          case 'nearestStormDistance':
            coProp.musicValue = mDVals.rideCymbalMaxVolume.toFixed(2);
            break;
          case 'windSpeedHigh':
            coProp.musicValue = mDVals.humidArpBpm;
            break;
          case 'isWindyArp':
            coProp.musicValue = mDVals.humidArpIntervalsKey;
            break;
        }
      return coProp;
    });
  }

  function whichConditionTrue(displayDataGroup) {
    var _anyValidPropTrue = false;
    //TODO why is this not a for in?
    for (var i = 0, length = displayDataGroup.length; i < length; i++) {
      if (displayDataGroup[i].key !== 'isOther' && displayDataGroup[i].value) {
        _anyValidPropTrue = true;
        //Return early
        return displayDataGroup[i].key;
      }
    }
    //or return isOther
    return 'isOther';
  }

  function setStandardDisplayVals(displayDataGroup, musicVal) {
    //Store only one true condition key
    //to avoid repetitive display items
    var _trueCondition = whichConditionTrue(displayDataGroup);
    return displayDataGroup.map(function(displayProp) {
      //Set all values to false
      //except the first object we found that's true
      if (displayProp.key !== _trueCondition) {
        displayProp.value = false;
      }
      if (displayProp.hasOwnProperty('musicValue')) {
        displayProp.musicValue = musicVal;
      }
      return displayProp;
    });
  }

  function setHumidMapVals(displayDataGroup) {
    return displayDataGroup.map(function(displayProp) {
      //Set to false if not humid
      //thus not rendering them
      if (!wCheck.isHumid) {
        displayProp.value = false;
        return displayProp;
      }
      if (displayProp.key === 'humidity') {
        displayProp.musicValue = mDVals.humidArpBpm;
      } else if (displayProp.key === 'pressure') {
        displayProp.musicValue = mDVals.humidArpIntervalsKey;
      }
      return displayProp;
    });
  }

  function setCoDisplayGroupVals() {
    var _finalCoData = [];
    var _currArr;
    for (var coDataGroup in coDisplayData) {
      if (coDisplayData.hasOwnProperty(coDataGroup)) {
        //Assign condition values, images and units
        //TODO refactor so these fns can be chained
        var _mappedDisplayGroup = mapConditionsToDisplayData(coDisplayData[coDataGroup]);
        var _unitisedDisplayGroup = unitiseData(_mappedDisplayGroup);
        var _percentageCalcData = convertPercentages(_unitisedDisplayGroup);
        var _exceptionCheckedGroup = exceptionCheckData(_percentageCalcData);
        var _iconisedGroup = setIconPath(_exceptionCheckedGroup);
        var _constrainedDisplayGroup = constrainDecimals(_iconisedGroup);
        //Assgin music values
        //Important - must include every group
        //else it creates duplicates
        switch (coDataGroup) {
          case 'primaryMap':
            _currArr = addPrimaryMusicVals(_constrainedDisplayGroup);
            break;
          case 'chordTypeMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.chordType);
            break;
          case 'chordSeqTypeMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, outputChordSeqType(mDVals.chordSeqKey));
            break;
          case 'padTypeMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.padType);
            break;
          case 'longNoteTypeMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.longNoteType);
            break;
          case 'inversionMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.inversionOffsetType);
            break;
          case 'numNotesMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.numPadNotes);
            break;
          case 'semiTonesMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup, mDVals.numSemisPerOctave);
            break;
          case 'padLengthMap':
            _currArr = setStandardDisplayVals(_constrainedDisplayGroup);
            break;
          case 'leadMap':
            _currArr = _constrainedDisplayGroup;
            break;
          case 'humidArpMap':
            _currArr = setHumidMapVals(_constrainedDisplayGroup);
            break;
        }
        //Convert sets to one single array
        _finalCoData.push.apply(_finalCoData, _currArr);
      }
    }
    return _finalCoData;
  }

  return setCoDisplayGroupVals;
};
