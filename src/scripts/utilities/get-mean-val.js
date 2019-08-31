
/**
 * [exports description]
 * @param  {[number]} min          [minimum number in range]
 * @param  {[number]} max          [maximum number in range]
 * @param  {[string]} name         [name of property]
 * @param  {[boolean]} wasUndefined [whether the property was undefined]
 * @return {[number]}              [mean value in range]
 */
module.exports = function getMean(min, max, name, wasUndefined) {
  if (wasUndefined) {
    console.log('The value of ' + name + ' was undefined');
  }
  return (min + max) / 2;
};
