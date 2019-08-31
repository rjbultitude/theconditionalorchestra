/**
 * [exports function that converts farenheit to celcius]
 * @param  {[number]} temperatureInFahrenHeit [temperature in farenheit]
 * @return {[number]}                         [temperature in celcius]
 */
module.exports = function frnhtToCelcius(temperatureInFahrenHeit) {
  return (temperatureInFahrenHeit - 32) * 5/9;
};
