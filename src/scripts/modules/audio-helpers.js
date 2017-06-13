'use strict';

var duplicateArray = require('../utilities/duplicate-array-vals');

module.exports = (function() {

  function addRandomStops(notesArray, sketch) {
    //duplicate notes
    var _newNotesArray = duplicateArray(notesArray, 1);
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

  function getAllegrettoRhythmType(wCheck, humidArpScaleArray) {
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

  return {
      addRandomStops: addRandomStops,
      getAllegrettoRhythm: getAllegrettoRhythm,
      getAllegrettoRhythmType: getAllegrettoRhythmType
  };
})();
