var mocha = require('mocha');
var expect = require('chai').expect;
var weatherChecker = require('../src/scripts/modules/weather-checker-fns.js');

describe('isPrecip', function() {
  it('should return true if number is greater than zero', function() {
    expect(weatherChecker.isPrecip(0.1)).to.be.true;
  });
  it('should return false if number is zero', function() {
    expect(weatherChecker.isPrecip(0)).to.be.false;
  });
  it('should return false if number is less than zero', function() {
    expect(weatherChecker.isPrecip(-1)).to.be.false;
  });
});
