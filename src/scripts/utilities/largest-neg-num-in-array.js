'use strict';

/**
 * returns the largest positive number in a given array
 * @param  {[Array]} destArray     [the array to act on]
 * @param  {[Number]} pos          [the index to start at]
 * @param  {[Array]} arrayToInsert [the array to insert]
 * @return {[Array]}               [the returned array]
 */
module.exports = function getLargestNegNumInArr(arr) {
  return arr.reduce(function(prevVal, curVal) {
    if (curVal < prevVal) {
      prevVal = curVal;
    }
    return prevVal;
  }, 0);
};
