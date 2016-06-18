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
	//Els
	var messageBlock = document.getElementById('message-block');

	/*
		Ranges to be mapped
	 */
	//Pitch arbitary scale
	var pitchMin = 0.5;
	var pitchMax = 2.0;
	//Volume arbitary scale
	var volumeMin = 0.0;
	var volumeMax = 1.0;
	//Distorted volume arbitary scale
	var distVolumeMin = 0.0;
	var distVolumeMax = 0.6;
	//Frequency
	var freqMin = 320;
	var freqMax = 5000;
	//Cloud cover as a percentage
	var cloudCoverMin = 0;
	var cloudCoverMax = 1;
	//Wind speed typically up to  32m/s
	var speedMin = 0;
	var speedMax = 32;
	//pressure in millibars
	var pressureMin = 980;
	var pressureMax = 1050;
	//visibility in metres
	var visibilityMin = 0.1;
	var visibilityMax = 10;
	//Wind Bearing in degrees
	var bearingMin = 0;
	var bearingMax = 360;
	//Ozone in Dobson units
	var ozoneMin = 230;
	var ozoneMax = 500;
	//humidity as a percentage
	var humidityMin = 0;
	var humidityMax = 1;
	//dew point in farenheit
	var dewPointMin = 20;
	var dewPointMax = 72;
	//temperature in farenheit
	var temperatureMin = -12;
	var temperatureMax = 120;
	//apparent temperature in farenheit
	var apparentTempMin = -20;
	var apparentTempMax = 120;
	//animation speed
	var animAmount = 1;
	//Array for all sounds
	var weatherSounds = [];
	//Array for all visual shapes
	var shapeSet = [];
	//noise factor
	var noiseFactor = 1000000;
	var noiseInc = 0.01;

	//main app init
	function init(locationData) {

		//TO DO store offline
		//localStorage.setItem('locationData' , locationData);

		var soundFilter = new P5.LowPass();

		var myP5 = new P5(function(sketch) {

			//Visuals
			var sqSize = 25;
			var hSquares = 0;
			var vSquares = 0;
			var noiseVal = 0.0;
			var temperatureColour = 0;
			//The rate at which to detune
			//TO DO Needs to be refactored to be
			//independant of the processor speed
			//The higher the number the bigger the loop
			//amend with caution
			var factor = 20;

			/*
				Main Object config
			 */
			function mapPlaySounds() {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundDistVolume = sketch.map(Math.round(locationData.characterValues.cloudCover), cloudCoverMin, cloudCoverMax, distVolumeMin, distVolumeMax);
					//Wind speed determines volume of all sounds
					locationData.soundVolume = sketch.map(Math.round(locationData.characterValues.speed), speedMin, speedMax, volumeMin, volumeMax) - locationData.soundDistVolume/3;
					//locationData.soundVolume = 0.1;
					//Pressure determines root note
					locationData.soundPitchRoot = sketch.map(Math.round(locationData.characterValues.pressure), pressureMin, pressureMax, 0, 0.5);
					pitchMin = 0.5 + locationData.soundPitchRoot;
					pitchMax = 1.5 + locationData.soundPitchRoot;
					//visibility is filter freq
					soundFilter.freq(sketch.map(Math.round(locationData.characterValues.visibility), visibilityMin, visibilityMax, freqMin, freqMax));
					//soundFilter.freq(500);
					soundFilter.res(20);
					//Store pitches in array
					var pitchValuesMapped = [];
					//Wind Bearing
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.bearing, bearingMin, bearingMax, pitchMin, pitchMax));
					//Ozone
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.ozone, ozoneMin, ozoneMax, pitchMin, pitchMax));
					//humidity
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.humidity, humidityMin, humidityMax, pitchMin, pitchMax));
					//dew point
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.dewPoint, dewPointMin, dewPointMax, pitchMin, pitchMax));
					//temperature
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.temperature, temperatureMin, temperatureMax, pitchMin, pitchMax));
					//apparent temperature
					pitchValuesMapped.push(sketch.map(locationData.pitchValues.apparentTemp, apparentTempMin, apparentTempMax, pitchMin, pitchMax));

					console.log('pitchValuesMapped', pitchValuesMapped);
					console.log('locationData', locationData);

					for (var i = 0; i < weatherSounds.length; i++) {
						weatherSounds[i].organ.disconnect();
						weatherSounds[i].organDist.disconnect();
						weatherSounds[i].organ.connect(soundFilter);
						weatherSounds[i].organDist.connect(soundFilter);
						weatherSounds[i].organ.rate(pitchValuesMapped[i]);
						weatherSounds[i].organDist.rate(pitchValuesMapped[i]);
						weatherSounds[i].organ.amp(locationData.soundVolume);
						weatherSounds[i].organDist.amp(locationData.soundDistVolume);
						weatherSounds[i].organ.loop();
						weatherSounds[i].organDist.loop();
					}
			}

			function SingleShape(xPos, yPos, size, colour, index) {
				this.xPos = xPos;
				this.yPos = yPos;
				this.size = size;
				this.colour = colour;
				this.noiseStart = index/100;
				this.noiseAmt = 0;
			}

			SingleShape.prototype.paint = function() {
				sketch.noStroke();
				sketch.fill(temperatureColour, this.colour, 255 - temperatureColour);
				sketch.rect(this.xPos, this.yPos, this.size, this.size);
			};

			SingleShape.prototype.update = function() {
				//this.noiseStart += (i * frameCount)/noiseFactor;
				this.noiseStart += noiseInc;
				this.noiseAmt = sketch.noise(this.noiseStart);
				this.size = sqSize - this.noiseAmt * animAmount;
			};

			function createShapeSet() {
				var index = 0;
				for (var i = 0; i < hSquares; i++) {
					for (var j = 0; j < vSquares; j++) {
						index++;
						var shape = new SingleShape(i * sqSize, j * sqSize, sqSize - 1, sketch.random(70,130), index);
						shapeSet.push(shape);
					}
				}
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

			function WeatherSound(organ, organDist) {
				this.organ = organ;
				this.organDist = organDist;
			}

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
				var pitchDataLength = Object.keys(locationData.pitchValues).length;
				//create an empty object for each sound
				for (var i = 0; i < pitchDataLength; i++) {
					weatherSounds[i] = new WeatherSound(null, null);
				}
				//populate with preloaded sounds
				for (var j = 0; j < weatherSounds.length; j++) {
					weatherSounds[j].organ = sketch.loadSound('/audio/organ-C2.mp3');
					weatherSounds[j].organDist = sketch.loadSound('/audio/organ-C2d.mp3');
				}
				console.log('weatherSounds', weatherSounds);
			};

			sketch.setup = function setup() {
				//Canvas setup
				var myCanvas = sketch.createCanvas(800, 400);
				myCanvas.parent('canvas-container');
				sketch.frameRate(25);
				sketch.background(0, 0, 0);
				//set runtime constants
				hSquares = Math.round(sketch.width/sqSize);
				vSquares = Math.round(sketch.height/sqSize);
				animAmount = Math.round(locationData.characterValues.speed);
				console.log('animAmount', animAmount);
				createShapeSet();
				temperatureColour = sketch.map(locationData.pitchValues.temperature, temperatureMin, temperatureMax, 25, 255);
				console.log('temperatureColour', temperatureColour);
				messageBlock.innerHTML = locationData.characterValues.name;
				mapPlaySounds();
			};

			sketch.draw = function draw() {
				//mapDrawGrid();
				sketch.background(0, 0, 0);
				for (var i = 0; i < shapeSet.length; i++) {
					shapeSet[i].update();
					shapeSet[i].paint();
				}
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
