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
var intervals = require('./intervals');

module.exports = function() {
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
  //dialog
  var dialogIsOpen = false;

	//Is this size or smaller
	function matchMediaMaxWidth(maxWidthVal) {
    return window.matchMedia('all and (max-width: ' + maxWidthVal + 'px)');
  }

	//main app init
	function init(locationData) {

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

			function playSounds(locationData, notesArray) {
				//Set filter
				console.log('locationData.soundParams.freq.value', locationData.soundParams.freq.value);
				soundFilter.freq(locationData.soundParams.freq.value);
				soundFilter.res(20);

				for (var i = 0; i < weatherSounds.length; i++) {
					weatherSounds[i].organ.disconnect();
					weatherSounds[i].organDist.disconnect();
					weatherSounds[i].organ.connect(soundFilter);
					weatherSounds[i].organDist.connect(soundFilter);
					weatherSounds[i].organ.rate(notesArray[i]);
					weatherSounds[i].organDist.rate(notesArray[i]);
					weatherSounds[i].organ.amp(locationData.soundParams.soundVolume);
					weatherSounds[i].organDist.amp(locationData.soundParams.soundDistVolume);
					weatherSounds[i].organ.loop();
					weatherSounds[i].organDist.loop();
				}
			}

			/*
				Major scale for clement weather
				Minor octave for anything else
			*/
			function assignPitches(locationData) {
				var centreNote = (locationData.soundParams.pitch.min + locationData.soundParams.pitch.max) / 2;
				var notesArray = [];
				if (checkClemency(locationData)) {
					for (var i = 0; i < intervals.majorIntervals.length; i++) {
						notesArray.push(centreNote + intervals.majorIntervals[i] * semitone);
					}
				} else {
					for (var j = 0; j < intervals.minorOctave.length; j++) {
						notesArray.push(centreNote + intervals.minorOctave[j] * semitone);
					}
				}
				playSounds(locationData, notesArray);
			}

			/*
				Arbitarily assigned pitch values
				calculated by mapping conditions to pitch
			*/
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
				//continue with sound processing
				playSounds(locationData);
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
				The filter frequency is set by visibility
			 */
			function configureSounds(locationData) {
					//Use math.abs for all pitch and volume values?
					//Add global values to the main data object

					//cloud cover determines level of distorition
					locationData.soundParams.distVolume = sketch.map(Math.round(locationData.cloudCover.value), locationData.cloudCover.min, locationData.cloudCover.max, locationData.soundParams.distVolume.min, locationData.soundParams.distVolume.max);
					//Wind speed determines volume of all sounds
					locationData.soundParams.volume = sketch.map(Math.round(locationData.speed.value), locationData.speed.min, locationData.speed.max, locationData.soundParams.volume.min, locationData.soundParams.volume.max) - locationData.soundParams.distVolume/3;
					//Pressure determines root note
					locationData.soundParams.soundPitchOffset = sketch.map(Math.round(locationData.pressure.value), locationData.pressure.min, locationData.pressure.max, 0, 0.5);
					//pitch range
					locationData.soundParams.pitch.min = 0.5 + locationData.soundParams.soundPitchOffset;
					locationData.soundParams.pitch.max = 1.5 + locationData.soundParams.soundPitchOffset;
					//visibility is filter freq
					locationData.soundParams.freq.value = sketch.map(Math.round(locationData.visibility.value), locationData.visibility.min, locationData.visibility.max, locationData.soundParams.freq.min, locationData.soundParams.freq.max);
					//continue with sound processing
					//mapPitchValues(locationData);
					assignPitches(locationData);
			}

			//Indiviual shape constructor
			//TODO store in external module
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
				this.yNew = this.yPos + this.size - this.noiseAmt * animAmount;
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
				for (var i = 0; i < 4; i++) {
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
				//handle sounds
				configureSounds(locationData);
			};

			sketch.draw = function draw() {
				sketch.background(0, 0, 0, 0);
        if (dialogIsOpen) {
          for (var i = 0; i < shapeSet.length; i++) {
            shapeSet[i].update();
            shapeSet[i].paint();
          }
        }
			};

		}, 'canvas-container');

		return myP5;
	}

	channel.subscribe('userUpdate', function(data) {
		init(data, false, false);
	});

  channel.subscribe('dialogOpen', function() {
    dialogIsOpen = true;
  });

  channel.subscribe('dialogClosed', function() {
    dialogIsOpen = false;
  });

	return true;
};
