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

'use strict';

var P5 = require('../libs/p5');
require('../libs/p5.sound');
var maxMinVals = require('./max-min-values');
var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
	//Els
	var messageBlock = document.getElementById('message-block');

	//animation speed
	var animAmount = 1;
	//Array for all sounds
	var weatherSounds = [];
	//Array for all visual shapes
	var shapeSet = [];
	var noiseInc = 0.01;
	//Canvas size
	var cWidth = 800;
	var cHeight = 400;
	var cPadding = '50%';
	//Colour offset
	var colourDim = 18;
	//Pitch / rate
	var semitone = 0.0833;
	//DOM
	var cContainerName = 'canvas-container';

	//Is this size or smaller
	function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  }

	//main app init
	function init(locationData) {

		//TO DO store offline
		//localStorage.setItem('locationData' , locationData);

		//Create filter
		var soundFilter = new P5.LowPass();

		var myP5 = new P5(function(sketch) {

			//Visuals
			var sqSize = 25;
			var temperatureColour = 0;

			function checkClemency(locationData) {
				return locationData.cloudCover < 0.5 && locationData.speed < 16 && locationData.temperature > 20;
			}

			function mapPitchValues(locationData) {
				console.log('locationData', locationData);
				for (var i = 0; i < locationData.length; i++) {
					locationData.pitchValues[i].mappedValue = sketch.map(locationData.pitchValues[i].value, locationData.pitchValues[i].min, locationData.pitchValues[i].max, maxMinVals.pitch.min, maxMinVals.pitch.max);
				}
				return true;
			}

			function getTemperatureColour(locationData) {
				var temperatureValue = null;
				for (var i = 0; i < locationData.length; i++) {
					if (locationData.pitchValues[i].name === 'temperature') {
						temperatureValue = locationData.pitchValues[i].value;
					}
				}
				return sketch.map(locationData.temperature, locationData.temperature.min, locationData.temperature.max, 25, 255);
			}

			/*
				Main Object config
			 */
			function playSounds(locationData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundDistVolume = sketch.map(Math.round(locationData.cloudCover), locationData.cloudCover.min, locationData.cloudCover.max, locationData.distVolume.min, locationData.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundVolume = sketch.map(Math.round(locationData.speed), locationData.speed.min, locationData.speed.max, locationData.volume.min, locationData.volume.max) - locationData.soundDistVolume/3;
					//Pressure determines root note
					locationData.soundPitchRoot = sketch.map(Math.round(locationData.pressure), locationData.pressure.min, locationData.pressure.max, 0, 0.5);
					//pitch range
					maxMinVals.pitch.min = 0.5 + locationData.soundPitchRoot;
					maxMinVals.pitch.max = 1.5 + locationData.soundPitchRoot;
					//visibility is filter freq
					soundFilter.freq(sketch.map(Math.round(locationData.visibility), maxMinVals.visibility.min, maxMinVals.visibility.max, maxMinVals.freq.min, maxMinVals.freq.max));
					//soundFilter.freq(500); //Debug
					soundFilter.res(20);

					var locationDataKeysArr = Object.keys(locationData);

					for (var i = 0; i < weatherSounds.length; i++) {
						weatherSounds[i].organ.disconnect();
						weatherSounds[i].organDist.disconnect();
						weatherSounds[i].organ.connect(soundFilter);
						weatherSounds[i].organDist.connect(soundFilter);
						weatherSounds[i].organ.rate(locationData[locationDataKeysArr[i]].mappedValue);
						weatherSounds[i].organDist.rate(locationData[locationDataKeysArr[i]].mappedValue);
						if (locationData.name === 'apparentTemp' && checkClemency(locationData) === true) {
								weatherSounds[i].organ.amp(0);
								weatherSounds[i].organDist.amp(0);
						} else {
								weatherSounds[i].organ.amp(locationData.soundVolume);
								weatherSounds[i].organDist.amp(locationData.soundDistVolume);
						}
						weatherSounds[i].organ.loop();
						weatherSounds[i].organDist.loop();
						// console.log('weatherSounds[i]', weatherSounds[i]);
					}
			}

			//Indiviual shape constructor
			function SingleShape(xPos, yPos, size, colour, index) {
				this.xPos = xPos;
				this.yPos = yPos;
				this.size = size;
				this.xNew = xPos;
				this.yNew = yPos;
				this.colour = colour;
				this.noiseStart = index/100;
				this.noiseAmt = 0;
			}

			SingleShape.prototype.paint = function() {
				sketch.noStroke();
				sketch.fill(temperatureColour, this.colour, 255 - temperatureColour);
				sketch.triangle(this.xPos, this.yPos, this.xPos, this.yPos + sqSize, this.xPos + sqSize, this.yPos);
				sketch.fill(temperatureColour - colourDim, this.colour - colourDim, 255 - temperatureColour - colourDim);
				sketch.triangle(this.xPos, this.yPos + sqSize, this.xPos + this.size, this.yPos - this.size + sqSize, this.xNew, this.yNew + sqSize);
			};

			SingleShape.prototype.update = function() {
				this.noiseStart += noiseInc;
				this.noiseAmt = sketch.noise(this.noiseStart);
				//this.size = sqSize - this.noiseAmt * animAmount;
				this.xNew = this.xPos + this.size - this.noiseAmt * animAmount;
				this.yNew = this.yPos - this.noiseAmt * animAmount;
			};

			//Accepts number of horizontal and vertical squares to draw
			function createShapeSet(hSquares, vSquares) {
				var index = 0;
				for (var i = 0; i < hSquares; i++) {
					for (var j = 0; j < vSquares; j++) {
						index++;
						var shape = new SingleShape(i * sqSize, j * sqSize, sqSize - 1, sketch.random(70,130), index);
						shapeSet.push(shape);
					}
				}
			}

			//Sound constructor
			function WeatherSound(organ, organDist) {
				this.organ = organ;
				this.organDist = organDist;
			}

			sketch.preload = function() {
				//loadSound called during preload
				//will be ready to play in time for setup
				for (var i = 0; i < 5; i++) {
					weatherSounds[i] = new WeatherSound(
						sketch.loadSound('/audio/organ-C2.mp3'),
						sketch.loadSound('/audio/organ-C2d.mp3')
					);
				}
			};

			sketch.setup = function setup() {
				//If this size or smaller
				if (matchMediaMaxWidth(540).matches) {
						cWidth = 400;
						cHeight = 800;
						cPadding = '200%';
				}
				//Canvas setup
				var myCanvas = sketch.createCanvas(cWidth, cHeight);
				myCanvas.parent(cContainerName);
				var cContainer = document.getElementById(cContainerName);
				cContainer.style.paddingBottom = cPadding;
				sketch.frameRate(25);
				sketch.background(0, 0, 0);
				//set runtime constants
				var hSquares = Math.round(sketch.width/sqSize);
				var vSquares = Math.round(sketch.height/sqSize);
				animAmount = Math.round(locationData.speed);
				//animAmount = 14;
				noiseInc = sketch.map(animAmount, maxMinVals.speed.min, maxMinVals.speed.max, 0.01, 0.05);
				//create shapes in grid
				createShapeSet(hSquares, vSquares);
				temperatureColour = getTemperatureColour(locationData);
				console.log('temperatureColour', temperatureColour);
				//Update view with place name
				messageBlock.innerHTML = locationData.name;

				//When values are mapped
				if (mapPitchValues(locationData)) {
					playSounds(locationData);
				}
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
