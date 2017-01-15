'use strict';

module.exports = {
    //TODO check the names used
    //Intervals
    heptatonicMajorIntervals: [0, 2, 4, 5, 7, 9, 11], // Heptatonic major scale
    heptatonicMinorIntervals: [0, 2, 3, 5, 7, 9, 10], // Heptatonic harmonic minor scale
    octatonicMinorIntervals: [0, 2, 3, 5, 7, 8, 9, 10],  // Octatonic minor scale
    majorSeventhIntervals: [0, 4, 7, 11, 0, 4, 7, 11],
    minorSeventhIntervals: [0, 3, 7, 10, 0, 4, 7, 10],
    majorNinthIntervals: [0, 4, 7, 10, 14, 0, 2, 4, 7, 10, 14],
    minorNinthIntervals: [0, 3, 7, 10, 14, 0, 2, 3, 7, 10, 14],
    safeIntervals: [0, 5, 7, 9], //for rain arrpeggio
    safeSeventhIntervals: [0, 4, 7], //for rain arrpeggio
    closeIntervals: [0, -1, 0, 2], //for clement arrpeggio
    closeIntervalsAlt: [0, -1, 1, 0], //for clement arrpeggio
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
        key: 'heptatonicMinorIntervals'
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
        key: ''
      },
      {
        index: 5,
        key: ''
      }],
    chordsPositiveDown: [
      {
        index: 0,
        key: ''
      },
      {
        index: -5,
        key: ''
      },
      {
        index: -3,
        key: ''
      },
      {
        index: -5,
        key: ''
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
        index: 0
        key: ''
      }],
    //Inversions
    chordIndexesDown: [0, 3, 2, 1],
    chordIndexesUp: [0, 2, 3, 5],
    chordIndexesUpDown: [3, 1, 2, 0],
    chordIndexesNoOffset: [0, 0, 0, 0]
};
