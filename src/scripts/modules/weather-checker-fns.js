'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = {
  /**
   * Single concept items
   */
  // @param precipType String
  // @param precipIntensity floating point
  isPrecip: function(precipType, precipIntensity) {
    //TODO do we need this check?
    if (precipType !== undefined) {
      return precipIntensity > 0;
    } else {
      console.log('No precipitation type value');
      return false;
    }
  },

  isHumid: function(humidity) {
    return humidity > 0.57;
  },

  isMuggy: function(humidity, temperatureInFrnht) {
    return humidity > 0.4 && frnhtToCelcius(temperatureInFrnht) > 15;
  },

  isArid: function(humidity, temperatureInFrnht) {
    return humidity < 0.4 && frnhtToCelcius(temperatureInFrnht) > 15;
  },

  isCrisp: function(humidity, temperatureInFrnht) {
    return humidity < 0.4 && frnhtToCelcius(temperatureInFrnht) < 0;
  },

  // @param windSpeed floating point
  isWindy: function(windSpeed) {
    return windSpeed > 22;
  },
  // @param cloudCover floating point
  isCloudy: function(cloudCover) {
    return cloudCover > 0.5;
  },

  /**
   * temperature
   */
  // @param temperatureInFrnht floating point
  isCold: function(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) <= 12;
  },

  // @param temperatureInFrnht floating point
  isFreezing: function(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) < -1;
  },

  /**
   * Broad concept conditions
   */
  // @param temperatureInFrnht floating point
  isFine: function(cloudCover, windSpeed, temperatureInFrnht) {
   return frnhtToCelcius(temperatureInFrnht) > 20 && windSpeed < 10 && cloudCover <= 0.32;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  isClement: function(cloudCover, windSpeed, precipIntensity, humidity) {
    return cloudCover < 0.5 && windSpeed < 12 && precipIntensity === 0 && humidity < 0.57;
  },

  // @param temperatureInFrnht floating point
  // @param windSpeed floating point
  isBitter: function(temperatureInFrnht, windSpeed) {
    return frnhtToCelcius(temperatureInFrnht) < 3 && windSpeed > 23;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isStormy: function(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.5 && windSpeed > 32 && precipIntensity > 0.3;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isViolentStorm: function(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.8 && windSpeed > 60 && precipIntensity > 0.4;
  },

  isPending: function(cloudCover, windSpeed, precipProbability) {
    return cloudCover > 0.5 && windSpeed > 18 && precipProbability > 0;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipProbability floating point
  isOminous: function(cloudCover, windSpeed, precipProbability) {
    return cloudCover > 0.5 && windSpeed > 18 && precipProbability > 0;
  }
};
