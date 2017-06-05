'use strict';

module.exports = function(lwData) {
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
  var currIcon = lwData.icon;
  var day = 'day';
  var night = 'night';
  var dayRe = new RegExp(day, 'g');
  var nightRe = new RegExp(night, 'g');
  var dayRegex = /dayRe$/;
  var nightRegex = /nightRe$/;

  // To use with themes
  function extractTime() {
    if (currIcon.match(dayRe)) {
      return day;
    } else if (currIcon.match(nightRe)) {
      return night;
    } else {
      return '';
    }
  }

  // To use with this apps icons
  function approximateIcons() {
    return iconStrs.filter(function(icon) {
      console.log('dayRe.test(icon)', dayRe.test(icon));
      console.log('nightRe.test(icon)', nightRe.test(icon));
      if (!dayRe.test(icon) || !nightRe.test(icon)) {
        return icon;
      }
    });
  }

  console.log(extractTime());
  console.log(approximateIcons());
};
