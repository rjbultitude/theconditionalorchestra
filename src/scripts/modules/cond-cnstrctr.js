'use strict';

module.exports = function ConditionsValues(speed, bearing, ozone, visibility, pressure, humidity, cloudCover, dewPoint, temperature, apparentTemp, name) {
	this.speed = speed;
	this.bearing = bearing;
	this.ozone = ozone;
	this.visibility = visibility;
	this.pressure = pressure;
	this.humidity = humidity;
	this.cloudCover = cloudCover;
	this.dewPoint = dewPoint;
	this.temperature = temperature;
	this.apparentTemp = apparentTemp;
	this.name = name;
};
