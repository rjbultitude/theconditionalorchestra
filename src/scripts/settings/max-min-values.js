/* Contains all value ranges
  for reference and application usage
  also includes a method that returns
  the mean value -
  for cases where no condition data
  is available
  */

'use strict';

module.exports = {
  wParams: {
    //Cloud cover as a percentage
    cloudCover: {
      min: 0,
      max: 1
    },
    //Wind speed typically up to 24 metres per second
    windSpeed: {
      min: 0,
      max: 33
    },
    //pressure in millibars
    pressure: {
      min: 920,
      max: 1080
    },
    //visibility in miles
    visibility: {
      min: 0.1,
      max: 10
    },
    //Wind Bearing in degrees
    windBearing: {
      min: 0,
      max: 360
    },
    //Ozone in Dobson units
    ozone: {
      min: 220,
      max: 500
    },
    //humidity as a percentage
    humidity: {
      min: 0,
      max: 1
    },
    //dew point in farenheit
    dewPoint: {
      min: -20,
      max: 72
    },
    //temperature in farenheit
    temperature: {
      min: -35,
      max: 120
    },
    //apparent temperature in farenheit
    apparentTemperature: {
      min: -35,
      max: 120
    },
    precipIntensity: {
      min: 0,
      max: 0.5
    },
    precipProbability: {
      min: 0,
      max: 1
    },
    nearestStormBearing: {
      min: 0,
      max: 360
    },
    nearestStormDistance: {
      min: 0,
      max: 200
    }
  }
};
