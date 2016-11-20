'use strict';

/**
 * [exports a function that inserts an array into another at any given index]
 * @param  {[Array]} destArray     [the array to act on]
 * @param  {[Number]} pos          [the index to start at]
 * @param  {[Array]} arrayToInsert [the array to insert]
 * @return {[Array]}               [the returned array]
 */
module.exports = function getLargestNumInArr(arr) {
  return arr.reduce(function(prevVal, curVal) {
    if (curVal > prevVal) {
      prevVal = curVal;
    }
    return prevVal;
  }, 0);
};
