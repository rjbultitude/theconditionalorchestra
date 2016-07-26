/*
	This module loads and converts the data
	Three locations are used as the data sources

	Each location's properties are used to inform the shape of the sounds
	Wind bearing is mapped to used for the pitch
	Wind speed for volume
 */

'use strict';

var P5 = require('../libs/p5');
require('../libs/p5.sound');
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
	function init(locationData, restoredData, staticData) {

		//Create filter
		var soundFilter = new P5.LowPass();
		//Create p5 sketch
		var myP5 = new P5(function(sketch) {

			//Visuals
			var sqSize = 25;
			var temperatureColour = 0;

			function checkClemency(locationData) {
				return locationData.cloudCover.value < 0.5 && locationData.speed.value < 16 && locationData.temperature.value > 20;
			}

			function mapPitchValues(locationData) {
				mappedValsLoop:
				for (var condition in locationData) {
					if (locationData.hasOwnProperty(condition)) {
						if (condition === 'name' || condition === 'soundParams') {
							continue mappedValsLoop;
						}
						locationData[condition].mappedValue = sketch.map(locationData[condition].value, locationData[condition].min, locationData[condition].max, locationData.soundParams.pitch.min, locationData.soundParams.pitch.max);
					}
				}
				return true;
			}

			/*
				Sound algorithm
				---------------
				Currently it pitches the notes arbitarily
				using 'character' values
				The distorition is set by cloud cover
				The note volume is set by wind speed
				The root key is set by the air pressure
				The filter frequenct is set by visibility
			 */
			function playSounds(locationData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundParams.distVolume = sketch.map(Math.round(locationData.cloudCover.value), locationData.cloudCover.min, locationData.cloudCover.max, locationData.soundParams.distVolume.min, locationData.soundParams.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundParams.volume = sketch.map(Math.round(locationData.speed.value), locationData.speed.min, locationData.speed.max, locationData.soundParams.volume.min, locationData.soundParams.volume.max) - locationData.soundParams.distVolume/3;
					//Pressure determines root note
					locationData.soundParams.soundPitchRoot = sketch.map(Math.round(locationData.pressure.value), locationData.pressure.min, locationData.pressure.max, 0, 0.5);
					//pitch range
					locationData.soundParams.pitch.min = 0.5 + locationData.soundParams.soundPitchRoot;
					locationData.soundParams.pitch.max = 1.5 + locationData.soundParams.soundPitchRoot;
					//visibility is filter freq
					soundFilter.freq(sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max));
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
								weatherSounds[i].organ.amp(locationData.soundParams.soundVolume);
								weatherSounds[i].organDist.amp(locationData.soundParams.soundDistVolume);
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
				//Upper triangle
				//top left, bottom left, top right
				sketch.triangle(this.xPos, this.yPos, this.xPos, this.yPos + this.size, this.xPos + this.size, this.yPos);
				sketch.fill(temperatureColour - colourDim, this.colour - colourDim, 255 - temperatureColour - colourDim);
				//Lower triangle
				//bottom left, bottom right,
				sketch.triangle(this.xPos, this.yPos + this.size, this.xNew, this.yNew, this.xPos + this.size, this.yPos);
			};

			SingleShape.prototype.update = function() {
				this.noiseStart += noiseInc;
				this.noiseAmt = sketch.noise(this.noiseStart);
				this.xNew = this.xPos + this.size - this.noiseAmt * animAmount;
				//this.xNew = this.xPos + this.size;
				this.yNew = this.yPos + this.size - this.noiseAmt * animAmount;
				//this.yNew = this.yPos + this.size;
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
				animAmount = Math.round(locationData.speed.value);
				noiseInc = sketch.map(animAmount, locationData.speed.min, locationData.speed.max, 0.01, 0.05);
				//create shapes in grid
				createShapeSet(hSquares, vSquares);
				temperatureColour = sketch.map(locationData.temperature.value, locationData.temperature.min, locationData.temperature.max, 25, 255);
				console.log('locationData', locationData);
				//Update view with place name
				if (restoredData) {
						messageBlock.innerHTML = 'You appear to be offline. Using last location: ' + locationData.name;
				} else if (staticData) {
						messageBlock.innerHTML = 'You appear to be offline. Using default location: ' + locationData.name;
				} else {
					messageBlock.innerHTML = locationData.name;
				}

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
		init(data, false, false);
	});
	channel.subscribe('restoreUserData', function(data) {
		messageBlock.innerHTML = 'Success';
		init(data, true, false);
	});
	channel.subscribe('staticData', function(data) {
		messageBlock.innerHTML = 'Success';
		init(data, false, true);
	});

	return true;
};
