'use strict';

module.exports = function arrayInsertAt(destArray, pos, arrayToInsert) {
  var args = [];
  args.push(pos);                           // where to insert
  args.push(0);                             // nothing to remove
  args = args.concat(arrayToInsert);        // add on array to insert
  destArray.splice.apply(destArray, args);  // splice it in
  return destArray;
};
