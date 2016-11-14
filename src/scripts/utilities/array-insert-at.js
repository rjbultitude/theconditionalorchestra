'use strict';

/**
 * [exports a function that inserts an array into another at any given index]
 * @param  {[Array]} destArray     [the array to act on]
 * @param  {[Number]} pos          [the index to start at]
 * @param  {[Array]} arrayToInsert [the array to insert]
 * @return {[Array]}               [the returned array]
 */
module.exports = function arrayInsertAt(destArray, pos, arrayToInsert) {
  // var _newDestArray = destArray.map(function(item) {
  //   return item;
  // });
  var _args = [];
  _args.push(pos);                           // where to insert
  _args.push(0);                             // nothing to remove
  _args = _args.concat(arrayToInsert);        // add on array to insert
  destArray.splice.apply(destArray, _args);  // splice it in
  return destArray;
};
