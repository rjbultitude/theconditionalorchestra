/* Contains all value ranges
  for reference and application usage
  also includes a method that returns
  the mean value -
  for cases where no condition data
  is available
  */

'use strict';

module.exports = {
    pitch: {
      min: 0.5,
      max: 2.0
    },
    //Volume arbitary scale
    volume: {
      min: 0.2,
      max: 1.0,
    },
    //Distorted volume arbitary scale
    distVolume: {
      min: 0.0,
      max: 0.6,
    },
    //Frequency
    freq: {
      min: 320,
      freqmax: 5000,
    },
    //Cloud cover as a percentage
    cloudCover: {
      min: 0,
      cloudCovermax: 1,
    },
    //Wind speed typically up to  32m/s
    speed: {
      min: 0,
      speedmax: 32,
    },
    //pressure in millibars
    pressure: {
      min: 980,
      max: 1050,
    },
    //visibility in metres
    visibility: {
      min: 0.1,
      visibilitymax: 10,
    },
    //Wind Bearing in degrees
    bearing: {
      min: 0,
      bearingmax: 360,
    },
    //Ozone in Dobson units
    ozone: {
      min: 230,
      ozonemax: 500
    },
    //humidity as a percentage
    humidity: {
      min: 0,
      humiditymax: 1
    },
    //dew point in farenheit
    dewPoint: {
      min: -20,
      dewPointmax: 72
    },
    //temperature in farenheit
    temperature: {
      min: -35,
      temperaturemax: 120
    },
    //apparent temperature in farenheit
    apparentTemp: {
      min: -20,
      max: 120
    },
    getMean: function getMeanFn(min, max, name) {
      console.log('The value of ' + name + ' was undefined');
      return (min + max) / 2;
    }
  };
