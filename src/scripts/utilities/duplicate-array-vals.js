

/**
 * [exports description]
 * @param  {Array} array    [array to duplicate]
 * @param  {Number} times   [number of times to duplicate]
 * @return {Array}          [array]
 */
module.exports = function duplicateArray(array, times) {
  if (Array.isArray(array) === false) {
    console.warn('array argument was not an array');
    return false;
  }
  if (typeof times !== 'number') {
    console.warn('times argument was not typeof number. Using default value: 2');
    times = 2;
  }
  var newArray = [];
  for (var i = 0; i < times; i++) {
    newArray = newArray.concat(array);
  }
  return newArray;
};
