'use strict';

module.exports = {
    //TODO check the names used
    // Intervals
    heptatonicMajorIntervals: [0, 2, 4, 5, 7, 9, 11],
    heptatonicMinorIntervals: [0, 2, 3, 5, 7, 9, 10],
    octatonicMinorIntervals: [0, 2, 3, 5, 7, 8, 9, 10],
    sus4Intervals: [0, 5, 7],
    // Major
    majorIntervals: [0, 4, 7],
    // Minor
    minorIntervals: [0, 3, 7],
    // 6th
    majorSixthIntervals: [0, 4, 7, 9],
    minorSixthIntervals: [0, 3, 7, 9],
    // 7th
    seventhIntervals: [0, 4, 7, 10],
    majorSeventhIntervals: [0, 4, 7, 11],
    minorSeventhIntervals: [0, 3, 7, 10],
    sus2SeventhIntervals: [0, 7, 10, 14],
    // 9th
    majorNinthIntervals: [0, 4, 7, 11, 14],
    minorNinthIntervals: [0, 3, 7, 10, 14],
    // Safe notes for rain arrpeggio
    safeIntervals: [0, 5, 7, 9], //
    safeNthMajorIntervals: [0, 4, 7], //for rain arrpeggio
    safeNthMinorIntervals: [0, 3, 7], //for rain arrpeggio
    // for humid arrpeggio
    closeMajorIntervals: [-12, -10, 0, -10, 0, 5, 0, 5, 12],
    closeMinorIntervals: [-12, -9, 0, -9, 0, 7, 0, 7, 12],
    farMajorIntervals: [12, 4, 0, 4, 0, -8, 0, -8, -12],
    farMinorIntervals: [12, 3, 0, 3, 0, -9, 0, -9, -12],
    // Chord sequences
    // max number of chords is 6
    nostalgia: [
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
        key: 'majorSeventhIntervals'
      },
      {
        index: 2,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: 3,
        key: 'majorSeventhIntervals'
      },
      {
        index: -2,
        key: 'heptatonicMajorIntervals'
      }
    ],
    melancholyDays: [
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: 0,
        key: 'sus2SeventhIntervals'
      },
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: -4,
        key: 'majorSeventhIntervals'
      },
      {
        index: -5,
        key: 'majorIntervals'
      },
      {
        index: 3,
        key: 'majorSeventhIntervals'
      }
    ],
    slowMotion: [
      {
        index: 0,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: 2,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: 3,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: 0,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: -4,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: -5,
        key: 'heptatonicMinorIntervals'
      }
    ],
    familiarPlace: [
      {
        index: 0,
        key: 'majorSixthIntervals'
      },
      {
        index: -4,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: -5,
        key: 'minorSeventhIntervals'
      },
      {
        index: -5,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: -9,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: -7,
        key: 'heptatonicMajorIntervals'
      }
    ],
    skyLark: [
      {
        index: 0,
        key: 'majorSeventhIntervals'
      },
      {
        index: 7,
        key: 'majorIntervals'
      },
      {
        index: 3,
        key: 'majorSeventhIntervals'
      },
      {
        index: 5,
        key: 'majorIntervals'
      },
      {
        index: -4,
        key: 'majorIntervals'
      },
      {
        index: 3,
        key: 'majorSeventhIntervals'
      }
    ],
    highTime: [
      {
        index: 0,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: 0,
        key: 'sus2SeventhIntervals'
      },
      {
        index: 0,
        key: 'majorSixthIntervals'
      },
      {
        index: -3,
        key: 'heptatonicMinorIntervals'
      },
      {
        index: -7,
        key: 'heptatonicMajorIntervals'
      },
      {
        index: -5,
        key: 'seventhIntervals'
      }
    ],
    oldMellow: [
      {
        index: 0,
        key: 'sus4Intervals'
      },
      {
        index: 0,
        key: 'majorIntervals'
      },
      {
        index: 8,
        key: 'majorSixthIntervals'
      },
      {
        index: 8,
        key: 'majorSeventhIntervals'
      },
      {
        index: 5,
        key: 'majorIntervals'
      },
      {
        index: 5,
        key: 'sus4Intervals'
      }
    ],
    noChordOffset: [
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
    // Inversions / rootless voicings
    inversionsDownward: [0, 3, 2, 1],
    inversionsUpward: [0, 2, 3, 5],
    inversionsMixed: [3, 1, 2, 0],
    inversionsNoOffset: [0, 0, 0, 0]
};
