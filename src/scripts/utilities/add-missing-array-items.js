'use strict';

/**
 * [exports description]
 * @param  {Array} array        [array to duplicate]
 * @param  {Number} difference  [number of items to duplicate]
 * @param  {Number} amountToAdd  [numeric value to add to each duplicated item]
 * @param  {Number} repeat  [number of times to repeat the whole process]
 * @return {Array}          [array]
 */
module.exports = function addMissingArrayItems(array, difference, amountToAdd, repeat) {
  //error check
  if (typeof difference !== 'number') {
    console.error('difference is not a number');
  }
  var _index = 0;
  var _newArr = array.map(function(item) {
    return item;
  });
  var _finalArr = [];
  var _diffArr = [];
  var _newVal;
  var _repeatPoint = (array.length * repeat) - 1;
  console.log('adding ' + difference + ' number of missing items');
  // loop the number of times
  // needed to make the missing items
  addMissingLoop:
  for (var i = 0; i < difference; i++) {
    _newVal = _newArr[_index];
    _diffArr.push(_newVal);
    //Start from 0 index
    //when there's no more items left
    if (i === _repeatPoint) {
      _index = 0;
      amountToAdd = 0;
      continue addMissingLoop;
    } else if (_index === array.length - 1) {
      _index = 0;
      amountToAdd += amountToAdd;
      continue addMissingLoop;
    }
    _index++;
  }
  //Amend numeric values?
  _diffArr = _diffArr.map(function(item) {
    if (typeof amountToAdd === 'number' && typeof item === 'number') {
      return item + amountToAdd;
    } else {
      return item;
    }
  });
  _finalArr = _newArr.concat(_diffArr);
  return _finalArr;
};
