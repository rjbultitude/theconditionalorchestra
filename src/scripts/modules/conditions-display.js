'use strict';

var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
	var tempEls = document.querySelectorAll('[data-ref="temperature"]');
	var cCoverEls = document.querySelectorAll('[data-ref="cloudCover"]');
	var aPressureEls = document.querySelectorAll('[data-ref="airPressure"]');

	function ConditionValues(locationData) {
		this.temperature = locationData.temperature.value - 32 / 1.8;
		this.cloudCover = locationData.cloudCover.value * 100;
		this.airPressure = locationData.pressure.value;
	}

	channel.subscribe('userUpdate', function(locationData) {
		var conditionValues = new ConditionValues(locationData);

		for (var i = 0; i < tempEls.length; i++) {
			tempEls[i].insertAdjacentHTML('afterbegin', conditionValues.temperature.toFixed() + '');
		}
		for (var j = 0; j < cCoverEls.length; j++) {
			cCoverEls[j].insertAdjacentHTML('afterbegin', conditionValues.cloudCover.toFixed() + '');
		}
		for (var k = 0; k < aPressureEls.length; k++) {
			aPressureEls[k].insertAdjacentHTML('afterbegin', conditionValues.airPressure.toFixed() + '');
		}

	});
};
