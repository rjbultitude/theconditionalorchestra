'use strict';

var arrayInsertAt = require('./array-insert-at');

module.exports = (function generateFrequencyScales() {
    /**
    * [createUpperScale Create a musical scale starting at a given frequency and counting up or down]
    * @param  {[Number]} startFreq     [A frequency or number to start at]
    * @param  {[Number]} numTones      [the number of tones (or semitone) in an octave ]
    * @param  {[Boolean]} includeOctave [a Boolean which determines whether an closing note is applied or not ]
    * @return {[Array]}               [an array containing all the frequencies in the scale]
    */
    function createScale(startFreq, numTones, includeOctave, upwardsScale) {
      var scale = [];
      var toneLoopLength = numTones;
      if (includeOctave) {
        toneLoopLength = numTones + 1;
      }
      if (upwardsScale) {
        for (var i = 1; i < toneLoopLength; i++) {
          var freqHigh = startFreq * Math.pow(2, i/numTones);
          scale.push(freqHigh);
        }
      } else {
        for (var j = toneLoopLength; j > 0; j--) {
          var freqLow = startFreq / Math.abs(Math.pow(2, j/numTones));
          scale.push(freqLow);
        }
      }
      return scale;
    }

    /**
     * [findCentreFreqIndex finds the index in an array of notes or tones based on the number of octaves and semitones]
     * @param  {[Number]} numOctaves   [the number of octaves in the scale]
     * @param  {[Number]} numSemitones [the number of semitones per octave]
     * @return {[Number]}              [the index representing the start frequency]
     */
    function findCentreFreqIndex(numOctaves, numSemitones) {
      var totalNotes = numOctaves * numSemitones;
      var noteIndex = null;
      if(numOctaves % 2 === 1) {
        //odd
        noteIndex = numSemitones * ((numOctaves - 1) / 2);
        return noteIndex;
      } else {
        //even
        noteIndex = totalNotes/2;
        return noteIndex;
      }
    }

    /**
     * [createJustMusicalExpScale creates an equal temperament musical scale of any length]
     * @param  {[Number]} startFreq    [a number representing the frequency or pitch]
     * @param  {[Number]} numOctaves   [the number of octaves to create]
     * @param  {[Number]} numSemitones [the number of semitones per octave]
     * @return {[Array]}              [an array of frequencies or pitches]
     */
    function createEqTempMusicalScale(startFreq, numOctaves, numSemitones) {
      var scale = [];
      var posCount = startFreq;
      var negCount = startFreq;
      for (var i = 0; i < numOctaves; i++) {
        //Create downwards scale
        if (i % 2 === 1) {
          scale = arrayInsertAt(scale, 0, createScale(negCount, numSemitones, false, false));
          negCount++;
        } else {
          //Create upwards scale
          scale = scale.concat(createScale(posCount, numSemitones, true, true));
          posCount++;
        }
      }
      //Add centre frequency
      scale.splice(findCentreFreqIndex(numOctaves, numSemitones), 0, startFreq);
      return scale;
    }

    return {
        createScale: createScale,
        findCentreFreqIndex: findCentreFreqIndex,
        createEqTempMusicalScale: createEqTempMusicalScale
    };
})();
