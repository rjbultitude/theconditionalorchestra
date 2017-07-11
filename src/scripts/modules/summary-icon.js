'use strict';

module.exports = function(lwData, hide) {
  var iconStrs = [
    'clear-day',
    'clear-night',
    'rain',
    'snow',
    'sleet',
    'wind',
    'fog',
    'cloudy',
    'partly-cloudy-day',
    'partly-cloudy-night'
  ];
  var day = 'day';
  var night = 'night';
  var dayRe = new RegExp(day, 'g');
  var nightRe = new RegExp(night, 'g');
  var dayRegex = /dayRe$/;
  var nightRegex = /nightRe$/;
  // DOM
  var summaryWordCont = document.getElementById('summary-word');
  var summaryIconCont = document.getElementById('summary-icon');

  // To use with themes
  function extractTime(currIcon) {
    if (currIcon.match(dayRe)) {
      return day;
    } else if (currIcon.match(nightRe)) {
      return night;
    } else {
      return '';
    }
  }

  // To use with this apps icons
  function approximateIcons(currIcon) {
    if (currIcon === 'clear-day') {
      return 'sun';
    } else if (currIcon === 'fog') {
      return 'visibility';
    } else if (dayRe.test(currIcon) || nightRe.test(currIcon)) {
      return 'weather';
    }
    for (var icon in iconStrs) {
      if (icon === currIcon) {
        return icon;
      } else {
        return 'weather';
      }
    }
  }

  function outputSummary() {
    summaryWordCont.innerHTML = lwData.summary;
    summaryIconCont.innerHTML = '<img src="/img/' + approximateIcons(lwData.icon) + '-icon.svg" />';
  }

  function hideSummary() {
    summaryWordCont.innerHTML = '';
    summaryIconCont.innerHTML = '';
  }

  if (hide) {
    hideSummary();
  } else {
    outputSummary();
  }
};
