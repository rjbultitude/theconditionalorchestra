'use strict';

module.exports = function duplicateArray(newArray, array, times) {
  for (var i = 0; i < times; i++) {
    newArray = newArray.concat(array);
  }
  return newArray;
};
