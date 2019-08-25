var mocha = require('mocha');
var expect = require('chai').expect;
var weatherChecker = require('../src/scripts/modules/weather-checker-fns.js');

describe('isPrecip', function() {
  it('should return true if parameter is greater than zero', function() {
    expect(weatherChecker.isPrecip(0.1)).to.be.true;
  });
  it('should return false if parameter is zero', function() {
    expect(weatherChecker.isPrecip(0)).to.be.false;
  });
  it('should return false if parameter is less than zero', function() {
    expect(weatherChecker.isPrecip(-1)).to.be.false;
  });
});

describe('isHumid', function() {
  it('should return true if parameter is greater than humidity threshold', function() {
    expect(weatherChecker.isHumid(weatherChecker.humidityThreshold + 1)).to.be.true;
  });
  it('should return false if parameter is the same as humidityThreshold', function() {
    expect(weatherChecker.isHumid(weatherChecker.humidityThreshold)).to.be.false;
  });
  it('should return false if parameter is less than humidityThreshold', function() {
    expect(weatherChecker.isHumid(weatherChecker.humidityThreshold - 1)).to.be.false;
  });
});

describe('isFreezingAndHumid', function() {
  it('should return true if tbc is greater than humidity threshold', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold + 1)).to.be.true;
  });
  it('should return false if tbc is the same as humidityThreshold', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold)).to.be.false;
  });
  it('should return false if tbc is less than humidityThreshold', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold - 1)).to.be.false;
  });
});
