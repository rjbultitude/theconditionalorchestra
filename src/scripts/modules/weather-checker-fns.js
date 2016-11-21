'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = {
  /**
   * Single concept items
   */
  // @param precipType String
  // @param precipIntensity floating point
  isPrecip: function(precipType, precipIntensity) {
    if (precipType !== undefined) {
      return precipIntensity > 0;
    } else {
      console.log('No precipitation type value');
      return false;
    }
  },

  isHumid: function(humidity) {
    return humidity > 0.4;
  },


  // @param windSpeed floating point
  isWindy: function(windSpeed) {
    return windSpeed > 14;
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
   return frnhtToCelcius(temperatureInFrnht) > 20 && windSpeed < 10 && cloudCover < 0.25;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  isClement: function(cloudCover, windSpeed, precipIntensity) {
    return cloudCover < 0.5 && windSpeed < 16 && precipIntensity === 0;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isStormy: function(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.5 && windSpeed > 18 && precipIntensity > 0.3;
  }
};
