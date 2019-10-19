var mocha = require('mocha');
var expect = require('chai').expect;
var frnhtToCelcius = require('../../src/scripts/utilities/frnht-to-celcius.js');

describe('fahrenheit to celcius', function() {
  this.beforeAll(function() {
    // zero degrees Celcius
    this.tempInFahrenheit = 32;
  });
  it('should return a floating point number with number as argument', function() {
    expect(frnhtToCelcius(50)).to.be.a('number');
  });
  it('should return zero with 32 degrees fahrenheit', function() {
    expect(frnhtToCelcius(this.tempInFahrenheit)).to.equal(0);
  });
  it('should return 10 with 50 degrees fahrenheit', function() {
    expect(frnhtToCelcius(50)).to.equal(10);
  });
});
