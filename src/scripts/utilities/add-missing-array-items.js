'use strict';

/**
 * [exports description]
 * @param  {Array} array    [array to duplicate]
 * @param  {Number} times   [number of times to duplicate]
 * @return {Array}          [array]
 */
module.exports = function addMissingArrayItems(array, difference, amountToAdd) {
  var _index = 0;
  var _amountToAdd = amountToAdd || 0;
  var _newArr = array.map(function(item) {
    return item;
  });
  var _finalArr = [];
  var _diffArr = [];
  var _newVal;
  console.log('adding ' + difference + ' number of missing items');
  // loop the number of times
  // needed to make the missing items
  for (var i = 0; i < difference; i++) {
    _newVal = _newArr[_index] + _amountToAdd;
    _diffArr.push(_newVal);
    //Start from 0 index
    //when there's no more items left
    if (_index === array.length - 1) {
      _index = 0;
      _amountToAdd += amountToAdd;
    }
    _index++;
  }
  _finalArr = _newArr.concat(_diffArr);
  return _finalArr;
};
