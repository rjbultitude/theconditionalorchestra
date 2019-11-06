var mocha = require('mocha');
var expect = require('chai').expect;
var getMeanVal = require('../../src/scripts/utilities/get-mean-val.js');

describe('get mean value', function() {
  it('should return a floating point number when min and max are numbers and wasUndefined is false', function() {
    expect(getMeanVal(1, 2, '', false)).to.be.a('number');
  });
  it('should return a min plus max divided by two when wasUndefined is false', function() {
    expect(getMeanVal(1, 2, '', false)).to.equal(1.5);
  });
  it('should return false when wasUndefined is true', function() {
    expect(getMeanVal(1, 2, '', true)).to.be.false;
  });
});
