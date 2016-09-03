'use strict';

var arrayInsertAt = require('../utilities/array-insert-at');

module.exports = function () {
    function createLowerScale(startFreq, numTones, includeOctave) {
      var scale = [];
      var toneLoopLength = numTones;
      if (includeOctave) {
        toneLoopLength = numTones + 1;
      }
      for (var i = toneLoopLength; i > 0; i--) {
        var freqLow = startFreq / Math.abs(Math.pow(2, i/numTones));
        scale.push(freqLow);
      }
      return scale;
    }

    function createUpperScale(startFreq, numTones, includeOctave) {
      var scale = [];
      var toneLoopLength = numTones;
      if (includeOctave) {
        toneLoopLength = numTones + 1;
      }
      for (var i = 1; i < toneLoopLength; i++) {
        var freqHigh = startFreq * Math.pow(2, i/numTones);
        scale.push(freqHigh);
      }
      return scale;
    }

    function findCentreFreqIndex(numOctaves, numSemitones) {
      var totalNotes = numOctaves * numSemitones;
      var noteIndex = null;
      if(numOctaves % 2 === 1) {
        //odd
        noteIndex = numSemitones * ((numOctaves - 1) / 2);
        console.log('noteIndex', noteIndex);
        return noteIndex;
      } else {
        //even
        noteIndex = totalNotes/2;
        return noteIndex;
      }
    }

    function createJustMusicalExpScale(startFreq, numOctaves, numSemitones) {
      var scale = [];
      var posCount = startFreq;
      var negCount = startFreq;
      //var totalSemitones = numOctaves * SEMITONES_IN_OCTAVE + 1; //2 octaves
      for (var i = 0; i < numOctaves; i++) {
        //Create downwards scale
        if (i % 2 === 1) {
          scale = arrayInsertAt(scale, 0, createLowerScale(negCount, numSemitones));
          negCount++;
        } else {
          //Create upwards scale
          scale = scale.concat(createUpperScale(posCount, numSemitones, true));
          posCount++;
        }
      }
      //Add centre frequency
      scale.splice(findCentreFreqIndex(numOctaves, numSemitones), 0, startFreq);
      //console.log('scale', scale);
      return scale;
    }

    return {
        createLowerScale: createLowerScale,
        createUpperScale: createUpperScale,
        findCentreFreqIndex: findCentreFreqIndex,
        createJustMusicalExpScale: createJustMusicalExpScale
    };
};
