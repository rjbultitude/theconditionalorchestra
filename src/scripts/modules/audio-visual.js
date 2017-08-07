/*
	This module manages the
  sonic and visual output of the app
 */

'use strict';
//3rd party
var P5 = require('../libs/p5');
require('../libs/p5.sound');
var freqi = require('freqi');
var postal = require('postal');
var channel = postal.channel();
var appTemplate = require('../templates/index').codisplay;
var work = require('webworkify');
//custom
var coDisplayData = require('./co-display-data');
var weatherCheck = require('./weather-checker-fns');
var microU = require('../utilities/micro-utilities');
var intervals = require('../utilities/intervals');
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
  var padFilter;
  var freezingFilter;
  var foggyFilter;
  var longNoteFilter;
  // pan
  var angle = 180;
  var sinVal = 0;
  var cosVal = 0;
  var panArr = [-0.8, 0, 0.8];
  var longNotePanArr = [-0.2, 0, 0.2];
  // Sound objects
  var padSounds = [];
  var choralSounds = [];
  var choralScales = [];
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
  // Workers
  var drawWorker;

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
    padFilter = new P5.LowPass();
    longNoteFilter = new P5.LowPass();
    freezingFilter = new P5.HighPass();
    foggyFilter = new P5.HighPass();
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
      isFreezingAndHumid: weatherCheck.isFreezingAndHumid(lwData.humidity.value, lwData.temperature.value),
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
      isMildAndBreezy: weatherCheck.isMildAndBreezy(lwData.temperature.value, lwData.windSpeed.value),
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
    var precipArpBps = precipArpBpm / 60;
    var precipArpStepTime = Math.round(appFrameRate / precipArpBps);
    var precipArpIntervalType = audioGets.getPrecipArpIntervalType(chordType);
    var leadVolume = audioGets.getLeadSoundVolume(wCheck);
    var padType = audioGets.getPadType(wCheck);
    var padVolume = audioGets.getPadVolume(wCheck, sCheck, padType, avSettings);
    var inversionOffsetType = audioGets.getInversionOffsetKey(wCheck);
    // Humidity
    // TODO Group these into object
    // and only create it if it's humid
    var humidArpBpm = audioGets.getHumidArpBpm(lwData);
    var humidArpBps = humidArpBpm / 60;
    var humidArpStepTime = Math.round(appFrameRate / humidArpBps);
    var humidArpIntervalsKey = audioGets.getHumidArpIntervals(lwData, chordType);
    var harpVolArr = audioGets.getHarpVolArr(wCheck, sCheck);
    // Root note
    // Is an index rather than a frequency
    var rootNoteRange = audioGets.getRootNoteRange(numSemisPerOctave);
    var rootNote = audioGets.getRootNote(lwData, rootNoteRange);
    console.log('rootNote', rootNote);
    var rootNoteHigh = audioGets.isRootNoteHigh(rootNote);
    var rootNoteGrtrMedian = audioGets.isRootNoteGrtrMedian(rootNote, rootNoteRange);
    console.log('rootNoteGrtrMedian', rootNoteGrtrMedian);
    var longNoteIndex = audioGets.getLongNoteIndex(lwData, numPadNotes);
    var longNoteHigh = audioGets.isLongNoteHigh(rootNoteGrtrMedian, rootNoteHigh, longNoteIndex, numPadNotes);
    console.log('longNoteHigh', longNoteHigh);
    var longNoteVolArr = audioGets.getLongNoteVolArr(wCheck);
    console.log('longNoteVolArr', longNoteVolArr);
    var longNoteType = audioGets.getLongNoteType(wCheck);
    var longNoteFilterFreq = audioGets.getLongNoteFilterFreq(lwData, avSettings);
    var padFilterFreq = audioGets.getPadFilterFreq(lwData, avSettings);
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
    // Choral
    var choralSoundVol = audioGets.getChoralSoundVol(wCheck);
    var choralDenominator = wCheck.isFreezing ? 2 : 1;
    var choralExtraDenominator = rootNoteGrtrMedian ? 2 : 1;
    //Set initial note lengths for use in draw
    var currNoteLength = noteLengths[0];
    var currLeadLength = leadNoteLengths[0];

    //Create p5 sketch
    var myP5 = new P5(function(sketch) {

      // used for Brass pan
      var inc = sketch.TWO_PI / 150;

      channel.subscribe('allStopped', function() {
        if (window.Worker) {
          drawWorker.postMessage({draw: false});
        } else {
          sketch.noLoop();
        }
      });

      /**
       * ------------------------
       * Set base effects
       * ------------------------
       */
      function setPadFilter() {
        padFilter.freq(padFilterFreq);
        padFilter.res(20);
      }

      function setLongNoteFilter() {
        longNoteFilter.freq(longNoteFilterFreq);
        longNoteFilter.res(10);
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

      // Used with the two mechanisms
      // for pad playback
      function moveToNextChord() {
        // increment indices
        setChordIndex();
        // Start the lead over
        leadBarComplete = false;
      }

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
        // TODO add wCheck.isFreezing? So flute isnt so ugly
        if (extraSeqPlaying || longNoteHigh || wCheck.isFreezingAndHumid || longNoteType === 'shiney') {
          _longNoteRate = _longNoteRate / 2;
        }
        // playlogic
        // play full note if visibility is poor
        // and the weather is inclement
        // Clement weather is full pad notes
        if (!wCheck.isVisbilityPoor || !wCheck.isClement) {
          longNote.playMode('restart');
        }
        longNote.disconnect();
        longNote.connect(longNoteFilter);
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
            moveToNextChord();
            playSynchedSounds(true);
            padIndexCount = 0;
          }
        }
      }

      function playPad(playFullNotes) {
        for (var i = 0, length = padSounds.length; i < length; i++) {
          // TODO can we connect in setup?
          padSounds[i].disconnect();
          padSounds[i].connect(padFilter);
          padSounds[i].pan(panArr[panIndex]);
          padSounds[i].playMode('restart');
          padSounds[i].play();
          padSounds[i].setVolume(padVolume, rampTime, timeFromNow, startVol);
          padSounds[i].rate(synchedSoundsChords[chordIndex][i]);
          // If we want to play the play full note length
          // use the onended callback
          if (playFullNotes) {
            padSounds[i].onended(padCallBack);
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
      }

      function playChoralSound() {
        // TODO consider for loop for speed
        choralSounds.forEach(function(choralSound, i) {
          // playlogic
          if (wCheck.isFreezing) {
            choralSound.disconnect();
            choralSound.connect(freezingFilter);
          }
          // must loop before rate is set
          // issue in Chrome only
          choralSound.loop();
          choralSound.rate(choralScales[0][i] / choralDenominator);
          choralSound.setVolume(choralSoundVol, rampTime, timeFromNow, startVol);
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
          playChoralSound();
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
        // Pads, long note and bass
        // playlogic
        // Play full length of notes
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

      function getChordSeqOffsetArr(numChords) {
        var _chordOffsetArr = [];
        var _diff;
        _chordOffsetArr = intervals[chordSeqKey];
        // error check
        if (numChords > _chordOffsetArr.length) {
          _diff = numChords - _chordOffsetArr.length;
          _chordOffsetArr = freqi.augmentNumArray({
            originalArray: _chordOffsetArr,
            difference: _diff,
            repeatMultiple: 0,
            amountToAdd: 0
          });
        }
        return _chordOffsetArr;
      }

      function getInversionOffsetArr(numChords) {
        var _chordInversionOffSetArr = intervals[inversionOffsetType];
        console.log('_chordInversionOffSetArr', _chordInversionOffSetArr);
        var _diff;
        if (numChords > _chordInversionOffSetArr.length) {
          _diff = numChords - _chordInversionOffSetArr.length;
          _chordInversionOffSetArr = freqi.augmentNumArray({
            originalArray: _chordInversionOffSetArr,
            difference: _diff,
            repeatMultiple: 0,
            amountToAdd: 0
          });
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
        // Create primary chords
        for (var i = 0; i < numChords; i++) {
          _chordSeq.push(freqi.getFreqs({
            startFreq: 1,
            numSemitones: numSemisPerOctave,
            numNotes: numPadNotes,
            rootNote: _chordSeqOffsetArr[i].index + rootNote,
            intervals: intervals[getValidChordType(_chordSeqOffsetArr[i].key)],
            intervalStartIndex: _inversionOffsetArr[i],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad'
          }));
        }
        // Create extra sequence chord(s)
        for (var j = 0; j < numExtraChords; j++) {
          _chordSeq.push(freqi.getFreqs({
            startFreq: 1,
            numSemitones: numSemisPerOctave,
            numNotes: numPadNotes,
            rootNote: _chordSeqOffsetArr[j].index - extraSeqOffset + rootNote,
            intervals: intervals[getValidChordType(_chordSeqOffsetArr[j].key)],
            intervalStartIndex: _inversionOffsetArr[j],
            amountToAdd: numSemisPerOctave,
            repeatMultiple: 0,
            type: 'pad extra'
          }));
        }
        return _chordSeq;
      }

      function createChoralScales() {
        var _choralScales = [];
        var _mainChoralScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: choralSounds.length,
          rootNote: rootNote,
          intervals: intervals.heptatonicMajorIntervals,
          intervalStartIndex: 0,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'choral'
        });
        var _extraChoralScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: choralSounds.length,
          rootNote: rootNote - extraSeqOffset,
          intervals: intervals.heptatonicMajorIntervals,
          intervalStartIndex: 0,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'choral extra'
        });
        _choralScales.push(_mainChoralScale, _extraChoralScale);
        return _choralScales;
      }

      function createHumidArpScales() {
        var _hArpScalesNoRests = [];
        var _numHumidArpNotes = intervals[humidArpIntervalsKey].length;
        var _mainHArpScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: _numHumidArpNotes,
          rootNote: rootNote,
          intervals: intervals[humidArpIntervalsKey],
          intervalStartIndex: 0,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp'
        });
        var _extraHArpScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: _numHumidArpNotes,
          rootNote: rootNote + invExtraSeqOffset,
          intervals: intervals[humidArpIntervalsKey],
          intervalStartIndex: 0,
          amountToAdd: 0,
          repeatMultiple: 0,
          type: 'humid arp extra'
        });
        _hArpScalesNoRests.push(_mainHArpScale, _extraHArpScale);
        return _hArpScalesNoRests;
      }

      function createPrecipArpScales() {
        var _pArpScalesNoRests = [];
        var _pArpCNoteOffset = -Math.abs(numSemisPerOctave * 2) + rootNote;
        // When adding missing values
        // go up two octaves
        var _repeatMultiple = 2;
        var _mainPArpScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: avSettings.numPrecipArpNotes,
          rootNote: _pArpCNoteOffset,
          intervals: intervals[precipArpIntervalType],
          intervalStartIndex: 0,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp'
        });
        var _extraPArpScale = freqi.getFreqs({
          startFreq: 1,
          numSemitones: numSemisPerOctave,
          numNotes: avSettings.numPrecipArpNotes,
          rootNote: _pArpCNoteOffset + invExtraSeqOffset,
          intervals: intervals[precipArpIntervalType],
          intervalStartIndex: 0,
          amountToAdd: numSemisPerOctave,
          repeatMultiple: _repeatMultiple,
          type: 'precip arp extra'
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
        // Make arrays of frequencies for playback
        synchedSoundsChords = makeChordSequence();
        // Set filter for pad sounds
        setPadFilter();
        setLongNoteFilter();
        // Set the root note rate
        // for use elsewhere in program
        rootNoteRate = synchedSoundsChords[chordIndex][0];
        // playlogic
        if (wCheck.isPrecip) {
          _pArpScalesNoRests = createPrecipArpScales();
        }
        // Humid arpeggio will not play if
        // other lead sounds are playing
        if (sCheck.harpCanPlay) {
          _hArpScalesNoRests = createHumidArpScales();
        }
        if (sCheck.choralCanPlay) {
          choralScales = createChoralScales();
        }
        // Explicitly passing these arrays as args
        // as they require extra preparation
        playSounds(_pArpScalesNoRests, _hArpScalesNoRests);
      }

      /**
       * ------------------------
       * Display creation functions
       * ------------------------
       */

      function formatMusicalValStrings(displayData) {
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

      function formatWCheckBools(displayData) {
        return displayData.map(function(displayProp) {
          // Remove boolean values
          if (displayProp.value === true) {
            displayProp.value = '';
          }
          return displayProp;
        });
      }

      function buildDisplay(coDisplayData) {
        // Format strings and numbers
        var _formattedMusicValData = formatMusicalValStrings(coDisplayData);
        var _formattedWCheckBools = formatWCheckBools(_formattedMusicValData);
        // TODO perf - should use for loop for speed?
        _formattedWCheckBools.forEach(function(coDisplayObj) {
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
          padFilterFreq: padFilterFreq,
          seqRepeatNum: seqRepeatNum,
          longNoteIndex: longNoteIndex,
          longNoteFilterFreq: longNoteFilterFreq,
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

      // Only used if web worker is not available
      function configureDisplay(musicDisplayVals) {
        // Set the data vals using
        // module scoped data
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
          moveToNextChord();
          playSynchedSounds(false);
          // Temporarily stop the call of this fn
          // while we set a new note length
          padReady = false;
          updateNoteLength();
        }
      }

      function updateLeadSound() {
        if (sketch.frameCount === 1 || sketch.frameCount % currLeadLength === 0) {
          //get the note
          var _leadSoundRate = synchedSoundsChords[chordIndex][leadSoundIndex];
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
        }
      }

      function updateDjembe() {
        if (sketch.frameCount % djembeStepTime === 0) {
          var _djembeVol = sketch.random(djembeVolArr);
          djembe.play();
          djembe.setVolume(_djembeVol, rampTime, timeFromNow, startVol);
          djembe.rate(1);
          // TODO alternate pan?
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

      function updateChoralSound() {
        if (extraSeqPlaying) {
          choralSounds.forEach(function(choralSound, i) {
            choralSound.rate(choralScales[1][i] / choralExtraDenominator);
          });
        } else {
          choralSounds.forEach(function(choralSound, i) {
            // pitch down via choralDenominator
            // if conditions are freezing
            choralSound.rate(choralScales[0][i] / choralDenominator);
          });
        }
      }

      function updateAllSounds() {
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
        if (sCheck.choralCanPlay) {
          updateChoralSound();
        }
        //sequencer counter
        if (sketch.frameCount % sequenceLength === 0 && sequenceStart === false) {
          sequenceStart = true;
          console.log('sequenceStart', sequenceStart);
        } else if (sketch.frameCount % sequenceLength === 0 && sequenceStart === true) {
          sequenceStart = false;
          console.log('sequenceStart', sequenceStart);
        }
        // Master volume
        // Fade in on play
        if (!maxMasterVolSet) {
          updateMasterVol();
        }
      }

      // Draw using p5
      // if worker fails
      function startSketchDraw() {
        sketch.draw = function draw() {
          updateAllSounds();
        };
      }

      // P5 PRELOAD - 1
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

      // P5 DRAW / Worker - 3
      function startDraw() {
        if (window.Worker) {
          drawWorker = work(require('./draw-worker.js'));
          drawWorker.addEventListener('message', function(e) {
            if (e.data.msg === 'tick') {
              updateAllSounds();
            }
          });
          drawWorker.postMessage({draw: true, rate: appFrameRate});
          drawWorker.onerror = function(e) {
            console.log('Error with web worker on ' + 'Line #' + e.lineno +' - ' + e.message + ' in ' + e.filename);
            startSketchDraw();
          };
        } else {
          startSketchDraw();
        }
      }

      // P5 SETUP - 2
      sketch.setup = function setup() {
        sketch.frameRate(appFrameRate);
        //--------------------------
        // Handle sounds / Start app
        // -------------------------
        configureAudioVisual();
        startDraw();
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

  return {
    updateAllSounds: updateAllSounds
  };
};
