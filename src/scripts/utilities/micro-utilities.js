/*
Utility functions
*/
module.exports = {
  // Is this size or smaller
  matchMediaMaxWidth: function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  },
  mapRange: function mapRange(value, low1, high1, low2, high2) {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] !== 'number') {
        console.warn('map range argument is not typeof number');
        return false;
      }
    }
    var _maxDiff = high2 - low2;
    return low2 + _maxDiff * (value - low1) / (high1 - low1);
  },
  getOrdinal: function getOrdinal(number) {
    var _oSuffix = ['th','st','nd','rd'];
    var _remainder = number % 100;
    return number + (_oSuffix[(_remainder - 20) % 10] || _oSuffix[_remainder] || _oSuffix[0]);
  },
  addSpacesToString: function addSpacesToString(string) {
    return string.replace(/([A-Z][a-z]+)/g, ' ' + '$&');
  },
  removeSpacesFromString: function removeSpacesFromString(string) {
    return string.replace(/\s/g, '');
  },
  replaceCommasForHyphens: function replaceCommasForHyphens(string) {
    return string.replace(/(,+)/g, '-', '$&');
  },
  containsWord: function containsWord(string, word) {
    return new RegExp('(?:[^.\w]|^|^\\W+)' + word +
      '(?:[^.\w]|\\W(?=\\W+|$)|$)').test(string);
  },
  strToLowerCase: function strToLowerCase(string) {
    return string.replace(/[A-Z]/g, function(match) {
      return match.toLowerCase();
    });
  },
  removeStrFromStart: function removeStrFromStart(stringToRemove, originalString) {
    var _pattern = new RegExp('^' + stringToRemove);
    return originalString.replace(_pattern, '');
  },
  addArrayItems: function addArrayItems(array) {
    return array.reduce(function(item, lastItem) {
      return lastItem + item;
    }, 0);
  },
  hasSixthSeventhNinth: function hasSixthSeventhNinth(intervalString) {
    var _hasSixth = /Sixth/;
    var _hasSeventh = /Seventh/;
    var _hasNinth = /Ninth/;
    return _hasSixth.test(intervalString) || _hasSeventh.test(intervalString) || _hasNinth.test(intervalString);
  }
};
