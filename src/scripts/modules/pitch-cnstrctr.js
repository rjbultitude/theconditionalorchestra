'use strict';

module.exports = function ConditionsPitchValues(name, value, min, max, mappedValue) {
	this.name = name;
	this.value = value;
	this.min = min;
	this.max = max;
	this.mappedValue = mappedValue;
};
