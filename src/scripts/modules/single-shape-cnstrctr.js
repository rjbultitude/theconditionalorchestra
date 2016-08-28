/*
  Constructor for shapes used in visuals
  Each shape is added to a grid
  Paint and Update are used to
  render to the canvas
*/
function SingleShape(xPos, yPos, size, colour, index) {
  'use strict';

  this.xPos = xPos;
  this.yPos = yPos;
  this.size = size;
  this.xNew = xPos;
  this.yNew = yPos;
  this.colour = colour;
  this.noiseStart = index/100;
  this.noiseAmt = 0;
}

SingleShape.prototype.paint = function(sketch, temperatureColour, colourDim) {
  'use strict';

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

SingleShape.prototype.update = function(sketch, noiseInc, animAmount) {
  'use strict';

  this.noiseStart += noiseInc;
  this.noiseAmt = sketch.noise(this.noiseStart);
  this.xNew = this.xPos + this.size - this.noiseAmt * animAmount;
  this.yNew = this.yPos + this.size - this.noiseAmt * animAmount;
};

module.exports = SingleShape;
