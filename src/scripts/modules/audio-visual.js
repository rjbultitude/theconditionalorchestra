/*
	This module loads and converts the data
	Three locations are used as the data sources

	Each location's properties are used to inform the shape of the sounds
	Wind bearing is mapped to used for the pitch
	Wind speed for volume

	When new data is loaded the pitch of each note is retuned
	This is done by ensuring the loop is re-entered after each pass of all three objects
	However it relies on a for loop, which is run at the speed of the client's computer
	This flaw needs addressing
 */

/*
	Location Harminiser
 */

'use strict';

var P5 = require('../libs/p5');
require('../libs/p5.sound');
var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
	//Frequency of data polling
	var polling = false;
	var fetchingUsrLoc = false;
	//String consts
	var pollingMsgStr = 'Fetching new weather data';
	//Els
	var messageBlock = document.getElementById('message-block');

	/*
		Ranges to be mapped
	 */
	//Wind Bearing in degrees
	var bearingMin = 0;
	var bearingMax = 360;
	//Pitch arbitary scale
	var pitchMin = 0.1;
	var pitchMax = 2.0;
	//Wind speed typically up to  32m/s
	var speedMin = 0;
	var speedMax = 32;
	//Volume arbitary scale
	var volumeMin = 0.1;
	var volumeMax = 1.0;
	//Ozone in Dobson units
	var ozoneMin = 230;
	var ozoneMax = 500;
	//visibility in metres
	var visibilityMin = 0.1;
	var visibilityMax = 10;
	//pressure in millibars
	var pressureMin = 980;
	var pressureMax = 1050;
	//humidity as a percentage
	var humidityMin = 0;
	var humidityMax = 1;
	//Cloud cover as a percentage
	var cloudCoverMin = 0;
	var cloudCoverMax = 1;
	//dew point in farenheit
	var dewPointMin = 20;
	var dewPointMax = 72;
	//temperature in farenheit
	var temperatureMin = -20;
	var temperatureMax = 120;
	//apparent temperature in farenheit
	var apparentTempMin = -20;
	var apparentTempMax = 120;
	//Shape size
	var radiusMin = 40;
	var radiusMax = 100;
	var lowerTextPos = radiusMax + 36;
	//Pitch diffs global
	var pitchDiffArr = [];
	//line length
	var bearingLineLength = 100;

	//main app init
	function init(locationData) {

		//TO DO store offline
		//localStorage.setItem('locationData' , locationData);

		var myP5 = new P5(function(sketch) {

			//The rate at which to detune
			//TO DO Needs to be refactored to be
			//independant of the processor speed
			//The higher the number the bigger the loop
			//amend with caution
			var factor = 20;

			function updateSingleLoc(newData) {
				locationData.newBearing = newData.bearing;
				locationData.newSpeed = newData.speed;
				locationData.newName = newData.name;
				//Manage audio/visual facets
				locationData.newPitch = sketch.map(locationData.newBearing, bearingMin, bearingMax, pitchMin, pitchMax);
				locationData.newVolume = sketch.map(Math.round(locationData.newSpeed), speedMin, speedMax, volumeMin, volumeMax);
				var newRadiusNum = sketch.map(Math.round(locationData.newSpeed), speedMin, speedMax, radiusMin, radiusMax);
				locationData.newRadius = Math.round(newRadiusNum);

				//calculate differences
				//and ensure it's a positive number
				locationData.pitchDiff = Math.abs(locationData.pitch - locationData.newPitch);
				pitchDiffArr.push(locationData.pitchDiff);
				locationData.shapeDiff = Math.abs(locationData.radius - locationData.newRadius);
				locationData.incAmt = locationData.pitchDiff / factor;
				fetchingUsrLoc = false;
			}

			/*
				Main Object config
			 */
			function mapPlaySounds() {
					//Use math.abs for all pitch and volume values?
					//Wind Bearing
					locationData.bearingSoundPitch = sketch.map(locationData.bearing, bearingMin, bearingMax, pitchMin, pitchMax);
					locationData.bearingSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.bearingSound.rate(locationData.bearingSoundPitch);
					locationData.bearingSound.amp(locationData.bearingSoundVolume);
					locationData.bearingSound.loop();
					//Ozone
					locationData.ozoneSoundPitch = sketch.map(locationData.ozone, ozoneMin, ozoneMax, pitchMin, pitchMax);
					locationData.ozoneSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.ozoneSound.rate(locationData.ozoneSoundPitch);
					locationData.ozoneSound.amp(locationData.ozoneSoundVolume);
					locationData.ozoneSound.loop();
					//visibility
					locationData.visibilitySoundPitch = sketch.map(locationData.visibility, visibilityMin, visibilityMax, pitchMin, pitchMax);
					locationData.visibilitySoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.visibilitySound.rate(locationData.visibilitySoundPitch);
					locationData.visibilitySound.amp(locationData.visibilitySoundVolume);
					locationData.visibilitySound.loop();
					//pressure
					locationData.pressureSoundPitch = sketch.map(locationData.pressure, pressureMin, pressureMax, pitchMin, pitchMax);
					locationData.pressureSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.pressureSound.rate(locationData.pressureSoundPitch);
					locationData.pressureSound.amp(locationData.pressureSoundVolume);
					locationData.pressureSound.loop();
					//humidity
					locationData.humiditySoundPitch = sketch.map(locationData.humidity, humidityMin, humidityMax, pitchMin, pitchMax);
					locationData.humiditySoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.humiditySound.rate(locationData.humiditySoundPitch);
					locationData.humiditySound.amp(locationData.humiditySoundVolume);
					locationData.humiditySound.loop();
					//cloud cover
					locationData.cloudCoverSoundPitch = sketch.map(locationData.cloudCover, cloudCoverMin, cloudCoverMax, pitchMin, pitchMax);
					locationData.cloudCoverSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.cloudCoverSound.rate(locationData.cloudCoverSoundPitch);
					locationData.cloudCoverSound.amp(locationData.cloudCoverSoundVolume);
					locationData.cloudCoverSound.loop();
					//dew point
					locationData.dewPointSoundPitch = sketch.map(locationData.dewPoint, dewPointMin, dewPointMax, pitchMin, pitchMax);
					locationData.dewPointSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.dewPointSound.rate(locationData.dewPointSoundPitch);
					locationData.dewPointSound.amp(locationData.dewPointSoundVolume);
					locationData.dewPointSound.loop();
					//temperature
					locationData.temperatureSoundPitch = sketch.map(locationData.temperature, temperatureMin, temperatureMax, pitchMin, pitchMax);
					locationData.temperatureSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.temperatureSound.rate(locationData.temperatureSoundPitch);
					locationData.temperatureSound.amp(locationData.temperatureSoundVolume);
					locationData.temperatureSound.loop();
					//apparent temperature
					locationData.apparentTempSoundPitch = sketch.map(locationData.apparentTemp, apparentTempMin, apparentTempMax, pitchMin, pitchMax);
					locationData.apparentTempSoundVolume = sketch.map(Math.round(locationData.speed), speedMin, speedMax, volumeMin, volumeMax);
					locationData.apparentTempSound.rate(locationData.apparentTempSoundPitch);
					locationData.apparentTempSound.amp(locationData.apparentTempSoundVolume);
					locationData.apparentTempSound.loop();

					//Wind Speed
					//var radiusNum = sketch.map(Math.round(locationData.speed), speedMin, speedMax, radiusMin, radiusMax);
					//locationData.radius = Math.round(radiusNum);
			}

			function showPollingMessage() {
				messageBlock.innerHTML = pollingMsgStr;
			}

			//Location Class
			function LocationObj(speed, bearing, pitch, volume, newPitch, newVolume, pitchDiff, incAmt, name, radius, xPos, yPos, sound) {
				this.speed = speed;
				this.bearing = bearing;
				this.name = name;
				this.radius = radius;
				this.pitch = pitch;
				this.newPitch = newPitch;
				this.volume = volume;
				this.newVolume = newVolume;
				this.xPos = xPos;
				this.yPos = yPos;
				this.pitchDiff = pitchDiff;
				this.incAmt = incAmt;
				this.sound = sound;
				this.soundSame = false;
			}

			LocationObj.prototype.shapePaint = function() {
				sketch.noStroke();
				sketch.fill(0, 0, 0, 100);
				sketch.ellipse(this.xPos, this.yPos, this.radius, this.radius);
				sketch.stroke(0, 0, 0);
				sketch.line(this.xPos, this.yPos, this.xPos + (sketch.sin(sketch.radians(this.bearing)) * bearingLineLength), this.yPos + (sketch.cos(sketch.radians(this.bearing)) * bearingLineLength));
				sketch.textSize(18);
				sketch.textAlign(sketch.CENTER);
				sketch.noStroke();
				sketch.fill(0, 0, 0, 255);
				sketch.text(this.name, this.xPos, this.yPos - radiusMax);
				sketch.text('Speed', this.xPos, this.yPos + lowerTextPos);
				sketch.text(this.radius.toFixed(2), this.xPos, this.yPos + lowerTextPos + radiusMax/4);
				sketch.text('Bearing', this.xPos, this.yPos + lowerTextPos + radiusMax/2);
				sketch.text(this.bearing, this.xPos, this.yPos + lowerTextPos + (radiusMax/4 * 3));
			};

			LocationObj.prototype.shapeUpdate = function() {
				if (this.newRadius !== undefined) {
					var factor = 1;
					if (this.radius > this.newRadius) {
						this.radius -= 1 / factor;
					} else if (this.radius < this.newRadius) {
						this.radius += 1 / factor;
					} else if (this.radius === this.newRadius) {
						//console.log('same');
					}
				}
			};

			LocationObj.prototype.angleUpdate = function() {
				if (this.newBearing !== undefined) {
					if (this.bearing > this.newBearing) {
						this.bearing -= 1;
					} else if (this.bearing < this.newBearing) {
						this.bearing += 1;
					} else if (this.bearing === this.newBearing) {
						//console.log('same');
					}
				}
			};

			LocationObj.prototype.soundUpdate = function() {
				//TO DO
				//locationData[i].sound.amp();
				// Use approximate values
				if (this.pitch.toFixed(2) / 1 > this.newPitch.toFixed(2) / 1) {
					this.pitch -= this.incAmt;
					this.sound.rate(this.pitch);
					//console.log('this.pitch', this.pitch);
				} else if (this.pitch.toFixed(2) / 1 < this.newPitch.toFixed(2) / 1) {
					this.pitch += this.incAmt;
					this.sound.rate(this.pitch);
					//console.log('this.pitch', this.pitch);
				}
				//might have to use a range here
				else if (this.pitch.toFixed(2) / 1 === this.newPitch.toFixed(2) / 1) {
					this.soundSame = true;
				}
			};

			LocationObj.prototype.nameUpdate = function() {
				if (this.newName !== undefined) {
					this.name = this.newName;
				}
			};

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
				locationData.bearingSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.ozoneSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.visibilitySound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.pressureSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.humiditySound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.cloudCoverSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.dewPointSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.temperatureSound = sketch.loadSound('/audio/organ-C2.mp3');
				locationData.apparentTempSound = sketch.loadSound('/audio/organ-C2.mp3');
			};

			sketch.setup = function setup() {
				//Canvas setup
				var myCanvas = sketch.createCanvas(800, 400);
				myCanvas.parent('canvas-container');
				sketch.frameRate(25);
				sketch.background(0, 0, 0);
				mapPlaySounds();
			};

			sketch.draw = function draw() {
				sketch.background(255, 255, 255);
				sketch.fill(0,0,0,255);
				sketch.noStroke();
				sketch.textAlign(sketch.CENTER);
				sketch.text(locationData.name, sketch.width/2, 30);
				// locationData.shapePaint();
				// locationData.shapeUpdate();
				// locationData.angleUpdate();
				// locationData.nameUpdate();
				// locationData.soundUpdate();
			};

		}, 'canvas-container');

		return myP5;
	}

	channel.subscribe('userUpdate', function(data) {
		messageBlock.innerHTML = 'Success';
		init(data);
	});

	return true;
};
