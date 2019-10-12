

//Get display Data setter fns
var coFns = require('./co-display-fns');

self.addEventListener('message', function(workerData) {
  console.log('Data objects received ', workerData.data);
  //Make fns available
  var _setCoDisplayGroupVals = coFns(
    workerData.data.coDisplayData,
    workerData.data.lwData,
    workerData.data.wCheck,
    workerData.data.musicDisplayVals
  );
  var _finalCoData = _setCoDisplayGroupVals();
  self.postMessage(_finalCoData);
});
