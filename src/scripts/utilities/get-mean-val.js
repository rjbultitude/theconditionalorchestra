'use strict';
module.exports = function getMean(min, max, name, wasUndefined) {
  if (wasUndefined) {
    console.log('The value of ' + name + ' was undefined');
  }
  return (min + max) / 2;
};
