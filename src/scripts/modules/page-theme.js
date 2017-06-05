'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');

module.exports = function(lwData, wCheck) {

  var innerwrapperStr = 'innerwrapper';
  var wrapper = document.querySelector('.' + innerwrapperStr);
  var curThemeTempName = document.body.classList['0'];
  var curThemeTypeList = wrapper.classList;

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

  function removeThemeType() {
    for (var className in curThemeTypeList) {
      if (curThemeTypeList.hasOwnProperty(className)) {
        if (curThemeTypeList[className] !== innerwrapperStr) {
          wrapper.classList.remove(curThemeTypeList[className]);
        }
      }
    }
  }

  if (curThemeTempName) {
    document.body.classList.remove(curThemeTempName);
  }
  removeThemeType();
  var newThemeName = getThemeTempName();
  var newThemeType = getThemeTypeName();
  document.body.classList.add(newThemeName);
  wrapper.classList.add(newThemeType);
};
