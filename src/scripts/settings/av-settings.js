//Audio Visual Settings
module.exports = {
  animAmount: 1,
  noiseInc: 0.01,
  //Colour offset
  colourDim: 18,
  //Pitch / rate / volume
  dropSoundVol: {
    hard: 1,
    soft: 0.8,
    light: 0.7
  },
  volume: 0.75,
  //padSounds
  aeroflute: {volume : 0.65},
  guitar: {volume : 0.65},
  harmonium: {volume : 0.55},
  zither: {volume : 0.7},
  synth: {volume : 0.7},
  organ: {volume : 0.8},
  saxophone: {volume : 0.8},
  vocal: {volume : 0.8},
  numPadNotes: 5,
  numChords: 3,
  numChordsMin: 3,
  // TODO could be 8
  numChordsMax: 6,
  mainSeqRepeat: 2,
  mainSeqRepeatMin: 1,
  mainSeqRepeatMax: 6,
  noteLengthMultMin: 2,
  noteLengthMultMax: 6,
  numPrecipArpNotes: 12,
  numHumidArpNotes: 6, //should match closeIntervals
  numOctaves: 2,
  numSemitones: 12,
  scaleStartIndexBuffer: 10,
  pitchOffsetInc: 0.5,
  fadeTime: 1,
  //Frequency
  //Lowest (10 Hz) to highest (22,050 Hz)
  padFilter: {
    min: 1000,
    max: 6000
  },
  longNoteFilter: {
    min: 1000,
    max: 3000
  },
  //DOM
  cContainerName: 'canvas-container'
};
