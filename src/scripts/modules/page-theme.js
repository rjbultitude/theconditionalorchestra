'use strict';

var frnhtToCelcius = require('../utilities/frnht-to-celcius');
var summaryIcon = require('./summary-icon');

module.exports = function(lwData, wCheck) {

  var innerWrapperStr = 'innerwrapper';
  var outerWrapperStr = 'outerwrapper';
  var innerWrapper = document.querySelector('.' + innerWrapperStr);
  var outerWrapper = document.querySelector('.' + outerWrapperStr);
  var curThemeNameList = document.body.classList;
  var curThemeTypeList = innerWrapper.classList;
  var curThemeTimeList = outerWrapper.classList;

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

  // Removes any class names
  // except the selector for the element
  function removeClassNames(nodeClassList, domNode, classToKeep) {
    for (var className in nodeClassList) {
      if (nodeClassList.hasOwnProperty(className)) {
        if (nodeClassList[className] !== classToKeep) {
          domNode.classList.remove(nodeClassList[className]);
        }
      }
    }
  }

  // remove class names
  removeClassNames(curThemeNameList, document.body, '');
  removeClassNames(curThemeTypeList, innerWrapper, innerWrapperStr);
  removeClassNames(curThemeTimeList, outerWrapper, outerWrapperStr);
  // get class names
  var newThemeName = getThemeTempName();
  var newThemeType = getThemeTypeName();
  var newThemeTime = getThemeTimeName();
  console.log('newThemeName', newThemeName);
  console.log('newThemeType', newThemeType);
  console.log('newThemeTime', newThemeTime);
  // apply class names
  document.body.classList.add(newThemeName);
  outerWrapper.classList.add(newThemeTime);
  innerWrapper.classList.add(newThemeType);
};
