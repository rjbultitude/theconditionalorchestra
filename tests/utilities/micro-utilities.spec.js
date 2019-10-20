var mocha = require('mocha');
var expect = require('chai').expect;
var microUtils = require('../../src/scripts/utilities/micro-utilities.js');

describe('map range', function() {
  it('should return a floating point number when all args are numbers', function() {
    expect(microUtils.mapRange(1, 2, 3, 4, 5)).to.be.a('number');
  });
  it('should return 10 when value is 5 range 1 is 0-10 and range 2 is 0-20', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, 20)).to.equal(10);
  });
  it('should return false when one of the args in not type number', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, false)).to.be.false;
  });
});

describe('remove String From Start', function() {
  it('should return a floating point number when all args are numbers', function() {
    expect(microUtils.mapRange(1, 2, 3, 4, 5)).to.be.a('number');
  });
  it('should return 10 when value is 5 range 1 is 0-10 and range 2 is 0-20', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, 20)).to.equal(10);
  });
  it('should return false when one of the args in not type number', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, false)).to.be.false;
  });
});
