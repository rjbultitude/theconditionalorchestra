var mocha = require('mocha');
var expect = require('chai').expect;
var duplicateArray = require('../../src/scripts/utilities/duplicate-array-vals.js');

describe('duplicate array', function() {
  it('should return an array when array and times (number) arguments are provided', function() {
    expect(duplicateArray([1, 2], 2)).to.be.an('array');
  });
  it('should return an array of length 4 when a two item array is provided and times arguments is 2', function() {
    expect(duplicateArray([1, 2], 2)).to.have.lengthOf(4);
  });
  it('should return an array of length 4 when a two item array is provided and times arguments is 2', function() {
    expect(duplicateArray([1, 2], 2)).to.have.lengthOf(4);
  });
  it('should return an array of length 4 when a two item array is provided and times is not typeof number', function() {
    expect(duplicateArray([1, 2], 2)).to.have.lengthOf(4);
  });
  it('should throw when array argument is not typeof Array', function() {
    expect(duplicateArray('wrong arg type', 2)).to.be.false;
  });
});
