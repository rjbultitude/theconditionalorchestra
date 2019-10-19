var mocha = require('mocha');
var expect = require('chai').expect;
var fibSequence = require('../../src/scripts/utilities/fib-sequence.js');

describe('fibonacci sequence', function() {
  it('should return an array when both arguments are numbers', function() {
    expect(fibSequence(1, 2)).to.be.an('array');
  });
  it('should return an array where one item is the first argument when first argument is a string', function() {
    expect(fibSequence('1', 2)).to.be.an('array').that.includes('1');
  });
  it('should return an array of one where one item is undefined', function() {
    expect(fibSequence(2)).to.have.lengthOf(1);
  });
  it('should return an array where second item is 10 when startNum is 5', function() {
    expect(fibSequence(5, 2)).to.be.an('array').that.includes(10);
  });
  it('should return an array where third item is 15 when startNum is 5', function() {
    expect(fibSequence(5, 3)).to.be.an('array').that.includes(15);
  });
  it('should return an array of length 3 when sequenceSize is 3', function() {
    expect(fibSequence(5, 3)).to.have.lengthOf(3);
  });
});
