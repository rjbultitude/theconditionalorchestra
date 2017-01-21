'use strict';

module.exports = {
    //TODO check the names used
    //Intervals
    heptatonicMajorIntervals: [0, 2, 4, 5, 7, 9, 11], // Heptatonic major scale
    heptatonicMinorIntervals: [0, 2, 3, 5, 7, 9, 10], // Heptatonic harmonic minor scale
    octatonicMinorIntervals: [0, 2, 3, 5, 7, 8, 9, 10],  // Octatonic minor scale
    //6th
    majorSixthIntervals: [0, 4, 7, 9, 0, 4, 7, 9],
    minorSixthIntervals: [0, 3, 7, 9, 0, 3, 7, 9],
    //7th
    majorSeventhIntervals: [0, 4, 7, 11, 0, 4, 7, 11],
    minorSeventhIntervals: [0, 3, 7, 10, 0, 4, 7, 10],
    //9th
    majorNinthIntervals: [0, 4, 7, 11, 14, 0, 2, 4, 7, 11, 14],
    minorNinthIntervals: [0, 3, 7, 10, 14, 0, 2, 3, 7, 10, 14],
    //Safe
    safeIntervals: [0, 5, 7, 9], //for rain arrpeggio
    safeNthMajorIntervals: [0, 4, 7], //for rain arrpeggio
    safeNthMinorIntervals: [0, 3, 7], //for rain arrpeggio
    //Close
    closeMajorIntervals: [0, -1, 0, 2], //for humid arrpeggio
    closeMinorIntervals: [0, -2, 0, 2], //for humid arrpeggio
    farMajorIntervals: [0, -8, 0, -12], //for humid arrpeggio
    farMinorIntervals: [0, -9, 0, -12], //for humid arrpeggio
    //Chord sequences
    chordsMelancholyUp: [
      {
        index: 0,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: 5,
        key: 'minorSeventhIntervals'
      },
      {
        index: 3,
        key: 'heptatonicMajorIntervals'
      }],
    chordsMelancholyDown: [
      {
        index: 0,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: -4,
        key: 'minorSeventhIntervals'
      },
      {
        index: -2,
        key: 'minorSeventhIntervals'
      }],
    chordsPositiveUp: [
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: 5,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: 3,
        key: 'majorSeventhIntervals'
      },
      {
        index: 5,
        key: 'heptatonicMajorIntervals'
      }],
    chordsPositiveDown: [
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: -3,
        key: 'majorSeventhIntervals'
      },
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: -5,
        key: 'heptatonicMajorIntervals'
      }],
    chordsNoOffset: [
      {
        index: 0,
        key: ''
      },
      {
        index: 0,
        key: ''
      },
      {
        index: 0,
        key: ''
      },
      {
        index: 0,
        key: ''
      }],
    //Inversions
    chordIndexesDown: [0, 3, 2, 1],
    chordIndexesUp: [0, 2, 3, 5],
    chordIndexesUpDown: [3, 1, 2, 0],
    chordIndexesNoOffset: [0, 0, 0, 0]
};
