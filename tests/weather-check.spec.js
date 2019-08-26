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
  this.beforeAll(function() {
    // -1.111 degrees Celcius
    this.tempInFahrenheit = 30;
  });
  it('should return true if humidity is greater than humidity threshold and temp in celcius is less than -1', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold + 1, this.tempInFahrenheit)).to.be.true;
  });
  it('should return false if humidity is equal to humidity threshold and temp in celcius is less than -1', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold, this.tempInFahrenheit)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold and temp in celcius is greater than -1', function() {
    expect(weatherChecker.isFreezingAndHumid(weatherChecker.humidityThreshold + 1, this.tempInFahrenheit + 10)).to.be.false;
  });
});

describe('isMuggy', function() {
  it('should return true if humidity is greater than humidity threshold (mid) and temp is greater than 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid + 1, 100)).to.be.true;
  });
  it('should return false if humidity is equal to humidity threshold (mid) and temp is greater than 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid, 100)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid) and temp in Celcius is equal to 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid + 1, 60.8)).to.be.false;
  });
  it('should return false if humidity is equal than humidity threshold (mid) and temp is equal to 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid, 60.8)).to.be.false;
  });
  it('should return false if humidity is less than humidity threshold (mid) and temp is equal to 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid - 1, 60.8)).to.be.false;
  });
  it('should return false if humidity is less than humidity threshold (mid) and temp is less than 16', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid - 1, 14)).to.be.false;
  });
});
