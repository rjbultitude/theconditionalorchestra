# The Conditional Orchestra

## Project Introduction
The Conditional Orchestra is a web app that converts the weather data of a given location into music. The location can either be where you are now or a place of your choice. The music is generated by taking different aspects of the weather, which are mostly pieces of numeric data, and applying them to a large range of musical facets such as instrument type, pitch, volume and duration.

[The live site can be found here](https://theconditionalorchestra.com/). For a full explanation of the inspiration, challenges and solutions see my [blog piece here](https://medium.com/@pointbmusic/making-the-conditional-orchestra-df3149b17d23) on Medium.

Comments, suggestions and feedback welcome. [Please DM me on Twitter](https://twitter.com/pointbmusic).

## Installation

*Run (in this directory):*

  `npm install`

This ensures the all the node packages are installed. Follow the [NPM guide](https://docs.npmjs.com/cli/install) to install new packages.

## Build

Before running any of the standard tasks be sure to run `gulp templates` which will precompile the handlebars template ready for use in the app.

[webpack](https://webpack.js.org/) is used to bundle the app. It runs in two modes: `development` and `production`. To run in development mode run 

`npm run build:dev`

to run in production mode

`npm run build:production`

Webpack will create, clean and manage the `dist` folder.

### Test

To run the unit tests run

`npm test`

### Service worker
This is registered in an inline script on the index page and refers to a file that is minfied and copied to the root when the Gulp task `script` is run.

## References

* [Freqi](https://www.npmjs.com/package/freqi)
* [p5.js](http://p5js.org/)
* [DarkSkyJS](https://www.npmjs.com/package/darkskyjs)
* [JS Promises Polyfill](https://www.npmjs.com/package/es6-promise-polyfill)

## Browser support

The appliction is expected to work in all modern browsers. In browsers that don't support Web Audio, such as IE11 (and below) the app will not run and present an error message. On some devices the audio playback may glitch. In most cases this is due to the device processor not being fast enough to handle the real-time calculations. It is recommended that the app be used on the most powerful device possible.

## App logic
See the modules audio-getters.js, coords-form.js and audio-visual.js for most of the app logic

## Plans

Write unit tests for coords-form, audio-visual, audio-getters and audio-helpers

Consider using [windy.com](https://www.windy.com/) map rather than text input

Consider reducing the max number of pad notes (for performance and sonic overcrowding purposes). If implementing thisx, consider making a second longNote that uses a note from within the scale but beyond the highest index of the numPadNotes

Harp could be something other than humidity - humidity should be evoked by noise

Consider using a state manager and one master sound object

Create 'Add to home screen' button

Refactor the display fns so that they're chained

### Bugs

After stop fade out is louder than normal playback, firefox only - caused by the filter not being applied.

Sequencer onStep only counts the steps in one single pass rather than the loop. _No longer relevant_

## p5 usage

Filters
 * P5.LowPass
 * P5.HighPass

 Maths
 * sketch.TWO_PI
 * sketch.sin
 * sketch.cos
 * sketch.random (number)
 * sketch.random (index in array)

 Draw loop
 * sketch.draw
 * sketch.noLoop
 * sketch.setup
 * sketch.frameRate
 * sketch.frameCount

 Audio
 * sketch.preload
 * sketch.loadSound
 * sketch.masterVolume
