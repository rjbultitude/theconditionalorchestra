module.exports = function makeFibonacciSequence(startNumber, sequenceSize) {
  var _sequence = [startNumber, startNumber];
  // Find start pos
  var start = _sequence.length - 1;
  var j;
  var _indexPos1;
  var _indexPos2;
  var _newNumber;

  for (var i = start; i < sequenceSize; i++) {
    // Store prev position
    j = i - 1;
    _indexPos1 = _sequence[j];
    _indexPos2 = _sequence[i];
    _newNumber = _indexPos1 + _indexPos2;
    _sequence.push(_newNumber);
  }
  _sequence.shift();
  return _sequence;
};
