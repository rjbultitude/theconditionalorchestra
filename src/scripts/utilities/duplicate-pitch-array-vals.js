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
  var multiple = multiple || 12;
  for (var i = 0; i < times; i++) {
    mappedArray = array.map(function(item) {
      var _multiple = multiple;
      console.log('i', i);
      _multiple *= i;
      console.log('_multiple', _multiple);
      item += _multiple;
      return item;
    });
    console.log('mappedArray', mappedArray);
    newArray = newArray.concat(mappedArray);
    console.log('newArray', newArray);
    multiple *= 2;
  }
  return newArray;
};
