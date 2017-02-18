//Audio Visual Settings
module.exports = {
  animAmount: 1,
  noiseInc: 0.01,
  //Canvas size
  cWidth: 800,
  cHeight: 400,
  cPadding: '50%',
  //Colour offset
  colourDim: 18,
  //Pitch / rate / volume
  dropVolume: 0.2,
  volume: 0.75,
  organ: {volume : 0.75},
  organDist: {volume : 0.425},
  trumpet: {volume : 0.75},
  saxophone: {volume : 0.75},
  numPadNotes: 5,
  numChords: 3,
  mainSeqRepeat: 2,
  numRArpNotes: 12,
  numCArpNotes: 4, //should match closeIntervals
  numOctaves: 2,
  numSemitones: 12,
  scaleStartIndexBuffer: 10,
  pitchOffsetInc: 0.5,
  fadeTime: 1,
  //Frequency
  //Lowest (10Hz) to highest (22050Hz)
  masterFilter: {
    min: 700,
    max: 5000
  },
	//DOM
	cContainerName: 'canvas-container'
};
