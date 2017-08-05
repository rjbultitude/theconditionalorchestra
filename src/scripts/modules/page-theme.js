'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var summaryIcon = require('./summary-icon');

module.exports = function(lwData, wCheck) {

  var innerwrapperStr = 'innerwrapper';
  var wrapper = document.querySelector('.' + innerwrapperStr);
  var curThemeTempName = document.body.classList['0'];
  console.log('curThemeTempName', curThemeTempName);
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
      return lwData.precipType || 'rain';
    } else if (wCheck.isFoggy) {
      return 'fog';
    } else {
      return 'null';
    }
  }

  function getThemeTimeName() {
    return summaryIcon.extractTime(lwData.icon);
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

  document.body.classList = '';
  removeThemeType();
  var newThemeName = getThemeTempName();
  var newThemeType = getThemeTypeName();
  var newThemeTime = getThemeTimeName();
  console.log('newThemeTime', newThemeTime);
  console.log('newThemeTime', typeof newThemeTime);
  document.body.classList.add(newThemeName);
  document.body.classList.add(newThemeTime);
  wrapper.classList.add(newThemeType);
};
