

module.exports = (function() {
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

  // DOM
  var summaryWordCont = document.getElementById('summary-desc');
  var summaryIconCont = document.getElementById('summary-icon');

  function isDay(currIcon) {
    return /day$/.test(currIcon);
  }

  function isNight(currIcon) {
    return /night$/.test(currIcon);
  }

  // To use with themes
  function extractTime(currIcon) {
    if (isDay(currIcon)) {
      return 'day';
    } else if (isNight(currIcon)) {
      return 'night';
    } else {
      return 'null';
    }
  }

  // To use with this apps icons
  function approximateIcons(currIcon) {
    console.log('currIcon', currIcon);
    if (currIcon === 'clear-day') {
      return 'sun';
    } else if (currIcon === 'fog') {
      return 'visibility';
    } else if (isDay(currIcon)) {
      return 'weather';
    }
    for (var i = 0, length = iconStrs.length; i < length; i++) {
      if (iconStrs[i] === currIcon) {
        return currIcon;
      }
    }
    return 'weather';
  }

  function outputSummary(lwData) {
    var _pathString = '/img/' + approximateIcons(lwData.icon) + '-icon.svg';
    console.log('_pathString', _pathString);
    summaryWordCont.innerHTML = lwData.summary;
    summaryIconCont.innerHTML = '<img src="' + _pathString + '" alt="' + lwData.summary +'" />';
  }

  function hideSummary() {
    summaryWordCont.innerHTML = '';
    summaryIconCont.innerHTML = '';
  }

  return {
    extractTime: extractTime,
    outputSummary: outputSummary,
    hideSummary: hideSummary
  };
})();
