'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var classListChain = require('../utilities/class-list-chain');

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
      return 'null';
    }

  }

  var curThemeName = document.body.classList['0'];
  var curThemeType = wrapper.classList['0'];
  if (curThemeName) {
    document.body.classList.remove(curThemeName);
    wrapper.classList.remove(curThemeType);
  }
  var newThemeName = getThemeTempName();
  var newThemeType = getThemeTypeName();
  document.body.classList.add(newThemeName);
  wrapper.classList.add(newThemeType);
};
