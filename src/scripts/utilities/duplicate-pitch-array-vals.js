'use strict';

/**
 * [exports description]
 * @param  {Array} array    [array to duplicate]
 * @param  {Number} times   [number of times to duplicate]
 * @return {Array}          [array]
 */
module.exports = function duplicateArray(array, times, multiple) {
  var newArray = [];
  var mappedArray = [];
  var multipleVal = multiple || 12;
  for (var i = 0; i < times; i++) {
    mappedArray = array.map(function(item) {
      var _multiple = multipleVal;
      _multiple *= i;
      item += _multiple;
      return item;
    });
    newArray = newArray.concat(mappedArray);
    multiple *= 2;
  }
  return newArray;
};
