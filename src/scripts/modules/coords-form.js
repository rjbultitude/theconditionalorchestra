'use strict';

var Darksky = require('darkskyjs');
var GoogleMapsLoader = require('google-maps');
var postal = require('postal');
var channel = postal.channel();
var Nll = require('./nll-cnstrctr');
var maxMin = require('../settings/max-min-values');
var updateStatus = require('./update-status');
var microU = require('../utilities/micro-utilities');
var makeRequest = require('../utilities/make-request');
var classListChain = require('../utilities/class-list-chain');
var getMeanVal = require('../utilities/get-mean-val');

module.exports = function() {
  //Vars
  var userLocBtnEl = document.getElementById('use-location-btn');
  var linkLocationSelectEl = document.getElementById('link-location-select');
  var coordsFormEl = document.querySelector('[data-ref="form-coords"]');
  var coordsFormInputEl = coordsFormEl.querySelector(
    '[data-ref="place-field"]');
  var coordsFormSubmitBtnEl = coordsFormEl.querySelector(
    '[data-ref="submit"]');
  var coordsFormCloseBtnEl = coordsFormEl.querySelector('[data-ref="close"]');
  var lastKnownSuffix = 'LastKnown';
  var staticSuffix = 'Static';
  // module state vars
  var isPlaying = false;
  var usingStaticData = false;

  function resetModState() {
    isPlaying = false;
    usingStaticData = false;
  }

  function enableControls() {
    userLocBtnEl.disabled = false;
    coordsFormSubmitBtnEl.disabled = false;
  }

  function disableControls() {
    userLocBtnEl.disabled = true;
    coordsFormSubmitBtnEl.disabled = true;
  }

  function NumericCondition(value, min, max) {
    this.value = value;
    this.min = min;
    this.max = max;
  }

  function LocationData() {
    this.cloudCover = null;
    this.windSpeed = null;
    this.pressure = null;
    this.precipIntensity = null;
    this.temperature = null;
    this.visibility = null;
    this.humidity = null;
    this.windBearing = null;
    this.ozone = null;
    this.precipProbability = null;
    this.dewPoint = null;
    this.apparentTemperature = null;
    this.nearestStormBearing = null;
    this.nearestStormDistance = null;
  }

  function checkLocationDataKeys(altData) {
    var _locationData = new LocationData();
    for (var _condition in _locationData) {
      if (_locationData.hasOwnProperty(_condition)) {
        if (altData.hasOwnProperty(_condition) === false) {
          console.error(_condition + ' Property doesn\'t exist');
          return false;
        }
      }
    }
    return true;
  }

  function fixlwDataRanges(lwData) {
    for (var condition in lwData) {
      if (lwData.hasOwnProperty(condition) && typeof lwData[condition].value === 'number') {
        if (lwData[condition].value < lwData[condition].min) {
          console.log('Value out of range', condition, lwData[condition]);
          lwData[condition].value = lwData[condition].min;
        } else if (lwData[condition].value > lwData[condition].max) {
          console.log('Value out of range', condition, lwData[condition]);
          lwData[condition].value = lwData[condition].max;
        }
      }
    }
    return lwData;
  }

  function inferVisibility(conditions, locationData) {
    var _altVisVals = [];
    if (conditions[0].visibility() !== undefined) {
      console.log('valid visibility data');
      return conditions[0].visibility();
    } else {
      _altVisVals.push(locationData.cloudCover.value);
      _altVisVals.push(locationData.humidity.value);
      _altVisVals.push(microU.mapRange(
        locationData.precipIntensity.value,
        locationData.precipIntensity.min,
        locationData.precipIntensity.max,
        0,
        100
      ) / 100);
      return 10 - (microU.addArrayItems(_altVisVals) / _altVisVals.length) *
        10;
    }
  }

  function updateApp(lat, long, name) {
    var newLocation = new Nll(lat, long, name);
    var newLocations = [];
    //Notify UI
    updateStatus('weather');
    //Get API wrapper
    var forecast = new Darksky({
      PROXY_SCRIPT: '/proxy.php'
    });
    //Must use array for darksky wrapper
    newLocations.push(newLocation);
    forecast.getCurrentConditions(newLocations, function(conditions) {
      //If there's a problem with the darksky service
      //load the static weather
      //TODO test this
      if (conditions === false) {
        console.log('There was a problem retrieving data from darksky');
        conditions = makeRequest('GET', 'data/static-data.json');
      }
      //must make new object at this point
      var locationData = new LocationData();
      // Set numerical integer and floating point values
      for (var key in locationData) {
        if (locationData.hasOwnProperty(key)) {
          locationData[key] = new NumericCondition(
            key !== 'visibility' && conditions[0][key]() === undefined ?
              getMeanVal(maxMin.wParams[key].min, maxMin.wParams[key].max, key, true) : conditions[0][key](),
            maxMin.wParams[key].min,
            maxMin.wParams[key].max
          );
        }
      }
      //As visibility often returns undefined
      //infer it from other values
      locationData.visibility.value = inferVisibility(conditions,
        locationData);
      //Error check here
      locationData = fixlwDataRanges(locationData);
      //Add the location name
      Object.defineProperty(locationData, 'name', {
        value: newLocation.name,
        writable: true,
        configurable: true,
        enumerable: true
      });
      //Add string or time values
      Object.defineProperty(locationData, 'precipType', {
        writable: true,
        enumerable: true,
        value: conditions[0].precipType() || ''
      });
      //Add summary
      Object.defineProperty(locationData, 'summary', {
        writable: false,
        enumerable: true,
        value: conditions[0].summary() || 'no summary'
      });
      //Keep last state for next time
      //in case user should be offline
      var locationDataString = JSON.stringify(locationData);
      localStorage.setItem('locationData', locationDataString);
      //console.log('local storage set', locationDataString);
      // Post the data to rest of app
      channel.publish('userUpdate', locationData);
      //updateStatus('playing', locationData.name);
      if (conditions.length > 1) {
        console.log('There seems to be more than one location: ',
          conditions.length);
      }
      enableControls();
    });
  }

  function handleNoGeoData(statusString, data) {
    if (statusString) {
      updateStatus(statusString, data.name);
    } else {
      console.error('Unhandled error, status: ', statusString);
    }
  }

  function useStaticData(statusString) {
    var fetchStaticData = makeRequest('GET', 'data/static-data.json');
    fetchStaticData.then(function success(staticData) {
        //error check
        //TODO should probably stop
        //the program if this errors
        var staticDataJSON = JSON.parse(staticData);
        if(checkLocationDataKeys(staticDataJSON)) {
          var _fixedStaticData = fixlwDataRanges(staticDataJSON);
          handleNoGeoData(statusString, _fixedStaticData);
          enableControls();
          console.log('using static data');
          channel.publish('userUpdate', _fixedStaticData);
        } else {
          console.log('incorrect static data');
        }
      },
      function failure() {
        updateStatus('errorData');
        enableControls();
        console.error('failed to load static data');
      });
  }

  //Use previous state to run app
  function useLocalStorageData(statusString) {
    // Set var for use with isPlaying subscriber
    usingStaticData = true;
    if (Object.keys(window.localStorage).length > 0) {
      var restoredData = localStorage.getItem('locationData');
      var restoredDataJSON = JSON.parse(restoredData);
      handleNoGeoData(statusString + lastKnownSuffix, restoredDataJSON);
      channel.publish('userUpdate', restoredDataJSON);
      enableControls();
    }
    //Else use static location data
    else {
      console.log('no data in localStorage');
      useStaticData(statusString + staticSuffix);
    }
  }

  /**
   * Converts string from form input to lat long and runs app
   * @param  {String} placeString A custom user location
   * @return {Boolean}
   */
  function getLatLong(placeString) {
    var gpKey = makeRequest('GET', '/gm-key.php');
    gpKey.then(function success(key) {
      GoogleMapsLoader.KEY = key;
      GoogleMapsLoader.load(function(google) {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({
          'address': placeString
        }, function(results, status) {
          var statusString;
          if (status === google.maps.GeocoderStatus.OK) {
            var lat = results[0].geometry.location.lat();
            var long = results[0].geometry.location.lng();
            var address = results[0].formatted_address;
            updateApp(lat, long, address);
          } else {
            statusString = 'badPlaceName';
            updateStatus(statusString);
            console.log('Geocode failed due to: ' + status);
            useLocalStorageData(statusString);
          }
        });
      });
    }, function failure(rejectObj) {
        console.log(rejectObj.status);
        console.log(rejectObj.statusText);
        var statusString = 'badGMapsConnection';
        updateStatus('error');
        useLocalStorageData(statusString);
    });
  }

  /**
   * Takes lat long vals from geolocation and runs app
   * @param  {Number} lat  Lattitude
   * @param  {Number} long Longitude
   * @return {Boolean}
   */
  function getPlaces(lat, long) {
    var gpKey = makeRequest('GET', '/gm-key.php');
    gpKey.then(function success(key) {
      GoogleMapsLoader.KEY = key;
      GoogleMapsLoader.load(function(google) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, long);

        geocoder.geocode({
            'latLng': latlng
          },
          function(results, status) {
            var locName = 'Your location';
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                //See if there's a city & country
                if (results[1]) {
                  var cityCountry = results[1].formatted_address;
                  locName = cityCountry;
                  //else use the city & postcode
                } else {
                  var address = results[0].formatted_address;
                  var value = address.split(',');
                  var count = value.length;
                  if (count === 1) {
                    locName = address;
                  } else {
                    var cityPc = value[count - 2];
                    var cityArr = cityPc.split(',');
                    var city = cityArr[0];
                    locName = city;
                  }
                }
              } else {
                updateStatus('address');
              }
            } else {
              console.log('Reverse Geocoder failed due to: ' +
                status);
              locName = 'somewhere in the ocean?';
              updateStatus('noAddress');
            }
            updateStatus('location');
            updateApp(lat, long, locName);
          }
        );
      });
    }, function failure(rejectObj) {
      console.log(rejectObj.status);
      console.log(rejectObj.statusText);
      updateStatus('error');
      updateApp(lat, long, 'unknown');
    });
  }

  function showForm() {
    classListChain(coordsFormEl).remove('inactive').add('active');
    coordsFormInputEl.focus();
    coordsFormEl.tabIndex = 0;
    coordsFormInputEl.tabIndex = 0;
    coordsFormCloseBtnEl.tabIndex = 0;
    coordsFormSubmitBtnEl.tabIndex = 0;
  }

  function hideForm() {
    classListChain(coordsFormEl).remove('active').add('inactive');
    coordsFormEl.tabIndex = -1;
    coordsFormInputEl.tabIndex = -1;
    coordsFormCloseBtnEl.tabIndex = -1;
    coordsFormSubmitBtnEl.tabIndex = -1;
  }

  function containsWord(string, word) {
    return new RegExp('(?:[^.\w]|^|^\\W+)' + word +
      '(?:[^.\w]|\\W(?=\\W+|$)|$)').test(string);
  }

  function getGeo() {
    updateStatus('location');

    if (!navigator.geolocation) {
      updateStatus('noGeo');
      showForm();
      return;
    }

    function success(position) {
      updateStatus('obtainedLocation');
      getPlaces(position.coords.latitude, position.coords.longitude);
    }

    function failure(failure) {
      // User/browser permission issue
      var statusString;
      if (containsWord(failure.message, 'permission')) {
        statusString = 'noGeoAccess';
      }
      // Server/https issue
      else if (containsWord(failure.message, 'secure')) {
        statusString = 'noGeoAccess';
      }
      // Possible internet connection issue
      else {
        statusString = 'badConnection';
      }
      updateStatus(statusString);
      useLocalStorageData(statusString);
      console.error('failure.code', failure.code);
      console.error('failure.message', failure.message);
    }

    navigator.geolocation.getCurrentPosition(success, failure);
  }

  function startApp(inputType, placeInput) {
    // Temporarily disable buttons
    disableControls();
    // assess user action
    if (inputType === 'userLocation') {
      getGeo();
    } else if (inputType === 'customLocation') {
      getLatLong(placeInput);
    } else {
      console.error('inputType error ', inputType);
    }
  }

  function useCustomLocation() {
    var placeInput = document.getElementById('place').value;
    if (typeof placeInput !== 'string') {
      updateStatus('stringError');
    } else {
      startApp('customLocation', placeInput);
    }
  }

  function setStartState(autoStart) {
    channel.publish('stop', autoStart);
  }

  function setStopState() {
    isPlaying = true;
    userLocBtnEl.innerHTML = 'Stop orchestra';
  }

  function customLocationSubmit(e) {
    e.preventDefault();
    if (isPlaying) {
      setStartState(true);
    } else {
      useCustomLocation();
    }
  }

  function userLocationSubmit(e) {
    e.preventDefault();
    if (isPlaying) {
      setStartState();
    } else {
      startApp('userLocation', null);
    }
  }

  coordsFormCloseBtnEl.addEventListener('click', function(e) {
    e.preventDefault();
    hideForm();
  });

  linkLocationSelectEl.addEventListener('click', function(e) {
    e.preventDefault();
    //hideOptions();
    showForm();
  }, false);

  coordsFormSubmitBtnEl.addEventListener('click', customLocationSubmit, false);

  userLocBtnEl.addEventListener('click', userLocationSubmit, false);

  channel.subscribe('playing', function(locName) {
    // Only show this message if using live data
    if (!usingStaticData) {
      updateStatus('playing', locName);
    }
    setStopState();
  });

  channel.subscribe('allStopped', function(autoStart) {
    resetModState();
    updateStatus('start');
    userLocBtnEl.innerHTML = 'Play my weather';
    coordsFormSubmitBtnEl.innerHTML = 'Play';
    if (autoStart) {
      useCustomLocation();
    }
  });

  //Init
  updateStatus('start');
  hideForm();
  enableControls();
  resetModState();
  localStorage.clear();
};
