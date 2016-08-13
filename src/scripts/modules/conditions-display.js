'use strict';

var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
	var tempEl = document.querySelector('[data-ref=temperature]').querySelector('[data-ref=value]');
	var cCoverEl = document.querySelector('[data-ref=cloudCover]').querySelector('[data-ref=value]');
	var aPressureEl = document.querySelector('[data-ref=airPressure]').querySelector('[data-ref=value]');

	function ConditionValues(locationData) {
		console.log('locationData.temperature.value farenheight', locationData.temperature.value);
		this.temperature = (locationData.temperature.value - 32) * 5/9;
		this.cloudCover = locationData.cloudCover.value * 100;
		this.airPressure = locationData.pressure.value;
	}

	channel.subscribe('userUpdate', function(locationData) {
		var conditionValues = new ConditionValues(locationData);
		tempEl.innerHTML = conditionValues.temperature.toFixed() + '';
		cCoverEl.innerHTML = conditionValues.cloudCover.toFixed() + '';
		aPressureEl.innerHTML = conditionValues.airPressure.toFixed() + '';
	});

  channel.subscribe('stop', function(locationData) {
		tempEl.innerHTML = '';
		cCoverEl.innerHTML = '';
		aPressureEl.innerHTML = '';
	});
};
