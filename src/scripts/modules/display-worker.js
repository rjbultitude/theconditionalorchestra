'use strict';

//Get display Data setter fns
var coFns = require('./co-display-fns');

module.exports = function (self) {
    self.addEventListener('message', function (dataObjects) {
      //Make fns available
      var _coDisplayMod = coFns(
        dataObjects.coDisplayData,
        dataObjects.lwData,
        dataObjects.wCheck,
        dataObjects.musicDisplayVals
      );
      var _finalCoData = _coDisplayMod.setCoDisplayGroupVals();
      self.postMessage(_finalCoData);
    });
};
