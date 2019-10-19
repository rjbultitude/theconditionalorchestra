module.exports = function makeFibonacciSequence(startNumber, sequenceSize) {
  if (typeof startNumber !== 'number' || typeof sequenceSize !== 'number') {
    console.warn('makeFibonacciSequence arguments weren\'t numbers');
    return undefined;
  }
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
  console.log('_sequence', _sequence);
  return _sequence;
};
