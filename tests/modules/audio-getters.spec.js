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
