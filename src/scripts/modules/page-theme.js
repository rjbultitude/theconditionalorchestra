'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = function(lwData, wCheck) {

  var wrapper = document.querySelector('.innerwrapper');

  function getThemeTempName() {
    if (frnhtToCelcius(lwData.temperature.value) > 26) {
      return 'hot';
    } else if (frnhtToCelcius(lwData.temperature.value) > 14) {
      return 'warm';
    } else if (frnhtToCelcius(lwData.temperature.value) > 2) {
      return 'cold';
    } else {
      return 'freezing';
    }
  }

  function getThemeTypeName() {
    if (wCheck.isStormy) {
      return 'storm';
    } else if (wCheck.isPrecip) {
      return lwData.precipType;
    } else if (wCheck.isFoggy) {
      return 'fog';
    } else {
      return '';
    }

  }

  document.body.classList.add(getThemeTempName());
  wrapper.classList.add(getThemeTypeName() || null);
};
