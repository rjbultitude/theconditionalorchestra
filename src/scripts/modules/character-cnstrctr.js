'use strict';

module.exports = function SoundCharacterConditions(name, cloudCover, speed, pressure, visibility, temperature) {
	this.name = name;
	this.speed = speed;
	this.pressure = pressure;
	this.cloudCover = cloudCover;
	this.visibility = visibility;
	this.temperature = temperature;
};
