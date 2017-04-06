//Audio Visual Settings
module.exports = {
  animAmount: 1,
  noiseInc: 0.01,
  //Colour offset
  colourDim: 18,
  //Pitch / rate / volume
  dropVolume: 0.2,
  volume: 0.75,
  //padSounds
  organ: {volume : 0.75},
  guitar: {volume : 0.425},
  aeroflute: {volume : 0.5},
  saxophone: {volume : 0.75},
  horn: {volume : 0.8},
  harmonium: {volume : 0.5},
  numPadNotes: 5,
  numChords: 3,
  numChordsMin: 2,
  numChordsMax: 6,
  mainSeqRepeat: 2,
  mainSeqRepeatMin: 1,
  mainSeqRepeatMax: 6,
  numRArpNotes: 12,
  numCArpNotes: 4, //should match closeIntervals
  numOctaves: 2,
  numSemitones: 12,
  scaleStartIndexBuffer: 10,
  pitchOffsetInc: 0.5,
  fadeTime: 1,
  //Frequency
  //Lowest (10 Hz) to highest (22,050 Hz)
  masterFilter: {
    min: 700,
    max: 5000
  },
	//DOM
	cContainerName: 'canvas-container'
};
