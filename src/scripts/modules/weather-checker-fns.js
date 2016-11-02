'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = {
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

  // @param temperatureInFrnht floating point
  isFine: function(temperatureInFrnht, windSpeed, cloudCover) {
    return frnhtToCelcius(temperatureInFrnht) > 20 && windSpeed < 10 && cloudCover < 0.2;
  },

  // @param temperatureInFrnht floating point
  isCold: function(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) < 8;
  },

  // @param temperatureInFrnht floating point
  isFreezing: function(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) < -2;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  isClement: function(cloudCover, windSpeed) {
    return cloudCover < 0.5 && windSpeed < 16;
  },

  // @param windSpeed floating point
  isWindy: function(windSpeed) {
    return windSpeed > 22;
  },
  // @param cloudCover floating point
  isCloudy: function(cloudCover) {
    return cloudCover > 0.6;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isStormy: function(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.5 && windSpeed > 9 && precipIntensity > 0.3;
  }
};
