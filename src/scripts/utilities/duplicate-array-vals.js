'use strict';

/**
 * [exports description]
 * @param  {Array} array    [array to duplicate]
 * @param  {Number} times   [number of times to duplicate]
 * @return {Array}          [array]
 */
module.exports = function duplicateArray(array, times) {
  var newArray = [];
  for (var i = 0; i < times; i++) {
    newArray = newArray.concat(array);
  }
  return newArray;
};
