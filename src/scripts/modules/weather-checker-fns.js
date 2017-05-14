'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = {
  /**
   * Single concept items
   */
  // @param precipType String
  // @param precipIntensity floating point
  isPrecip: function isPrecip(precipType, precipIntensity) {
    //TODO do we need this check?
    if (precipType !== undefined) {
      return precipIntensity > 0;
    } else {
      console.log('No precipitation type value');
      return false;
    }
  },

  isHumid: function isHumid(humidity) {
    return humidity > 0.57;
  },

  isMuggy: function isMuggy(humidity, temperatureInFrnht) {
    return humidity > 0.48 && frnhtToCelcius(temperatureInFrnht) > 16;
  },

  isSmoggy: function isSmoggy(humidity, temperatureInFrnht, visibility) {
    return humidity > 0.45 && frnhtToCelcius(temperatureInFrnht) > 18 && visibility < 8;
  },

  isArid: function isArid(humidity, temperatureInFrnht, precipIntensity) {
    return humidity < 0.35 && frnhtToCelcius(temperatureInFrnht) > 20 && precipIntensity === 0;
  },

  isCrisp: function isCrisp(humidity, temperatureInFrnht) {
    return humidity < 0.4 && frnhtToCelcius(temperatureInFrnht) < 0;
  },

  isSirocco: function isSirocco(humidity, temperatureInFrnht, windSpeed) {
    return humidity < 0.4 && frnhtToCelcius(temperatureInFrnht) > 21 && windSpeed > 20;
  },

  // @param windSpeed floating point
  isWindy: function isWindy(windSpeed) {
    return windSpeed > 22;
  },

  // @param cloudCover floating point
  isCloudy: function isCloudy(cloudCover) {
    return cloudCover > 0.5;
  },

  isVisbilityPoor: function isVisbilityPoor(visibility) {
    return visibility < 8;
  },

  /**
   * temperature
   */
  // @param temperatureInFrnht floating point
  isCold: function isCold(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) <= 12;
  },

  // @param temperatureInFrnht floating point
  isFreezing: function isFreezing(temperatureInFrnht) {
    return frnhtToCelcius(temperatureInFrnht) < -1;
  },

  /**
   * Broader concept conditions
   */

  // @param cloudCover floating point
  // @param windSpeed floating point
  isClement: function isClement(cloudCover, windSpeed, precipIntensity) {
   return cloudCover < 0.5 && windSpeed < 12 && precipIntensity === 0;
  },

  // @param temperatureInFrnht floating point
  // @param windSpeed floating point
  isMild: function isMild(temperatureInFrnht, windSpeed) {
    return frnhtToCelcius(temperatureInFrnht) >= 14 && windSpeed < 12;
  },

  isMildAndHumid: function isMild(temperatureInFrnht, windSpeed, humidity) {
    return frnhtToCelcius(temperatureInFrnht) >= 14 && windSpeed < 12 && humidity > 0.57;
  },

  // @param temperatureInFrnht floating point
  isFine: function isFine(cloudCover, windSpeed, temperatureInFrnht) {
   return frnhtToCelcius(temperatureInFrnht) > 20 && windSpeed < 10 && cloudCover <= 0.3;
  },

  isSublime: function isSublime(cloudCover, windSpeed, temperatureInFrnht) {
   return frnhtToCelcius(temperatureInFrnht) > 26 && windSpeed < 8 && cloudCover <= 0.15;
  },

  // @param temperatureInFrnht floating point
  // @param windSpeed floating point
  isBitter: function isBitter(temperatureInFrnht, windSpeed) {
    return frnhtToCelcius(temperatureInFrnht) < 3 && windSpeed > 23;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isStormy: function isStormy(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.5 && windSpeed > 32 || precipIntensity >= 0.39;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipIntensity floating point
  isViolentStorm: function isViolentStorm(cloudCover, windSpeed, precipIntensity) {
    return cloudCover > 0.8 && windSpeed > 60 && precipIntensity > 0.4;
  },

  // @param cloudCover floating point
  // @param windSpeed floating point
  // @param precipProbability floating point
  isOminous: function isOminous(cloudCover, nearestStormDistance, precipProbability) {
    return cloudCover > 0.5 && nearestStormDistance < 10 && precipProbability > 0;
  }
};
