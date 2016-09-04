'use strict';

/**
 * [exports a function that inserts an array into another at any given index]
 * @param  {[Array]} destArray     [the array to act on]
 * @param  {[Number]} pos           [the index to start at]
 * @param  {[Array]} arrayToInsert [the array to insert]
 * @return {[Array]}               [the returned array]
 */
module.exports = function arrayInsertAt(destArray, pos, arrayToInsert) {
  var args = [];
  args.push(pos);                           // where to insert
  args.push(0);                             // nothing to remove
  args = args.concat(arrayToInsert);        // add on array to insert
  destArray.splice.apply(destArray, args);  // splice it in
  return destArray;
};
