/*
	This module manages the
  sonic and visual output of the app
 */

'use strict';
//3rd party
var P5 = require('../libs/p5');
require('../libs/p5.sound');
var postal = require('postal');
var channel = postal.channel();
var appTemplate = require('../templates/index').codisplay;
var work = require('webworkify');
//custom
var coDisplayData = require('./co-display-data');
var weatherCheck = require('./weather-checker-fns');
var microU = require('../utilities/micro-utilities');
var intervals = require('../utilities/intervals');
var getFreqScales = require('../utilities/create-freq-scales');
var getLargestPosNumInArr = require('../utilities/largest-pos-num-in-array');
var getLargestNegNumInArr = require('../utilities/largest-neg-num-in-array');
var addMissingArrayItems = require('../utilities/add-missing-array-items');
var avSettings = require('../settings/av-settings');
var makeFibSequence = require('../utilities/fib-sequence');
var coFns = require('./co-display-fns');
var pageTheme = require('./page-theme');
var audioGets = require('./audio-getters');
var audioHlpr = require('./audio-helpers');

module.exports = function() {
  /*
    Module scoped vars
    and constants
  */
  var isPlaying = false;
  var maxMasterVolSet = false;
  // rate
  var appFrameRate = 30;
  var sequenceStart = true;
  var sequenceLength = 1500;
  var rootNoteRate;
  // bass
  var bass;
  var bass2;
  // Windy/ Brass
  var brassBaritone;
  var brassBaritone2;
  // Percussion
  var chineseCymbal;
  var timpani;
  var rideCymbal;
  var djembe;
  var djembeVolArr = [0.95, 0.7];
  // clement / brass
  var harpSound;
  // long notes
  var longNote;
  // precipitation / drops
  var dropSound;
  // Lead sounds
  var rhodes;
  // Globals
  var soundFilter;
  var freezingFilter;
  var foggyFilter;
  var reverb;
  // pan
  var angle = 180;
  var sinVal = 0;
  var cosVal = 0;
  var panArr = [-0.8, 0, 0.8];
  var longNotePanArr = [-0.2, 0, 0.2];
  // Sound objects
  var padSounds = [];
  var choralSounds = [];
  var synchedSoundsChords = [];
  // Lead
  var leadBarComplete = false;
  var leadSoundIndex = 0;
  // Subscriptions
  var publishBrassOne;
  var publishBrassTwo;
  // Ramp times
  var rampTime = 0.001;
  var timeFromNow = 0.001;
  var startVol = 0.001;
  // DOM
  var cdContainer = document.querySelector('.conditions-display__list');

  function fadeInDisplayItem(thisDisplayItem) {
    var _opacity = 0;
    var _aniLoop = setInterval(function() {
      if (_opacity < 1) {
        thisDisplayItem.style.opacity = _opacity + '';
        _opacity += 0.05;
      } else {
        clearInterval(_aniLoop);
      }
    }, 50);
  }

  function fadeOutDisplayItems(thisDisplayItem, index, totalItems, doneFn,
    autoStart) {
    var _opacity = 1;
    var _aniLoop = setInterval(function() {
      if (_opacity > 0) {
        thisDisplayItem.style.opacity = _opacity + '';
        _opacity -= 0.05;
      } else {
        clearInterval(_aniLoop);
        //when all are done
        if (index + 1 === totalItems) {
          //Run the callback
          doneFn(autoStart);
        }
      }
    }, 50);
  }

  function fadeOutPadSounds(soundItem) {
    function stopPadSounds(padSound) {
      setTimeout(function() {
        padSound.stop();
      }, avSettings.fadeTime * 1000);
    }
    soundItem.fade(0, avSettings.fadeTime);
    stopPadSounds(soundItem);
  }

  function fadeOutChoralSounds(soundItem) {
    soundItem.fade(0, avSettings.fadeTime);
    setTimeout(function() {
      soundItem.stop();
    }, avSettings.fadeTime * 1000);
  }

  function fadeOutAllSounds(autoStart) {
    //Fades
    brassBaritone.fade(0, avSettings.fadeTime);
    brassBaritone2.fade(0, avSettings.fadeTime);
    bass.fade(0, avSettings.fadeTime);
    bass2.fade(0, avSettings.fadeTime);
    chineseCymbal.fade(0, avSettings.fadeTime);
    choralSounds.forEach(fadeOutChoralSounds);
    djembe.fade(0, avSettings.fadeTime);
    dropSound.fade(0, avSettings.fadeTime);
    harpSound.fade(0, avSettings.fadeTime);
    longNote.fade(0, avSettings.fadeTime);
    padSounds.forEach(fadeOutPadSounds);
    rhodes.fade(0, avSettings.fadeTime);
    rideCymbal.fade(0, avSettings.fadeTime);
    timpani.fade(0, avSettings.fadeTime);
    //Stop after fades
    setTimeout(function() {
      brassBaritone.stop();
      brassBaritone2.stop();
      bass.stop();
      bass2.stop();
      chineseCymbal.stop();
      djembe.stop();
      harpSound.stop();
      dropSound.stop();
      longNote.stop();
      rhodes.stop();
      rideCymbal.stop();
      timpani.stop();
    }, avSettings.fadeTime * 1000);
    //Unsubs
    publishBrassOne.unsubscribe();
    publishBrassTwo.unsubscribe();
    isPlaying = false;
    channel.publish('allStopped', autoStart);
  }

  function createP5SoundObjs() {
    soundFilter = new P5.LowPass();
    freezingFilter = new P5.HighPass();
    foggyFilter = new P5.HighPass();
    reverb = new P5.Reverb();
  }

  // main app init
  function init(lwData) {
    console.log('lwData', lwData);
    // Init scoped values
    // Defaults
    var mainSeqCount = 0;
    var extraSeqCount = 0;
    var extraSeqPlaying = false;
    var brassOneScaleArrayIndex = 0;
    var brassTwoScaleArrayIndex = 0;
    var chordIndex = 0;
    var padIndexCount = 0;
    var fibIndex = 0;
    var panIndex = 0;
    var humidArpScales = [];
    var humidArpReady = false;
    var humidArpScaleIndex = 0;
    var hArpSeqIndex = 0;
    var padReady = false;
    var leadSoundReady = false;
    var precipArpScales = [];
    var precipArpReady = false;
    var precipArpScaleIndex = 0;
    var pArpSeqIndex = 0;
    var freezingFilterFreq = 2000;
    var foggyFilterFreq = 750;
    var masterGain = 0;
    //clear data
    padSounds = [];
    choralSounds = [];
    // grouped weather booleans
    var wCheck = {
      //single concept items
      isPrecip: weatherCheck.isPrecip(lwData.precipType, lwData.precipIntensity.value),
      isWindy: weatherCheck.isWindy(lwData.windSpeed.value),
      isCloudy: weatherCheck.isCloudy(lwData.cloudCover.value),
      isVisbilityPoor: weatherCheck.isVisbilityPoor(lwData.visibility.value),
      isFoggy: weatherCheck.isFoggy(lwData.visibility.value, lwData.temperature.value, lwData.dewPoint.value),
      //Humidity
      isHumid: weatherCheck.isHumid(lwData.humidity.value),
      isMuggy: weatherCheck.isMuggy(lwData.humidity.value, lwData.temperature.value),
      isSmoggy: weatherCheck.isSmoggy(lwData.humidity.value, lwData.apparentTemperature.value, lwData.visibility.value),
      isArid: weatherCheck.isArid(lwData.humidity.value, lwData.temperature.value, lwData.precipIntensity.value),
      isCrisp: weatherCheck.isCrisp(lwData.humidity.value, lwData.temperature.value),
      isSirocco: weatherCheck.isSirocco(lwData.humidity.value, lwData.temperature.value, lwData.windSpeed.value),
      //temperature
      isCold: weatherCheck.isCold(lwData.temperature.value),
      isFreezing: weatherCheck.isFreezing(lwData.temperature.value),
      //broad conditions
      isMild: weatherCheck.isMild(lwData.temperature.value, lwData.windSpeed.value),
      isMildAndHumid: weatherCheck.isMildAndHumid(lwData.temperature.value, lwData.windSpeed.value, lwData.humidity.value),
      isFine: weatherCheck.isFine(lwData.cloudCover.value, lwData.windSpeed.value, lwData.temperature.value),
      isSublime: weatherCheck.isSublime(lwData.cloudCover.value, lwData.windSpeed.value, lwData.temperature.value),
      isClement: weatherCheck.isClement(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value),
      isBitter: weatherCheck.isBitter(lwData.temperature.value, lwData.windSpeed.value),
      isStormy: weatherCheck.isStormy(lwData.cloudCover.value, lwData.windSpeed.value, lwData.precipIntensity.value),
      isViolentStorm: weatherCheck.isViolentStorm(lwData.cloudCover.value,lwData.windSpeed.value, lwData.precipIntensity.value),
      isOminous: weatherCheck.isOminous(lwData.cloudCover.value, lwData.nearestStormDistance.value, lwData.precipProbability.value),
    };
    console.log('wCheck', wCheck);
    // grouped sound booleans
    // Only require these three as
    // all other sounds rely on just one condition
    var sCheck = {
      harpCanPlay : audioGets.getHarpCanPlay(wCheck),
      timpaniCanPlay : audioGets.getTimpaniCanPlay(wCheck),
      choralCanPlay : audioGets.getChoralCanPlay(wCheck)
    };
    //Get and set core values
    var numPadNotes = audioGets.getNumPadNotes(wCheck, avSettings);
    var numChords = audioGets.getNumChords(lwData, avSettings).numChords;
    var numExtraChords = audioGets.getNumChords(lwData, avSettings).numExtraChords;
    var chordNumGreatest = numChords > numExtraChords ? numChords : numExtraChords;
    var numSemisPerOctave = audioGets.getNumSemisPerOctave(avSettings, wCheck);
    var chordType = audioGets.getChordType(wCheck);
    var upperMult = audioGets.getSeqRepeatMaxMult(numChords, avSettings);
    var seqRepeatNum = audioGets.getMainSeqRepeatNum(lwData, numChords, upperMult);
    //Precipitation
    // TODO Group these into object
    // and only create it if it's raining
    var precipCategory = audioGets.getPrecipCategory(lwData);
    var precipArpBpm = audioGets.getPrecipArpBpm(lwData);
    var precipArpBps = audioGets.precipArpBpm / 60;
    var precipArpStepTime = Math.round(appFrameRate / precipArpBps);
    var precipArpIntervalType = audioGets.getPrecipArpIntervalType(chordType);
    var leadVolume = audioGets.getLeadSoundVolume(wCheck);
    var padType = audioGets.getPadType(wCheck);
    var padVolume = audioGets.getPadVolume(wCheck, sCheck, padType, avSettings);
    console.log('padVolume', padVolume);
    var inversionOffsetType = audioGets.getInversionOffsetKey(wCheck);
    // Humidity
    // TODO Group these into object
    // and only create it if it's humid
    var humidArpBpm = audioGets.getHumidArpBpm(lwData);
    var humidArpBps = humidArpBpm / 60;
    var humidArpStepTime = Math.round(appFrameRate / humidArpBps);
    var humidArpIntervalsKey = audioGets.getHumidArpIntervals(lwData, chordType);
    var harpVolArr = audioGets.getHarpVolArr(wCheck, sCheck);
    //Root note
    var rootNoteRange = audioGets.getRootNoteRange(numSemisPerOctave);
    var rootNote = audioGets.getRootNote(lwData, rootNoteRange);
    var rootNoteHigh = audioGets.isRootNoteHigh(rootNote);
    var longNoteIndex = audioGets.getLongNoteIndex(lwData, numPadNotes);
    var longNoteHigh = audioGets.isLongNoteHigh(rootNoteHigh, longNoteIndex, numPadNotes);
    console.log('longNoteHigh', longNoteHigh);
    var longNoteVolArr = audioGets.getLongNoteVolArr(wCheck);
    console.log('longNoteVolArr', longNoteVolArr);
    var reverbLength = audioGets.getReverbLength(lwData);
    var reverbDecay = audioGets.getReverbDecay(lwData);
    console.log('reverbDecay', reverbDecay);
    var longNoteType = audioGets.getLongNoteType(wCheck);
    var masterFilterFreq = audioGets.getMasterFilterFreq(lwData, avSettings);
    var rootNoteGrtrMedian = audioGets.isRootNoteGrtrMedian(rootNote, rootNoteRange);
    console.log('rootNoteGrtrMedian', rootNoteGrtrMedian);
    var extraSeqOffset = audioGets.getExtraChordsOffset(rootNoteGrtrMedian, numSemisPerOctave);
    console.log('extraSeqOffset', extraSeqOffset);
    var invExtraSeqOffset = numSemisPerOctave - extraSeqOffset;
    console.log('invExtraSeqOffset', invExtraSeqOffset);
    var chordSeqKey = audioGets.getChordSeqKey(wCheck, rootNoteGrtrMedian);
    // TODO Group these into object
    // and only create it if it's windy
    var brassBaritoneVol = audioGets.getBrassVolume(lwData);
    var brassBaritoneBpm = audioGets.getBrassBpm(lwData);
    var brassBaritoneBps = brassBaritoneBpm / 60;
    var brassBaritoneStepTime = Math.round(appFrameRate / brassBaritoneBps);
    var brassBaritone2StepTime = brassBaritoneStepTime * 2 + 57;
    // Ride
    var rideCymbalRate = audioGets.getRideCymbalRate(lwData);
    var rideCymbalBpm = audioGets.getRideCymbalsBpm(lwData);
    var rideCymbalBps = rideCymbalBpm / 60;
    var rideCymbalStepTime = Math.round(appFrameRate / rideCymbalBps);
    var rideCymbalMaxVolume = audioGets.getRideCymbalMaxVolume(lwData);
    var rideCymbalVolumeArr = audioGets.getRideCymbalVolumeArr(rideCymbalMaxVolume);
    var djembeStepTime = rideCymbalStepTime * 2;
    var noteLengthMult = audioGets.getNoteLengthMult(lwData, avSettings);
    var noteLengths = audioGets.getNoteLengths(appFrameRate, noteLengthMult);
    var leadNoteLengthStart = audioGets.getLeadNoteLengthStart(appFrameRate, lwData);
    var leadNoteLengths = makeFibSequence(leadNoteLengthStart, numPadNotes * 2);
    //Set initial note lengths for use in draw
    var currNoteLength = noteLengths[0];
    var currLeadLength = leadNoteLengths[0];

    //Create p5 sketch
    var myP5 = new P5(function(sketch) {

      // used for Brass pan
      var inc = sketch.TWO_PI / 150;

      channel.subscribe('allStopped', function() {
        sketch.noLoop();
      });

      /**
       * ------------------------
       * Set base effects
       * ------------------------
       */
      function setFilter() {
        soundFilter.freq(masterFilterFreq);
        soundFilter.res(20);
      }

      function setReverb() {
        reverb.set(reverbLength, reverbDecay);
        reverb.amp(1);
      }

      /**
       * ------------------------
       * Music loop index updaters
       * ------------------------
       */

      function updatePanIndex() {
        if (panIndex < panArr.length - 1) {
          panIndex++;
        } else {
          panIndex = 0;
        }
      }

      function setChordIndex() {
        if (chordIndex >= synchedSoundsChords.length - 1 - numExtraChords) {
          chordIndex = 0;
        } else {
          chordIndex++;
        }
        return chordIndex;
      }

      function updateNoteLength() {
        //If the lower chords are playing halve the time
        currNoteLength = extraSeqPlaying ? sketch.random(noteLengths) * 2 :
          sketch.random(noteLengths);
        //Start the call of the updateNoteLength fn again
        padReady = true;
      }

      //Set amount of time each lead note
      //plays using fibonacci sequence
      function updateLeadSoundLength() {
        currLeadLength = leadNoteLengths[fibIndex];
        if (fibIndex === leadNoteLengths.length - 1) {
          fibIndex = 0;
        } else {
          fibIndex++;
        }
        leadSoundReady = true;
      }

      function updateLeadSoundIndex() {
        if (leadSoundIndex === numPadNotes - 1) {
          leadSoundIndex = 0;
          leadBarComplete = true;
        } else {
          leadSoundIndex++;
          leadBarComplete = false;
        }
      }

      /**
       * ------------------------
       * Music preparation functions
       * ------------------------
       */
      function prepareHumidArp(hScalesNoRests) {
        //Overwrite empty array with sequences
        //that include rests
        humidArpScales = hScalesNoRests.map(function(hArpScale) {
          return audioHlpr.getAllegrettoRhythmType(wCheck, hArpScale);
        });
        humidArpReady = true;
      }

      function preparePrecipArp(precipArpScaleNoRests) {
        //Overwrite sequence with new notes
        precipArpScales = precipArpScaleNoRests.map(function(pArpScale) {
          return audioHlpr.addRandomStops(pArpScale, sketch).reverse();
        });
        precipArpReady = true;
      }

      /**
       * ------------------------
       * Music playback functions
       * ------------------------
       */

      function playBrassBaritone(scale) {
        brassBaritone.play();
        brassBaritone.setVolume(brassBaritoneVol, rampTime, timeFromNow, startVol);
        brassBaritone.rate(scale[brassOneScaleArrayIndex]);
        if (brassOneScaleArrayIndex >= 1) {
          brassOneScaleArrayIndex = 0;
        } else {
          brassOneScaleArrayIndex++;
        }
      }

      function playBrassBaritoneTwo(scale) {
        var _newScaleArr = scale.slice().reverse();
        var _brassBaritoneTwoRate;
        if (rootNoteGrtrMedian) {
          var _rateMultArr = [1, 2];
          var _randomRateMultVal = sketch.random(_rateMultArr);
          _brassBaritoneTwoRate = _newScaleArr[brassTwoScaleArrayIndex] * _randomRateMultVal;
        } else {
          _brassBaritoneTwoRate = _newScaleArr[brassTwoScaleArrayIndex];
        }
        brassBaritone2.play();
        brassBaritone2.setVolume(0.4, rampTime, timeFromNow, startVol);
        brassBaritone2.rate(_brassBaritoneTwoRate);
        if (brassTwoScaleArrayIndex >= scale.length - 1) {
          brassTwoScaleArrayIndex = 0;
        } else {
          brassTwoScaleArrayIndex++;
        }
      }

      function playLongNote() {
        //playlogic
        var _longNoteRate = synchedSoundsChords[chordIndex][longNoteIndex];
        var _longNoteVol;
        // playlogic
        // If weather is hot, dry and clear
        // play the longNote very quietly
        if (wCheck.isSublime) {
          _longNoteVol = longNoteVolArr[0];
        } else {
          _longNoteVol = sketch.random(longNoteVolArr);
        }
        // Lower by one octave
        // if the lower chords are playing
        if (extraSeqPlaying || longNoteHigh) {
          _longNoteRate = _longNoteRate / 2;
        }
        // Play the wet signal alone
        // if visibility is less than 8 miles /
        // if the reverb is long
        if (wCheck.isVisbilityPoor) {
          longNote.disconnect();
        }
        longNote.connect(reverb);
        if (!wCheck.isVisbilityPoor) {
          longNote.playMode('restart');
        }
        longNote.play();
        longNote.pan(sketch.random(longNotePanArr));
        longNote.setVolume(_longNoteVol, rampTime, timeFromNow, startVol);
        longNote.rate(_longNoteRate);
      }

      function bassCallback(bassRate) {
        bass2.playMode('restart');
        bass2.play();
        bass2.setVolume(0.5, rampTime, timeFromNow, startVol);
        bass2.rate(bassRate * 2);
      }

      function playBass() {
        //Play 1st note of each chord
        var _bassRate = synchedSoundsChords[chordIndex][0];
        bass.playMode('restart');
        bass.play();
        bass.setVolume(1, rampTime, timeFromNow, startVol);
        bass.rate(_bassRate);
        //playlogic
        if (wCheck.isClement) {
          bass.onended(function() {
            bassCallback(_bassRate);
          });
        }
      }

      function padCallBack() {
        if (isPlaying) {
          padIndexCount++;
          // When all the sounds have played once, loop
          if (padIndexCount === padSounds.length) {
            playSynchedSounds(true);
            padIndexCount = 0;
          }
        }
      }

      function playPad(playFullNotes) {
        for (var i = 0, length = padSounds.length; i < length; i++) {
          padSounds[i].disconnect();
          padSounds[i].connect(soundFilter);
          padSounds[i].pan(panArr[panIndex]);
          padSounds[i].playMode('restart');
          padSounds[i].play();
          padSounds[i].setVolume(padVolume, rampTime, timeFromNow, startVol);
          padSounds[i].rate(synchedSoundsChords[chordIndex][i]);
          // If we want to play the play full note length
          // use the onended callback
          if (playFullNotes) {
            padSounds[i].onended(function() {
              padCallBack();
            });
          }
          updatePanIndex();
        }
      }

      function playSynchedSounds(playFullNotes) {
        // Master sequence
        if (mainSeqCount === seqRepeatNum && numExtraChords > 0) {
          //If we've played the whole sequence
          //seqRepeatNum number of times
          //play the first chord of extraChords
          chordIndex = synchedSoundsChords.length - numExtraChords + extraSeqCount;
          extraSeqCount++;
          extraSeqPlaying = true;
          //Once we've played all the extraChords
          //start over
          if (extraSeqCount === numExtraChords) {
            mainSeqCount = 0;
            extraSeqCount = 0;
          }
        } else {
          extraSeqPlaying = false;
          mainSeqCount++;
        }
        // Play the pad chord
        // and pass in the playback mode
        playPad(playFullNotes);
        // playlogic
        // Avoid sound clash with Brass
        if (wCheck.isCloudy && !wCheck.isWindy) {
          playBass();
        }
        playLongNote();
        // increment indices
        setChordIndex();
        // Start the lead over
        leadBarComplete = false;
      }

      function playChoralSound(scaleArray) {
        // playlogic
        // TODO consider for loop for speed
        choralSounds.forEach(function(choralSound, i) {
          // must loop before rate is set
          // issue in Chrome only
          if (wCheck.isFreezing) {
            choralSound.disconnect();
            choralSound.connect(freezingFilter);
          }
          choralSound.loop();
          //playlogic
          if (wCheck.isFreezing) {
            choralSound.rate(scaleArray[i] / 2);
            choralSound.setVolume(0.23, rampTime, timeFromNow, startVol);
          } else {
            choralSound.rate(scaleArray[i]);
            choralSound.setVolume(0.1, rampTime, timeFromNow, startVol);
          }
        });
      }

      /**
       * playSounds Handles playback logic
       * Though some of this is delegated
       * @param  {Array} pArpScalesNoRests a set of notes fot the sequencer to play
       * @param  {Array} hScalesNoRests a set of notes fot the sequencer to play
       * @return {boolean}               default value
       */
      function playSounds(pArpScalesNoRests, hScalesNoRests) {
        // playlogic
        // Only the first chord is passed in
        if (sCheck.choralCanPlay) {
          playChoralSound(synchedSoundsChords[0]);
        }
        // Play the lead if the weather is fine
        // but not raining so as to avoid clash
        if (wCheck.isFine && !wCheck.isPrecip) {
          leadSoundReady = true;
        }
        // Play brass
        publishBrassOne = channel.subscribe('triggerBrassOne', function() {
          playBrassBaritone(synchedSoundsChords[chordIndex]);
        });
        publishBrassTwo = channel.subscribe('triggerBrassTwo', function() {
          playBrassBaritoneTwo(synchedSoundsChords[chordIndex]);
        });
        //Pads, long note and bass
        //playlogic
        //Play full length of notes
        if (wCheck.isClement) {
          playSynchedSounds(true);
          padReady = false;
        } else {
          //Play the pad sounds
          //using the draw loop
          padReady = true;
        }
        //Humid arpeggio
        if (hScalesNoRests.length > 0) {
          prepareHumidArp(hScalesNoRests);
        }
        //Precipitation arpeggio
        if (pArpScalesNoRests.length > 0) {
          preparePrecipArp(pArpScalesNoRests);
        }
        //Tell rest of app we're playing
        isPlaying = true;
        channel.publish('playing', lwData.name);
      }

      /**
       * ------------------------
       * Scale creation functions
       * ------------------------
       */

      /**
       * Critical function - creates a set of octaves
       * if the correct number of octaves is not produced the app fails
       * @param  {Object}  anConfig  [Includes all the necessary properties]
       * @return {Object} [The scale, the centre note index & the total number of octaves]
       */
      function getAllNotesScale(anConfig) {
        var _highestNoteIndex = anConfig.largestPosNumber + Math.abs(anConfig.rootAndOffset);
        var _lowestNoteIndex = Math.abs(anConfig.largestNegNumber) + Math.abs(anConfig.rootAndOffset);
        var _highestFraction = _highestNoteIndex / anConfig.numSemisPerOctave;
        var _lowestFraction = _lowestNoteIndex / anConfig.numSemisPerOctave;
        var _numUpperOctaves = Math.ceil(_highestFraction);
        var _numLowerOctaves = Math.ceil(_lowestFraction);
        var _totalOctaves = _numUpperOctaves + _numLowerOctaves;
        var _downFirst = false;
        if (_lowestNoteIndex > _highestNoteIndex) {
          _downFirst = true;
        }
        // TODO use latest version of createEqTempMusicalScale
        // which only accepts a config object
        var _allNotesScaleCentreNoteObj = getFreqScales.createEqTempMusicalScale(1, _totalOctaves, anConfig.numSemisPerOctave, _downFirst);
        return {
          allNotesArr: _allNotesScaleCentreNoteObj.scale,
          centreNoteIndex: _allNotesScaleCentreNoteObj.centreFreqIndex,
          numOctaves: _totalOctaves
        };
      }

      // Adds new items to the intervals array
      // should it not have enough notes
      function addMissingNotesFromInterval(pConfig) {
        var _scaleIntervals = [];
        var _highestIndex = pConfig.intervalIndexOffset + pConfig.numNotes;
        var _scaleIntervalsLength = pConfig.scaleIntervals.length;
        if (_highestIndex > _scaleIntervalsLength) {
          var _diff = _highestIndex - _scaleIntervalsLength;
          _scaleIntervals = addMissingArrayItems(pConfig.scaleIntervals, _diff, pConfig.amountToAdd, pConfig.repeatMultiple);
          console.log('added missing items to ' + pConfig.type, _scaleIntervals);
        } else {
          _scaleIntervals = pConfig.scaleIntervals;
        }
        return _scaleIntervals;
      }

      function getPitchesFromIntervals(pConfig) {
        var _scaleArray = [];
        var _intervalIndexOffset = pConfig.intervalIndexOffset;
        var _newNote;
        for (var i = 0; i < pConfig.numNotes; i++) {
          //console.log('note ' + i + ' ' + pConfig.type + ' scaleInterval', pConfig.scaleIntervals[_intervalIndexOffset]);
          //console.log('intervaloffset ' + _intervalIndexOffset + ' centreNoteI ' + pConfig.centreNoteIndex + ' Final index ', pConfig.scaleIntervals[_intervalIndexOffset] + pConfig.centreNoteIndex);
          _newNote = pConfig.allNotesArr[pConfig.scaleIntervals[_intervalIndexOffset] + pConfig.centreNoteIndex];
          //error check
          if (_newNote !== undefined || isNaN(_newNote) === false) {
            _scaleArray.push(_newNote);
          } else {
            console.error('undefined or NaN note');
          }
          _intervalIndexOffset++;
        }
        return _scaleArray;
      }

      //Accepts only an object
      function createMusicalScale(msConfig) {
        //Error check
        if (typeof msConfig !== 'object') {
          console.error('Musical Scale Config must be an object');
          return;
        }
        //Set vars
        var _allNotesArr = [];
        var _centreFreqIndex;
        var _scaleArray = [];
        var _rootAndOffset = rootNote + msConfig.startNote;
        var _scaleIntervals = intervals[msConfig.chordKey];
        // add missing scale intervals
        var _scaleIntervalsFull = addMissingNotesFromInterval({
          amountToAdd: msConfig.amountToAdd,
          intervalIndexOffset: msConfig.inversionStartNote,
          numNotes: msConfig.numNotes,
          repeatMultiple: msConfig.repeatMultiple,
          scaleIntervals: _scaleIntervals,
          type: msConfig.type
        });
        // Inlcude amountToAdd to get true upper number
        var _largestPosNumber = getLargestPosNumInArr(_scaleIntervalsFull) + msConfig.amountToAdd;
        var _largestNegNumber = getLargestNegNumInArr(_scaleIntervalsFull);
        // Once we know the total range required
        // get all the notes/frequencies
        var _allNotesNumOctsCentreFreq = getAllNotesScale({
            largestPosNumber: _largestPosNumber,
            largestNegNumber: _largestNegNumber,
            rootAndOffset: _rootAndOffset,
            numSemisPerOctave: numSemisPerOctave
          });
        _allNotesArr = _allNotesNumOctsCentreFreq.allNotesArr;
        _centreFreqIndex = _allNotesNumOctsCentreFreq.centreNoteIndex;
        // Start at the centre note
        // Then find the root note
        // Then the offset (used by chord seq)
        // After all notes scale has been created
        var _centreNoteIndex = _centreFreqIndex + _rootAndOffset;
        // Inversions are acheived by
        // selecting an index from within the intervals themselves
        _scaleArray = getPitchesFromIntervals({
            allNotesArr: _allNotesArr,
            scaleIntervals: _scaleIntervalsFull,
            centreNoteIndex: _centreNoteIndex,
            numNotes: msConfig.numNotes,
            intervalIndexOffset: msConfig.inversionStartNote,
            amountToAdd: msConfig.amountToAdd,
            repeatMultiple: msConfig.repeatMultiple,
            type: msConfig.type
          });
        return _scaleArray;
      }

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _diff;
        _chordOffsetArr = intervals[chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = addMissingArrayItems(_chordOffsetArr, _diff, null, null);
        }
        return _chordOffsetArr;
      }

      function getInversionOffsetArr(numChords) {
        var _chordInversionOffSetArr = intervals[inversionOffsetType];
        var _diff;
        if (numChords > _chordInversionOffSetArr.length) {
          _diff = numChords - _chordInversionOffSetArr.length;
          _chordInversionOffSetArr = addMissingArrayItems(_chordInversionOffSetArr, _diff, null, null);
        }
        return _chordInversionOffSetArr;
      }

      // If the key's not from a sequence
      // i.e. it's an inversion
      // then get the generic chord type
      function getValidChordType(key) {
        var _chordType;
        if (key) {
          _chordType = key;
        } else {
          _chordType = chordType;
        }
        return _chordType;
      }

      function makeChordSequence() {
        var _chordSeq = [];
        // Chord shift
        var _chordSeqOffsetArr = getChordSeqOffsetArr(chordNumGreatest);
        // Chord inversion shift
        var _inversionOffsetArr = getInversionOffsetArr(chordNumGreatest);
        console.log('_inversionOffsetArr.length', _inversionOffsetArr.length);
        console.log('numChords', numChords);
        console.log('chordNumGreatest', chordNumGreatest);
        // Handle array lengths
        // if there's not enough chords (offset indices) in the array
        if (chordNumGreatest > _chordSeqOffsetArr.length) {
          _chordSeqOffsetArr = addMissingArrayItems(_chordSeqOffsetArr, chordNumGreatest - _chordSeqOffsetArr.length, null, null);
        }
        if (chordNumGreatest > _inversionOffsetArr.length) {
          _chordSeqOffsetArr = addMissingArrayItems(_inversionOffsetArr, chordNumGreatest - _inversionOffsetArr.length, null, null);
        }
        // Create primary chords
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(createMusicalScale({
            numNotes: numPadNotes,
            startNote: _chordSeqOffsetArr[i].index,
            chordKey: getValidChordType(_chordSeqOffsetArr[i].key),
            inversionStartNote: _inversionOffsetArr[i],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad'
          }));
        }
        // Create extra sequence chord(s)
        for (var j = 0; j < numExtraChords; j++) {
          _chordSeq.push(createMusicalScale({
            numNotes: numPadNotes,
            startNote: _chordSeqOffsetArr[j].index - extraSeqOffset,
            chordKey: getValidChordType(_chordSeqOffsetArr[j].key),
            inversionStartNote: _inversionOffsetArr[j],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad extra'
          }));
        }
        return _chordSeq;
      }

      function createHumidArpScales() {
        var _intervalIndexOffset = 0;
        var _hArpCNoteOffset = 0;
        var _hArpScalesNoRests = [];
        //var _numHumidArpNotes = avSettings.numHumidArpNotes;
        var _numHumidArpNotes = intervals[humidArpIntervalsKey].length;
        var _mainHArpScale = createMusicalScale({
          numNotes: _numHumidArpNotes,
          startNote: _hArpCNoteOffset,
          chordKey: humidArpIntervalsKey,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp'
        });
        var _extraHArpScale = createMusicalScale({
          numNotes: _numHumidArpNotes,
          startNote: _hArpCNoteOffset + invExtraSeqOffset,
          chordKey: humidArpIntervalsKey,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp'
        });
        _hArpScalesNoRests.push(_mainHArpScale, _extraHArpScale);
        return _hArpScalesNoRests;
      }

      function createPrecipArpScales() {
        var _pArpCNoteOffset = -Math.abs(numSemisPerOctave * 2);
        // When adding missing values
        // go up two octaves
        var _repeatMultiple = 2;
        var _intervalIndexOffset = 0;
        var _pArpScalesNoRests = [];
        var _mainPArpScale = createMusicalScale({
          numNotes: avSettings.numPrecipArpNotes,
          startNote: _pArpCNoteOffset,
          chordKey: precipArpIntervalType,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp'
        });
        var _extraPArpScale = createMusicalScale({
          numNotes: avSettings.numPrecipArpNotes,
          startNote: _pArpCNoteOffset + invExtraSeqOffset,
          chordKey: precipArpIntervalType,
          inversionStartNote: _intervalIndexOffset,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp'
        });
        _pArpScalesNoRests.push(_mainPArpScale, _extraPArpScale);
        return _pArpScalesNoRests;
      }

      /*
      	Create necessary scales
       */
      function configureSounds() {
        var _pArpScalesNoRests = [];
        var _hArpScalesNoRests = [];
        //Make arrays of frequencies for playback
        synchedSoundsChords = makeChordSequence();
        // Set filter for pad sounds
        setFilter();
        setReverb();
        //Set the root note rate
        //for use elsewhere in program
        rootNoteRate = synchedSoundsChords[chordIndex][0];
        //playlogic
        if (wCheck.isPrecip) {
          _pArpScalesNoRests = createPrecipArpScales();
        }
        //Humid arpeggio will not play if
        //other lead sounds are playing
        if (sCheck.harpCanPlay) {
          _hArpScalesNoRests = createHumidArpScales();
        }
        //Explicitly passing these arrays as args
        //For clarity
        playSounds(_pArpScalesNoRests, _hArpScalesNoRests);
      }

      /**
       * ------------------------
       * Display creation functions
       * ------------------------
       */

      function formatCoStrings(displayData) {
        return displayData.map(function(displayProp) {
          var _musicValueLowerCase;
          var _musicValue;
          //Add spaces where necessary
          if (typeof displayProp.musicValue === 'string') {
            _musicValue = microU.addSpacesToString(displayProp.musicValue);
            if (displayProp.musicKey !== 'rootNote') {
              _musicValueLowerCase = microU.strToLowerCase(_musicValue);
            } else {
              _musicValueLowerCase = _musicValue;
            }
            displayProp.musicValue = microU.removeStrFromStart('inversions', _musicValueLowerCase);
          }
          return displayProp;
        });
      }

      function buildDisplay(coDisplayData) {
        //Format strings and numbers
        var _formattedCoData = formatCoStrings(coDisplayData);
        //TODO perf - should use for loop for speed?
        _formattedCoData.forEach(function(coDisplayObj) {
          //Only show true or valid values
          //Zero is valid for most conditions
          if (coDisplayObj.value !== undefined && coDisplayObj.value !==
            false) {
            //filter out negative values that are true
            //or don't exist
            if (coDisplayObj.negativeValue === undefined || coDisplayObj.negativeValue === false) {
              var _itemTmpl = appTemplate(coDisplayObj);
              cdContainer.insertAdjacentHTML('beforeend', _itemTmpl);
              var _lastItem = cdContainer.lastElementChild;
              fadeInDisplayItem(_lastItem);
            }
          } else {
            //'Not displayed because not defined or false ', coProp);
          }
        });
      }

      function getDisplayDataVals() {
        return {
          numChords: numChords,
          numExtraChords: numExtraChords,
          numSemisPerOctave: numSemisPerOctave,
          rootNote: rootNote,
          noteLengthMult: noteLengthMult,
          masterFilterFreq: masterFilterFreq,
          seqRepeatNum: seqRepeatNum,
          longNoteIndex: longNoteIndex,
          reverbLength: reverbLength,
          precipArpBpm: precipArpBpm,
          precipCategory: precipCategory,
          rideCymbalBpm: rideCymbalBpm,
          rideCymbalRate: rideCymbalRate,
          rideCymbalMaxVolume: rideCymbalMaxVolume * 10,
          humidArpBpm: humidArpBpm,
          humidArpIntervalsKey: humidArpIntervalsKey,
          chordType: chordType,
          chordSeqKey: chordSeqKey,
          padType: padType,
          longNoteType: longNoteType,
          inversionOffsetType: inversionOffsetType,
          numPadNotes: numPadNotes
        };
      }

      //Only used if web worker is not available
      function configureDisplay(musicDisplayVals) {
        //Set the data vals using
        //module scoped data
        var _setCoDisplayGroupVals = coFns(
          coDisplayData,
          lwData,
          wCheck,
          musicDisplayVals
        );
        var _finalCoData = _setCoDisplayGroupVals();
        buildDisplay(_finalCoData);
      }

      function configureAudioVisual() {
        var _musicDisplayVals = getDisplayDataVals();
        //Create a thread to set
        //values for display
        if (window.Worker) {
          var displayWorker = work(require('./display-worker.js'));
          displayWorker.addEventListener('message', function(result) {
            buildDisplay(result.data);
            displayWorker.terminate();
          });
          displayWorker.onerror = function(e) {
            console.log('Error with web worker on ' + 'Line #' + e.lineno +' - ' + e.message + ' in ' + e.filename);
            configureDisplay(_musicDisplayVals);
          };
          displayWorker.postMessage({
            coDisplayData: coDisplayData,
            lwData: lwData,
            wCheck: wCheck,
            musicDisplayVals: _musicDisplayVals
          });
        }
        //Or just work it out in main thread
        else {
          configureDisplay(_musicDisplayVals);
        }
        // While other thread runs
        // configure Sounds
        configureSounds();
        // Change page styles to match conditions
        pageTheme(lwData, wCheck);
      }

      //P5 PRELOAD FN - 1
      sketch.preload = function() {
        //loadSound called during preload
        //will be ready to play in time for setup
        //Pad sounds for various weather types
        for (var i = 0; i < numPadNotes; i++) {
          padSounds.push(sketch.loadSound('/audio/' + padType + '-C2.mp3'));
        }
        //Long note accompanies pad
        longNote = sketch.loadSound('/audio/' + longNoteType + '-C3.mp3');
        dropSound = sketch.loadSound('/audio/drop-' + precipCategory + '.mp3');
        //choral sounds for fine/freezing weather
        for (var j = 0; j < 2; j++) {
          choralSounds.push(sketch.loadSound('/audio/choral.mp3'));
        }
        //TODO only load these if conditions are so
        bass = sketch.loadSound('/audio/bass.mp3');
        bass2 = sketch.loadSound('/audio/bass.mp3');
        brassBaritone = sketch.loadSound('/audio/brass-baritone.mp3');
        brassBaritone2 = sketch.loadSound('/audio/brass-baritone.mp3');
        harpSound = sketch.loadSound('/audio/harp-C3.mp3');
        chineseCymbal = sketch.loadSound('/audio/chinese-cymbal.mp3');
        timpani = sketch.loadSound('/audio/timpani.mp3');
        djembe = sketch.loadSound('/audio/djembe.mp3');
        rhodes = sketch.loadSound('/audio/rhodes.mp3');
        rideCymbal = sketch.loadSound('/audio/ride-cymbal.mp3');
      };

      //P5 SETUP FN - 2
      sketch.setup = function setup() {
        sketch.frameRate(appFrameRate);
        //--------------------------
        // Handle sounds / Start app
        // -------------------------
        configureAudioVisual();
      };

      /**
       * ------------------------
       * Music update functions
       * ------------------------
       */

      function updateMasterVol() {
        sketch.masterVolume(masterGain);
        if (masterGain < 0.9) {
          masterGain += 0.01;
        } else {
          maxMasterVolSet = true;
        }
      }

      function updateSynchedSounds() {
        if (sketch.frameCount === 1 || sketch.frameCount % currNoteLength === 0) {
          playSynchedSounds(false);
          //Temporarily stop the call of this fn
          //while we set a new note length
          padReady = false;
          updateNoteLength();
        }
      }

      function updateLeadSound() {
        if (sketch.frameCount === 1 || sketch.frameCount % currLeadLength ===
          0) {
          //get the note
          var _leadSoundRate = synchedSoundsChords[chordIndex][
            leadSoundIndex
          ];
          leadSoundReady = false;
          //If we want to stop the lead
          //after each play of the notes in chord
          //if (!leadBarComplete) {
          rhodes.play();
          rhodes.setVolume(leadVolume, rampTime, timeFromNow, startVol);
          rhodes.rate(_leadSoundRate);
          updateLeadSoundIndex();
          //}
          updateLeadSoundLength();
        }
      }

      function updateChinaCymbal() {
        if (sketch.frameCount % 600 === 0 && sketch.frameCount !== 0) {
          chineseCymbal.play();
          chineseCymbal.setVolume(0.5, rampTime, timeFromNow, startVol);
          chineseCymbal.rate(rootNoteRate);
        }
      }

      function updateTimpani() {
        if (sketch.frameCount % 300 === 0 && sketch.frameCount !== 0) {
          timpani.play();
          timpani.setVolume(0.5, rampTime, timeFromNow, startVol);
          timpani.rate(rootNoteRate);
        }
      }

      function updateRideCymbal() {
        if (sketch.frameCount % rideCymbalStepTime === 0) {
          // Handle volumes
          var _rideVol = sketch.random(rideCymbalVolumeArr);
          // Handle filter
          if (wCheck.isFoggy) {
            rideCymbal.disconnect();
            rideCymbal.connect(foggyFilter);
          }
          rideCymbal.play();
          rideCymbal.setVolume(_rideVol, rampTime, timeFromNow, startVol);
          rideCymbal.rate(rideCymbalRate);
          djembe.pan(-0.35);
        }
      }

      function updateDjembe() {
        if (sketch.frameCount % djembeStepTime === 0) {
          var _djembeVol = sketch.random(djembeVolArr);
          djembe.play();
          djembe.setVolume(_djembeVol, rampTime, timeFromNow, startVol);
          djembe.rate(1);
          djembe.pan(0.35);
        }
      }

      function stopBrass() {
        brassBaritone.setVolume(0, rampTime, timeFromNow, startVol);
        brassBaritone2.setVolume(0, rampTime, timeFromNow, startVol);
      }

      function updateBrass() {
        if (angle > 360) {
          angle = 0;
        }
        sinVal = sketch.sin(angle);
        cosVal = sketch.cos(angle + 90);
        brassBaritone.pan(sinVal);
        brassBaritone2.pan(cosVal);
        if (sketch.frameCount % brassBaritoneStepTime === 0) {
          channel.publish('triggerBrassOne');
        }
        if (sketch.frameCount % brassBaritone2StepTime === 0) {
          channel.publish('triggerBrassTwo');
        }
        //angle += 0.03;
        angle += inc;
      }

      function updateFreezingFilter() {
        if (freezingFilterFreq >= 5500) {
          freezingFilterFreq = 0;
        }
        freezingFilter.freq(freezingFilterFreq);
        freezingFilter.res(33);
        freezingFilterFreq++;
      }

      function updateFoggyFilter() {
        if (foggyFilterFreq >= 2000) {
          foggyFilterFreq = 0;
        }
        foggyFilter.freq(foggyFilterFreq);
        foggyFilter.res(22);
        foggyFilterFreq++;
      }

      function updateHumidArp() {
        if (sketch.frameCount % humidArpStepTime === 0) {
          var _harpVol = sketch.random(harpVolArr);
          // Handle extra seq
          if (extraSeqPlaying) {
            console.log('extraSeqPlaying', extraSeqPlaying);
            hArpSeqIndex = 1;
          } else {
            hArpSeqIndex = 0;
          }
          // Loop
          if (humidArpScaleIndex >= humidArpScales[hArpSeqIndex].length) {
            humidArpScaleIndex = 0;
          }
          // Handle filter
          if (wCheck.isFoggy) {
            harpSound.disconnect();
            harpSound.connect(foggyFilter);
          }
          // NB differs from order used elsewhere
          harpSound.setVolume(_harpVol, rampTime, timeFromNow, startVol);
          harpSound.play();
          harpSound.rate(humidArpScales[hArpSeqIndex][humidArpScaleIndex]);
          humidArpScaleIndex++;
        }
      }

      function updatePrecipArp() {
        if (sketch.frameCount % precipArpStepTime === 0) {
          // Handle extra seq
          if (extraSeqPlaying) {
            console.log('extraSeqPlaying', extraSeqPlaying);
            pArpSeqIndex = 1;
          } else {
            pArpSeqIndex = 0;
          }
          // loop
          if (precipArpScaleIndex >= precipArpScales[pArpSeqIndex].length) {
            precipArpScaleIndex = 0;
          }
          dropSound.play();
          dropSound.setVolume(avSettings.dropSoundVol[precipCategory]);
          dropSound.rate(precipArpScales[pArpSeqIndex][precipArpScaleIndex]);
          precipArpScaleIndex++;
        }
      }

      //P5 DRAW LOOP - 3
      sketch.draw = function draw() {
        if (!sequenceStart) {
          updateRideCymbal();
        }
        if (padReady) {
          updateSynchedSounds();
        }
        if (sequenceStart && leadSoundReady) {
          updateLeadSound();
        }
        //playlogic
        if (wCheck.isOminous) {
          updateChinaCymbal();
          if (!sequenceStart) {
            updateDjembe();
          }
        }
        if (sCheck.timpaniCanPlay) {
          updateTimpani();
        }
        if (wCheck.isWindy) {
          if (!extraSeqPlaying) {
            updateBrass();
          } else {
            stopBrass();
          }
        }
        if (wCheck.isPrecip) {
          if (precipArpReady && sequenceStart) {
            updatePrecipArp();
          }
        }
        if (sCheck.harpCanPlay) {
          if (humidArpReady && sequenceStart) {
            updateHumidArp();
          }
        }
        if (wCheck.isFreezing) {
          updateFreezingFilter();
        }
        if (wCheck.isFoggy) {
          updateFoggyFilter();
        }
        //sequencer counter
        if (sketch.frameCount % sequenceLength === 0 && sequenceStart === false) {
          sequenceStart = true;
          console.log('sequenceStart', sequenceStart);
        } else if (sketch.frameCount % sequenceLength === 0 && sequenceStart === true) {
          sequenceStart = false;
          console.log('sequenceStart', sequenceStart);
        }
        //Master volume
        //Fade in on play
        if (!maxMasterVolSet) {
          updateMasterVol();
        }
      };
    });
    return myP5;
  }

  channel.subscribe('userUpdate', function(data) {
    createP5SoundObjs();
    init(data);
  });

  function clearAndStopWhenDone(autoStart) {
    cdContainer.innerHTML = '';
    fadeOutAllSounds(autoStart);
  }

  channel.subscribe('stop', function(autoStart) {
    var _allDisplayItems = document.querySelectorAll('.conditions-display__item');
    for (var i = 0, length = _allDisplayItems.length; i < length; i++) {
      fadeOutDisplayItems(_allDisplayItems[i], i, _allDisplayItems.length, clearAndStopWhenDone, autoStart);
    }
  });

  return true;
};
