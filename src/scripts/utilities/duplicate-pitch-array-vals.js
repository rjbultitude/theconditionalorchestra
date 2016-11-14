'use strict';

/**
 * [exports description]
 * @param  {Array} array    [array to duplicate]
 * @param  {Number} times   [number of times to duplicate]
 * @return {Array}          [array]
 */
module.exports = function duplicateAndPitchArray(array, times, multiple) {
  var _newArray = [];
  var _mappedArray = [];
  var _multipleVal = multiple || 12;
  for (var i = 0; i < times; i++) {
  _mappedArray = array.map(function(item) {
      var _multiple = _multipleVal;
      _multiple *= i;
      item += _multiple;
      return item;
    });
    _newArray = _newArray.concat(_mappedArray);
    multiple *= 2;
  }
  return _newArray;
};
