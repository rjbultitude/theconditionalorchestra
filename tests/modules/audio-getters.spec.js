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
