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
  getOrdinal: function getOrdinal(num) {
    if (typeof num !== 'number' && typeof num !== 'string') {
      console.warn('getOrdinal expects a number or string. Received: ', typeof num);
      return false;
    }
    var _oSuffix = ['th','st','nd','rd'];
    var _remainder = num % 100;
    return num + (_oSuffix[(_remainder - 20) % 10] || _oSuffix[_remainder] || _oSuffix[0]);
  },
  strHasSpaceAtStart: function strHasSpaceAtStart(str) {
    var strArr = str.split('');
    if (strArr[0] === ' ') {
      return true;
    }
    return false;
  },
  rmSpaceFromStart: function rmSpaceFromStart(str) {
    if (this.strHasSpaceAtStart(str)) {
      return str.replace(/\s+/, '');
    }
    return str;
  },
  addSpacesToString: function addSpacesToString(string) {
    var strWithSpaces = string.replace(/([A-Z][a-z]+)/g, ' ' + '$&');
    var strWithNoSpaceAtStart = this.rmSpaceFromStart(strWithSpaces);
    return strWithNoSpaceAtStart;
  },
  removeSpacesFromString: function removeSpacesFromString(string) {
    return string.replace(/\s/g, '');
  },
  replaceCommasForHyphens: function replaceCommasForHyphens(string) {
    return string.replace(/(,+)/g, '-', '$&');
  },
  replaceHyphensForSpaces: function replaceHyphensForSpaces(string) {
    return string.replace(/(-+)/g, ' ', '$&');
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
