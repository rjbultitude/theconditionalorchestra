'use strict';

module.exports = {
    //TODO check the names used
    heptatonicMajorIntervals: [0, 2, 4, 5, 7, 9, 11], // Heptatonic major scale
    heptatonicMinorIntervals: [0, 2, 3, 5, 7, 9, 10], // Heptatonic harmonic minor scale
    octatonicMinorIntervals: [0, 2, 3, 5, 7, 8, 9, 10],  // Octatonic minor scale
    minorSeventhIntervals: [0, 4, 7, 10, 0, 4, 7, 10],
    majorSeventhIntervals: [0, 4, 7, 11, 0, 4, 7, 11],
    safeIntervals: [0, 5, 7, 9], //for rain arrpeggio
    safeSeventhIntervals: [0, 4, 7],
    closeIntervals: [0, -1, 0, 2], //for clement arrpeggio
    closeIntervalsAlt: [0, -1, 1, 0],
    chordsMelancholyUp: [0, 5, 3],
    chordsMelancholyDown: [0, -4, -2],
    chordsPositiveUp: [0, 5, 3, 5],
    chordsPositiveDown: [0, -5, -3, -5],
    chordsNoOffset: [0, 0, 0, 0],
    chordIndexesDown: [0, 3, 2, 1],
    chordIndexesUp: [0, 2, 3, 5],
    chordIndexesUpDown: [3, 1, 2, 0],
    chordIndexesNoOffset: [0, 0, 0, 0]
};
