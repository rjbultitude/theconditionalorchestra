'use strict';

module.exports = function SoundCharacterConditions(name, cloudCover, windSpeed, pressure, visibility, temperature) {
	this.name = name;
	this.windSpeed = windSpeed;
	this.pressure = pressure;
	this.cloudCover = cloudCover;
	this.visibility = visibility;
	this.temperature = temperature;
};
