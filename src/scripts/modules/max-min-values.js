'use strict';

module.exports = {
    //Pitch arbitary scale
    pitchMin: 0.5,
    pitchMax: 2.0,
    //Volume arbitary scale
    volumeMin: 0.2,
    volumeMax: 1.0,
    //Distorted volume arbitary scale
    distVolumeMin: 0.0,
    distVolumeMax: 0.6,
    //Frequency
    freqMin: 320,
    freqMax: 5000,
    //Cloud cover as a percentage
    cloudCoverMin: 0,
    cloudCoverMax: 1,
    //Wind speed typically up to  32m/s
    speedMin: 0,
    speedMax: 32,
    //pressure in millibars
    pressureMin: 980,
    pressureMax: 1050,
    //visibility in metres
    visibilityMin: 0.1,
    visibilityMax: 10,
    //Wind Bearing in degrees
    bearingMin: 0,
    bearingMax: 360,
    //Ozone in Dobson units
    ozoneMin: 230,
    ozoneMax: 500,
    //humidity as a percentage
    humidityMin: 0,
    humidityMax: 1,
    //dew point in farenheit
    dewPointMin: -20,
    dewPointMax: 72,
    //temperature in farenheit
    temperatureMin: -35,
    temperatureMax: 120,
    //apparent temperature in farenheit
    apparentTempMin: -20,
    apparentTempMax: 120,
    getMean: function getMeanFn(min, max, name) {
      console.log('The value of ' + name + ' was undefined');
      return (min + max) / 2;
    }
  };
