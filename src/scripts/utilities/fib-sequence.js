'use strict';

module.exports = function makeFibonacciSequence(startNumber, sequenceSize) {
  var _sequence = [startNumber, startNumber];
  //Find start pos
  var start = _sequence.length - 1;
  for (var i = start; i < sequenceSize; i++) {
    //Store prev position
    var j = i - 1;
    var _indexPos1 = _sequence[j];
    var _indexPos2 = _sequence[i];
    var _newNumber = _indexPos1 + _indexPos2;
    _sequence.push(_newNumber);
  }
  _sequence.shift();
  return _sequence;
};
