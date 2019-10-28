var mocha = require('mocha');
var expect = require('chai').expect;
var audioGetters = require('../../src/scripts/modules/audio-getters');

describe('is Root Note Greater than Median', function() {
  this.beforeAll(function() {
    this.rootNoteRange = {
      rangePlus: 10,
      rangeMinus: -10,
    }
  });
  it('should return true if root note arg is greater than zero', function() {
    expect(audioGetters.isRootNoteGrtrMedian(6, this.rootNoteRange)).to.be.true;
  });
  it('should return false if root note arg is less than zero', function() {
    expect(audioGetters.isRootNoteGrtrMedian(-1, this.rootNoteRange)).to.be.false;
  });
  it('should return undefined if root note arg is not typeof number', function() {
    expect(audioGetters.isRootNoteGrtrMedian('bad arg', this.rootNoteRange)).to.be.an('undefined');
  });
  it('should return undefined if rootNoteRange arg is not an object with props rangeMinus and rangePlus', function() {
    expect(audioGetters.isRootNoteGrtrMedian(10, {})).to.be.an('undefined');
  });
  it('should return undefined rootNoteRange arg is not an object', function() {
    expect(audioGetters.isRootNoteGrtrMedian(10, 'bad arg')).to.be.an('undefined');
  });
});

describe('get Sequence Repeat Max Multiplier', function() {
  this.beforeAll(function() {
    this.avSettings = {
      numChordsMin: 2,
      numChordsMax: 4,
      mainSeqRepeatMax: 10
    }
  });
  it('should return mainSeqRepeatMax value if numChords arg is not greater than mean', function() {
    expect(audioGetters.getSeqRepeatMaxMult(2, this.avSettings)).to.equal(10);
  });
  it('should return mainSeqRepeatMax minus difference (numChordsMax - mean) value if numChords arg is greater than mean', function() {
    expect(audioGetters.getSeqRepeatMaxMult(5, this.avSettings)).to.equal(9);
  });
  it('should return undefined if root note arg is not typeof number', function() {
    expect(audioGetters.getSeqRepeatMaxMult('bad arg', this.avSettings)).to.be.an('undefined');
  });
  it('should return undefined if rootNoteRange arg is not an object with props rangeMinus and rangePlus', function() {
    expect(audioGetters.getSeqRepeatMaxMult(10, {})).to.be.an('undefined');
  });
  it('should return undefined rootNoteRange arg is not an object', function() {
    expect(audioGetters.getSeqRepeatMaxMult(10, 'bad arg')).to.be.an('undefined');
  });
});

describe('get Main Sequence Repeat Number', function() {
  this.beforeAll(function() {
    this.apparentTemperature = {
      value: 4,
      min: 2,
      max: 6
    }
  });
  it('should return a number when weatherFacet arg has correct props and numChords and upperMult args are numbers', function() {
    expect(audioGetters.getMainSeqRepeatNum(this.apparentTemperature, 2, 4)).to.be.a('number');
  });
  it('should return undefined if weatherFacet arg does not contain value prop', function() {
    expect(audioGetters.getMainSeqRepeatNum({min: 1, max: 2}, 2, 4)).to.be.an('undefined');
  });
  it('should return undefined if numChords and upperMult are not typeof number', function() {
    expect(audioGetters.getMainSeqRepeatNum(this.apparentTemperature, '2', '4')).to.be.an('undefined');
  });
});

describe('get Root Note Range', function() {
  it('should return an object when a number is passed as arg', function() {
    expect(audioGetters.getRootNoteRange(2)).to.be.an('object');
  });
  it('should return a rangePlus prop with value half of the number passed', function() {
    expect(audioGetters.getRootNoteRange(4).rangePlus).to.equal(2);
  });
  it('should return a rangeMinus prop with negative value of the number passed', function() {
    expect(audioGetters.getRootNoteRange(4).rangeMinus).to.equal(-4);
  });
  it('should return undefined when arg is not typeof number', function() {
    expect(audioGetters.getRootNoteRange('4')).to.be.an('undefined');
  });
});

describe('get Root Note', function() {
  this.beforeAll(function() {
    this.pressure = {
      value: 960,
      min: 800,
      max: 1080
    };
    this.rootNoteRange = {
      rangeMinus: -4,
      rangePlus: 4
    }
  });
  it('should return a number when weatherFacet object and rootNoteRange objects are passed', function() {
    expect(audioGetters.getRootNote(this.pressure, this.rootNoteRange)).to.be.a('number');
  });
  it('should return undefined when weatherFacet arg does not contain prop value', function() {
    expect(audioGetters.getRootNote({max: 1, min: 2}, this.rootNoteRange)).to.be.an('undefined');
  });
  it('should return undefined when rootNoteRange arg does not contain prop rangeMinus', function() {
    expect(audioGetters.getRootNote(this.pressure, {})).to.be.an('undefined');
  });
});

describe('get Long Note Index', function() {
  this.beforeAll(function() {
    this.windBearing = {
      value: 58,
      min: 0,
      max: 360
    };
    this.windBearingMid = {
      value: 170,
      min: 0,
      max: 360
    };
    this.windBearingHigh = {
      value: 340,
      min: 0,
      max: 360
    };
  });
  it('should return a number when windBearing object and numNotes number is passed', function() {
    expect(audioGetters.getLongNoteIndex(this.windBearing, 6)).to.be.a('number');
  });
  it('should return 1 when windBearing is less than 60 (degrees) and number of notes is 6 (360 / 6)', function() {
    expect(audioGetters.getLongNoteIndex(this.windBearing, 6)).to.equal(1);
  });
  it('should return 3 when windBearing is less than 180 (degrees) and number of notes is 6 (360 / 6)', function() {
    expect(audioGetters.getLongNoteIndex(this.windBearingMid, 6)).to.equal(3);
  });
  it('should return 6 when windBearing is greater than 300 (degrees) and number of notes is 6 (360 / 6)', function() {
    expect(audioGetters.getLongNoteIndex(this.windBearingHigh, 6)).to.equal(6);
  });
  it('should return undefined when windBearing arg does not contain prop value', function() {
    expect(audioGetters.getLongNoteIndex({}, 6)).to.be.an('undefined');
  });
});

describe('is Long Note High', function() {
  it('should return a boolean when rootNoteHigh boolean, longNoteIndex number and numPadNotes number is passed', function() {
    expect(audioGetters.isLongNoteHigh(true, 2, 5)).to.be.a('boolean');
  });
  it('should return true when rootNoteHigh is true and longNoteIndex is greater than half the number of numPadNotes', function() {
    expect(audioGetters.isLongNoteHigh(true, 4, 4)).to.be.true;
  });
  it('should return true when rootNoteHigh is true and longNoteIndex is equal to than half the number of numPadNotes', function() {
    expect(audioGetters.isLongNoteHigh(true, 4, 8)).to.be.true;
  });
  it('should return false when rootNoteHigh is false', function() {
    expect(audioGetters.isLongNoteHigh(false, 4, 8)).to.be.false;
  });
  it('should return false when rootNoteHigh is true and longNoteIndex is less than half the number of numPadNotes', function() {
    expect(audioGetters.isLongNoteHigh(true, 1, 8)).to.be.false;
  });
});

describe('get Extra Chords Offset', function() {
  it('should return a number when rootNoteGrtrMedian is true and numSemisPerOctave is a number', function() {
    expect(audioGetters.getExtraChordsOffset(true, 10)).to.be.a('number');
  });
  it('should return numSemisPerOctave when rootNoteGrtrMedian is true', function() {
    expect(audioGetters.getExtraChordsOffset(true, 10)).to.equal(10);
  });
  it('should return 5 when rootNoteGrtrMedian is false', function() {
    expect(audioGetters.getExtraChordsOffset(false, 10)).to.equal(5);
  });
  it('should return 5 when when rootNoteGrtrMedian is false and numSemisPerOctave is not supplied', function() {
    expect(audioGetters.getExtraChordsOffset(false, null)).to.equal(5);
  });
});

describe('get Long Note Filter Freq', function() {
  this.beforeAll(function() {
    this.weatherFacet = {
      value: 0.8,
      min: 0,
      max: 1
    };
    this.longNoteFilter = {
      min: 10,
      max: 100
    };
  });
  it('should return a number when weatherFacet object and longNoteFilter object are passed', function() {
    expect(audioGetters.getLongNoteFilterFreq(this.weatherFacet, this.longNoteFilter)).to.be.a('number');
  });
  it('should return undefined when weatherFacet is does not contain correct props', function() {
    expect(audioGetters.getLongNoteFilterFreq({}, this.longNoteFilter)).to.be.an('undefined');
  });
  it('should return undefined when longNoteFilter is does not contain correct props', function() {
    expect(audioGetters.getLongNoteFilterFreq(this.weatherFacet, {})).to.be.an('undefined');
  });
});

describe('get Brass Volume', function() {
  this.beforeAll(function() {
    this.weatherFacet = {
      value: 22,
      min: 0,
      max: 120
    };
  });
  it('should return a number when weatherFacet object and longNoteFilter object are passed', function() {
    expect(audioGetters.getBrassVolume(this.weatherFacet)).to.be.a('number');
  });
  it('should return undefined when weatherFacet is does not contain correct props', function() {
    expect(audioGetters.getBrassVolume({})).to.be.an('undefined');
  });
});

describe('get Brass BPM', function() {
  this.beforeAll(function() {
    this.weatherFacet = {
      value: 22,
      min: 0,
      max: 120
    };
  });
  it('should return a number when weatherFacet object and longNoteFilter object are passed', function() {
    expect(audioGetters.getBrassBpm(this.weatherFacet)).to.be.a('number');
  });
  it('should return undefined when weatherFacet is does not contain correct props', function() {
    expect(audioGetters.getBrassBpm({})).to.be.an('undefined');
  });
});

describe('get Lead Sound Volume', function() {
  this.beforeAll(function() {
    this.isSublime = true;
  });
  it('should return a number when isSublime is true', function() {
    expect(audioGetters.getLeadSoundVolume(this.isSublime)).to.be.a('number');
  });
  it('should return 0.8 when isSublime is true', function() {
    expect(audioGetters.getLeadSoundVolume(this.isSublime)).to.equal(0.8);
  });
  it('should return undefined when isSublime is not a boolean', function() {
    expect(audioGetters.getLeadSoundVolume({})).to.be.an('undefined');
  });
});
