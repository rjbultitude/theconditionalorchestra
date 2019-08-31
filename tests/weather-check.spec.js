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
  it('should return true if humidity is greater than humidity threshold (mid) and temp is greater than 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid + 1, 100)).to.be.true;
  });
  it('should return false if humidity is equal to humidity threshold (mid) and temp is greater than 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid, 100)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid) and temp in Celcius is equal to 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid + 1, 60.8)).to.be.false;
  });
  it('should return false if humidity is equal than humidity threshold (mid) and temp is equal to 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid, 60.8)).to.be.false;
  });
  it('should return false if humidity is less than humidity threshold (mid) and temp is equal to 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid - 1, 60.8)).to.be.false;
  });
  it('should return false if humidity is less than humidity threshold (mid) and temp is less than 16 (in Celcius)', function() {
    expect(weatherChecker.isMuggy(weatherChecker.humidityThresholdMid - 1, 14)).to.be.false;
  });
});

describe('isSmoggy', function() {
  it('should return true if humidity is greater than humidity threshold (mid), temp is greater than 18 (in Celcius) and visibility is less than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid + 1, 100, 5)).to.be.true;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is greater than 18 (in Celcius) and visibility is equal to 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid, 100, 8)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is greater than 18 (in Celcius) and visibility is greater than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid + 1, 100, 9)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is equal to 18 (in Celcius) and visibility is less than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid, 64.4, 5)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is less than 18 (in Celcius) and visibility is less than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid - 1, 50, 5)).to.be.false;
  });
  it('should return false if humidity is equal to humidity threshold (mid), temp is greater than 18 (in Celcius) and visibility is less than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid, 100, 5)).to.be.false;
  });
  it('should return false if humidity is less than humidity threshold (mid), temp is greater than 18 (in Celcius) and visibility is less than 8', function() {
    expect(weatherChecker.isSmoggy(weatherChecker.humidityThresholdMid - 1, 100, 5)).to.be.false;
  });
});

describe('isArid', function() {
  it('should return true if humidity is lower than humidity threshold (mid), temp is greater than 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid - 1, 100, 0)).to.be.true;
  });
  it('should return false if humidity is lower than humidity threshold (mid), temp is greater than 20 (in Celcius) and precipitation is greater than zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid - 1, 100, 0.5)).to.be.false;
  });
  it('should return false if humidity is lower than humidity threshold (mid), temp is equal to 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid - 1, 68, 0)).to.be.false;
  });
  it('should return false if humidity is lower than humidity threshold (mid), temp is lower than 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid - 1, 64, 5)).to.be.false;
  });
  it('should return false if humidity is equal to humidity threshold (mid), temp is greater than 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid, 100, 0)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is greater than 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid + 1, 100, 0)).to.be.false;
  });
  it('should return false if humidity is equal to humidity threshold (mid), temp is equal to 20 (in Celcius) and precipitation is zero', function() {
    expect(weatherChecker.isArid(weatherChecker.humidityThresholdMid, 68, 0)).to.be.false;
  });
});

describe('isCrisp', function() {
  this.beforeAll(function() {
    this.zeroInCelcius = 32;
  });
  it('should return true if humidity is lower than humidity threshold (low) and temp is less than zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow - 1, 20)).to.be.true;
  });
  it('should return false if humidity is lower than humidity threshold (low), temp is equal to zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow - 1, this.zeroInCelcius)).to.be.false;
  });
  it('should return false if humidity is lower than humidity threshold (low), temp is greater than zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow - 1, 68)).to.be.false;
  });
  it('should return false if humidity is equal to humidity threshold (low), temp is less than zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow, 20)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is equal to zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow + 1, this.zeroInCelcius)).to.be.false;
  });
  it('should return false if humidity is greater than humidity threshold (mid), temp is less than zero (in Celcius)', function() {
    expect(weatherChecker.isCrisp(weatherChecker.humidityThresholdLow + 1, 20)).to.be.false;
  });
});

describe('isSirocco', function() {
  this.beforeAll(function() {
    this.tempInFrnht = 69.8;
    this.windSpeed = 20;
  });
  it('should return true if humidity is lower than humidity threshold (low) and temp is greater than 21 (in Celcius) and wind speed is greater than 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow - 1, this.tempInFrnht + 10, this.windSpeed + 1)).to.be.true;
  });
  it('should return false if humidity is lower than humidity threshold (low), temp is greater than 21 (in Celcius) and wind speed is equal to 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow - 1, this.tempInFrnht + 10), this.windSpeed).to.be.false;
  });
  it('should return false if humidity is lower than humidity threshold (low), temp is greater than 21 (in Celcius) and wind speed is less than 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow - 1, this.tempInFrnht + 10, 19)).to.be.false;
  });
  it('should return false if humidity is lower humidity threshold (low), temp is equal to 21 (in Celcius) and wind speed is greater than 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow - 1, this.tempInFrnht, this.windSpeed + 1)).to.be.false;
  });
  it('should return false if humidity is lower than humidity threshold (mid), temp is less than 21 (in Celcius) and wind speed is greater than 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow - 1, this.tempInFrnht - 10, this.windSpeed + 1)).to.be.false;
  });
  it('should return false if humidity is equal than humidity threshold (mid), temp is greater than 21 (in Celcius) and wind speed is greater than 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow , this.tempInFrnht + 10, this.windSpeed + 1)).to.be.false;
  });
  it('should return false if humidity is equal than humidity threshold (mid), temp is equal to 21 (in Celcius) and wind speed is equal to 20', function() {
    expect(weatherChecker.isSirocco(weatherChecker.humidityThresholdLow , this.tempInFrnht, this.windSpeed)).to.be.false;
  });
});

describe('isWindy', function() {
  it('should return true if wind speed is greater than 22', function() {
    expect(weatherChecker.isWindy(32)).to.be.true;
  });
  it('should return false if wind speed is equal to 22', function() {
    expect(weatherChecker.isWindy(22)).to.be.false;
  });
  it('should return false if wind speed is less than 22', function() {
    expect(weatherChecker.isWindy(12)).to.be.false;
  });
});

describe('isCloudy', function() {
  it('should return true if cloud cover is greater than 0.5', function() {
    expect(weatherChecker.isCloudy(0.9)).to.be.true;
  });
  it('should return false if cloud cover is equal to 0.5', function() {
    expect(weatherChecker.isCloudy(0.5)).to.be.false;
  });
  it('should return false if cloud cover is less than 0.5', function() {
    expect(weatherChecker.isCloudy(0.1)).to.be.false;
  });
});

describe('isVisbilityPoor', function() {
  it('should return true if visibility is less than 7.5', function() {
    expect(weatherChecker.isVisbilityPoor(7)).to.be.true;
  });
  it('should return false if visibility is equal to 7.5', function() {
    expect(weatherChecker.isVisbilityPoor(7.5)).to.be.false;
  });
  it('should return false if visibility is greater than 7.5', function() {
    expect(weatherChecker.isVisbilityPoor(8)).to.be.false;
  });
});

describe('isFoggy', function() {
  this.beforeAll(function() {
    this.tempInFrnht = 50;
  });
  it('should return true if visibility is less than 3.5', function() {
    expect(weatherChecker.isFoggy(3, this.tempInFrnht, this.tempInFrnht - 2)).to.be.true;
  });
  it('should return true if visibility is equal to 3.5 but temp (in Fahrenheit) minus dew point is less than to 4', function() {
    expect(weatherChecker.isFoggy(3.5, this.tempInFrnht, this.tempInFrnht - 2)).to.be.true;
  });
  it('should return true if visibility is greater than 3.5 but temp (in Fahrenheit) minus dew point is less than to 4', function() {
    expect(weatherChecker.isFoggy(4, this.tempInFrnht, this.tempInFrnht - 2)).to.be.true;
  });
  it('should return true if visibility is greater than 3.5 but temp (in Fahrenheit) minus dew point is equal to 4', function() {
    expect(weatherChecker.isFoggy(4, this.tempInFrnht, this.tempInFrnht - 4)).to.be.true;
  });
  it('should return false if visibility is greater than 3.5 but temp (in Fahrenheit) minus dew point is greater than 4', function() {
    expect(weatherChecker.isFoggy(4, this.tempInFrnht, this.tempInFrnht - 10)).to.be.false;
  });
});

describe('isCold', function() {
  this.beforeAll(function() {
    this.tempInFrnht = 53.6;
  });
  it('should return true if temp (in Celcius) is less than 12', function() {
    expect(weatherChecker.isCold(this.tempInFrnht - 5)).to.be.true;
  });
  it('should return true if temp (in Celcius) is equal to 12', function() {
    expect(weatherChecker.isCold(this.tempInFrnht)).to.be.true;
  });
  it('should return false if temp (in Celcius) is greater than 12', function() {
    expect(weatherChecker.isCold(this.tempInFrnht + 5)).to.be.false;
  });
});

describe('isFreezing', function() {
  this.beforeAll(function() {
    this.tempInFrnht = 30.2;
  });
  it('should return true if temp (in Celcius) is less than -1', function() {
    expect(weatherChecker.isFreezing(this.tempInFrnht - 5)).to.be.true;
  });
  it('should return false if temp (in Celcius) is greater than -1', function() {
    expect(weatherChecker.isFreezing(this.tempInFrnht + 5)).to.be.false;
  });
});

describe('isWayBelowFreezing', function() {
  this.beforeAll(function() {
    this.tempInFrnht = 14;
  });
  it('should return true if temp (in Celcius) is less than -1', function() {
    expect(weatherChecker.isWayBelowFreezing(this.tempInFrnht - 5)).to.be.true;
  });
  it('should return false if temp (in Celcius) is equal to -1', function() {
    expect(weatherChecker.isWayBelowFreezing(this.tempInFrnht)).to.be.false;
  });
  it('should return false if temp (in Celcius) is greater than -1', function() {
    expect(weatherChecker.isWayBelowFreezing(this.tempInFrnht + 5)).to.be.false;
  });
});

describe('isClement', function() {
  this.beforeAll(function() {
    this.cloudCover = 0.5;
    this.windSpeed = 12;
    this.precipIntensity = 0;
  });
  it('should return true if cloud cover is below 0.5, wind speed is less than 12 and precip intensity is zero', function() {
    expect(weatherChecker.isClement(this.cloudCover - 0.1, this.windSpeed - 1, this.precipIntensity)).to.be.true;
  });
  it('should return false if cloud cover is below 0.5, wind speed is less than 12 and precip intensity is greater than zero', function() {
    expect(weatherChecker.isClement(this.cloudCover - 0.1, this.windSpeed - 1, this.precipIntensity + 1)).to.be.false;
  });
  it('should return false if cloud cover is below, wind speed is equal to 12 and precip intensity is zero', function() {
    expect(weatherChecker.isClement(this.cloudCover - 0.1, this.windSpeed, this.precipIntensity)).to.be.false;
  });
  it('should return false if cloud cover is below, wind speed is greater than 12 and precip intensity is zero', function() {
    expect(weatherChecker.isClement(this.cloudCover - 0.1, this.windSpeed + 1, this.precipIntensity)).to.be.false;
  });
  it('should return false if cloud covet is equal to 0.5, wind speed is less than 12 and precip intensity is zero', function() {
    expect(weatherChecker.isClement(this.cloudCover, this.windSpeed - 1, this.precipIntensity)).to.be.false;
  });
  it('should return false if cloud cover is equal to 0.5, wind speed is equal to 12 and precip intensity is zero', function() {
    expect(weatherChecker.isClement(this.cloudCover, this.windSpeed, this.precipIntensity)).to.be.false;
  });
});

describe('isMild', function() {
  this.beforeAll(function() {
    this.temperatureInFrnht = 57.2; //14
    this.windSpeed = 12;
  });
  it('should return true if temperature (in Celcius) is greater than 14 and wind speed is less than 12', function() {
    expect(weatherChecker.isMild(this.temperatureInFrnht + 1, this.windSpeed - 1)).to.be.true;
  });
  it('should return true if temperature (in Celcius) is equal to 14 and wind speed is less than 12', function() {
    expect(weatherChecker.isMild(this.temperatureInFrnht, this.windSpeed - 1)).to.be.true;
  });
  it('should return false if temperature (in Celcius) is greater than 14 and wind speed is greater than 12', function() {
    expect(weatherChecker.isMild(this.temperatureInFrnht + 1, this.windSpeed + 1)).to.be.false;
  });
  it('should return false if temperature (in Celcius) is greater than 14 and wind speed is equal to 12', function() {
    expect(weatherChecker.isMild(this.temperatureInFrnht + 1, this.windSpeed)).to.be.false;
  });
  it('should return false if temperature (in Celcius) is less than 14 and wind speed is less than 12', function() {
    expect(weatherChecker.isMild(this.temperatureInFrnht - 1, this.windSpeed - 1)).to.be.false;
  });
});

describe('isMildAndBreezy', function() {
  this.beforeAll(function() {
    this.temperatureInFrnht = 57.2; //14
    this.windSpeed = 12;
  });
  it('should return true if temperature (in Celcius) is greater than 14 and wind speed is greater than 12', function() {
    expect(weatherChecker.isMildAndBreezy(this.temperatureInFrnht + 1, this.windSpeed + 1)).to.be.true;
  });
  it('should return true if temperature (in Celcius) is equal to 14 and wind speed is greater than 12', function() {
    expect(weatherChecker.isMildAndBreezy(this.temperatureInFrnht, this.windSpeed + 1)).to.be.true;
  });
  it('should return false if temperature (in Celcius) is greater than 14 and wind speed is less than 12', function() {
    expect(weatherChecker.isMildAndBreezy(this.temperatureInFrnht + 1, this.windSpeed - 1)).to.be.false;
  });
  it('should return false if temperature (in Celcius) is greater than 14 and wind speed is equal to 12', function() {
    expect(weatherChecker.isMildAndBreezy(this.temperatureInFrnht + 1, this.windSpeed)).to.be.false;
  });
  it('should return false if temperature (in Celcius) is less than 14 and wind speed is greater than 12', function() {
    expect(weatherChecker.isMildAndBreezy(this.temperatureInFrnht - 1, this.windSpeed + 1)).to.be.false;
  });
});

describe('isMildAndHumid', function() {
  this.beforeAll(function() {
    this.temperatureInFrnht = 57.2; //14
    this.windSpeed = 12;
    this.humidity = weatherChecker.humidityThreshold;
  });
  it('should return true if temperature (in Celcius) is greater than 14, wind speed is less than 12 and humidity is greater than humdity threshhold', function() {
    expect(weatherChecker.isMildAndHumid(this.temperatureInFrnht + 1, this.windSpeed - 1, this.humidity + 1)).to.be.true;
  });
});
