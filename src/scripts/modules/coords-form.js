

var Darksky = require('darkskyjs-lite');
var GoogleMapsLoader = require('google-maps');
var postal = require('postal');
var channel = postal.channel();
// var Darksky = require('./darksky');
var Nll = require('./nll-cnstrctr');
var staticData = require('./static-data');
var maxMin = require('../settings/max-min-values');
var updateStatus = require('./update-status');
var microU = require('../utilities/micro-utilities');
var makeRequest = require('../utilities/make-request');
var classListChain = require('../utilities/class-list-chain');
var getMeanVal = require('../utilities/get-mean-val');
var storageShim = require('../utilities/storage-shim');
var summaryIcon = require('./summary-icon');

module.exports = function(query) {
  //Vars
  var userLocBtnEl = document.getElementById('use-location-btn');
  var linkLocationSelectEl = document.getElementById('link-location-select');
  var coordsFormEl = document.querySelector('[data-ref="form-coords"]');
  var coordsFormInputEl = coordsFormEl.querySelector('[data-ref="place-field"]');
  var customLocSubmitBtnEl = coordsFormEl.querySelector('[data-ref="submit"]');
  var coordsFormCloseBtnEl = coordsFormEl.querySelector('[data-ref="close"]');
  var mapEl = document.getElementById('map');
  var lastKnownSuffix = 'LastKnown';
  var staticSuffix = 'Static';
  // module state vars
  var isPlaying = false;
  var usingStaticData = false;
  // Gmaps
  var gmapVersion = 'weekly';

  function formatQueryString(queryString) {
    var queryNoSpaces = microU.removeSpacesFromString(queryString);
    // replace commas with hyphens
    return microU.replaceCommasForHyphens(queryNoSpaces);
  }

  function updateURL(queryString) {
    var validQuery = '/?' + formatQueryString(queryString);
    console.log('validQuery', validQuery);
    if (history.pushState) {
      var newurl = window.location.protocol + '//' + window.location.host + validQuery;
      window.history.pushState({path:newurl},'',newurl);
    }
  }

  function clearURLQuery() {
    if (history.pushState) {
      var newurl = window.location.protocol + '//' + window.location.host;
      window.history.pushState({},'',newurl);
    }
  }

  function resetModState() {
    isPlaying = false;
    usingStaticData = false;
  }

  function enableControls() {
    userLocBtnEl.disabled = false;
    customLocSubmitBtnEl.disabled = false;
  }

  function disableControls() {
    userLocBtnEl.disabled = true;
    customLocSubmitBtnEl.disabled = true;
  }

  function resetAppState() {
    resetModState();
    updateStatus('start');
    userLocBtnEl.innerHTML = 'Play my weather';
    customLocSubmitBtnEl.innerHTML = 'Play';
    mapEl.classList.remove('active');
    summaryIcon.hideSummary();
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
    this.uvIndex = null;
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
      console.log('invalid visibility data');
      return 10 - (microU.addArrayItems(_altVisVals) / _altVisVals.length) * 10;
    }
  }

  function loadSatelliteMap(google, zoomLevel, latLongLiteral) {
    mapEl.classList.add('active');
    var map = new google.maps.Map(mapEl, {
      center: latLongLiteral,
      // Set mapTypeId to SATELLITE in order
      // to activate satellite imagery.
      mapTypeId: 'satellite',
      scrollwheel: false,
      zoom: zoomLevel,
      disableDefaultUI: true,
      draggable: false
    });
    map.setTilt(45);
  }

  function getStaticMap(lat, long) {
    var gpKey = makeRequest('GET', '/gm-key.php');
    var latLongLiteral = {lat: lat, lng: long};
    gpKey.then(function success(key) {
      GoogleMapsLoader.KEY = key;
      GoogleMapsLoader.VERSION = gmapVersion;
      GoogleMapsLoader.load(function(google) {
        console.log('google.maps.version', google.maps.version);
        // Get max zoom level
        var maxZoomObj = new google.maps.MaxZoomService();
        maxZoomObj.getMaxZoomAtLatLng(latLongLiteral, function(MaxZoomResult) {
          var _zoomLevel;
          if (MaxZoomResult.status === 'OK') {
            if (MaxZoomResult.zoom > 10) {
              _zoomLevel = 10;
            } else {
              _zoomLevel = MaxZoomResult.zoom;
            }
            loadSatelliteMap(google, _zoomLevel, latLongLiteral);
          } else {
            console.warn('Error retrieving satellite image');
          }
        });
      });
    },
    function failure(rejectObj) {
      console.log(rejectObj.status);
      console.log(rejectObj.statusText);
    });
  }

  function inferMissingNumValue(conditions, key) {
    if (key !== 'visibility' && conditions[0][key]() === undefined) {
      return getMeanVal(maxMin.wParams[key].min, maxMin.wParams[key].max, key, true);
    } else {
      return conditions[0][key]();
    }
  }

  function updateUISuccess(lwData) {
    channel.publish('userUpdate', lwData);
    enableControls();
    summaryIcon.outputSummary(lwData);
  }

  function configureAndUpdate(conditions, newLocation) {
    console.log('conditions', conditions);
    // Must make new object at this point
    var locationData = new LocationData();
    // Set numerical integer and floating point values
    for (var key in locationData) {
      if (locationData.hasOwnProperty(key)) {
        locationData[key] = new NumericCondition(
          inferMissingNumValue(conditions, key),
          maxMin.wParams[key].min,
          maxMin.wParams[key].max
        );
        console.log('locationData keys', locationData[key]);
      }
    }
    // As visibility often returns undefined
    // infer it from other values
    locationData.visibility.value = inferVisibility(conditions, locationData);
    // Error check here
    locationData = fixlwDataRanges(locationData);
    // Add the location name
    Object.defineProperty(locationData, 'name', {
      value: newLocation.name,
      writable: true,
      configurable: true,
      enumerable: true
    });
    // Add string or time values
    Object.defineProperty(locationData, 'precipType', {
      writable: true,
      enumerable: true,
      value: conditions[0].precipType() || ''
    });
    // Add summary
    Object.defineProperty(locationData, 'summary', {
      writable: false,
      enumerable: true,
      value: conditions[0].summary() || 'no summary'
    });
    // Add icon
    Object.defineProperty(locationData, 'icon', {
      writable: false,
      enumerable: true,
      value: conditions[0].icon() || 'no icon'
    });
    // Keep last state for next time
    // in case user should be offline
    var locationDataString = JSON.stringify(locationData);
    storageShim();
    localStorage.setItem('locationData', locationDataString);
    // update the url
    updateURL(locationData.name);
    // Post the data to rest of app
    if (conditions.length > 1) {
      console.log('There seems to be more than one location: ', conditions.length);
    }
    updateUISuccess(locationData);
  }

  function getAndLoadConditions(lat, long, name) {
    //Get API wrapper
    var forecast = new Darksky({
      PROXY_SCRIPT: '/proxy.php'
    });
    // Create object as DarkSky requires
    var newLocation = new Nll(lat, long, name);
    var newLocations = [];
    // Handle server error
    if (forecast.dataError) {
      console.log('There was a problem retrieving API key from server');
      configureAndUpdate(staticData, newLocation);
    }
    // Must use array for darksky wrapper
    newLocations.push(newLocation);
    forecast.getCurrentConditions(newLocations, function(conditions) {
      console.log('raw conditions', conditions);
      // If there's a problem with the darksky service
      // load the static weather
      if (conditions === false || conditions.length === 0) {
        console.log('There was a problem retrieving data from darksky');
        conditions = staticData;
      }
      configureAndUpdate(conditions, newLocation);
    });
  }

  function updateApp(lat, long, name) {
    //Notify UI
    updateStatus('weather');
    //create map
    getStaticMap(lat, long);
    // get conditions
    getAndLoadConditions(lat, long, name);
  }

  function handleNoGeoData(statusString, data) {
    if (statusString) {
      updateStatus(statusString, data.name);
    } else {
      console.error('Unhandled error, status: ', statusString);
    }
  }

  function useStaticData(statusString) {
    if(checkLocationDataKeys(staticData)) {
      var _fixedStaticData = fixlwDataRanges(staticData);
      handleNoGeoData(statusString, _fixedStaticData);
      console.log('using static data');
      updateUISuccess(_fixedStaticData);
    } else {
      updateStatus('error');
      console.log('incorrect static data');
    }
  }

  // Use previous state to run app
  function useLocalStorageData(statusString) {
    // error check
    var _statusString;
    if (statusString) {
      _statusString = statusString;
    } else {
      _statusString = '';
    }
    // Set var for use with isPlaying subscriber
    usingStaticData = true;
    var restoredData = localStorage.getItem('locationData');
    if (restoredData !== null) {
      var restoredDataJSON = JSON.parse(restoredData);
      handleNoGeoData(_statusString + lastKnownSuffix, restoredDataJSON);
      updateUISuccess(restoredDataJSON);
    }
    // Else use static location data
    else {
      console.log('no data in localStorage');
      useStaticData(_statusString + staticSuffix);
    }
  }

  /**
   * Converts string from form input to lat long and runs app
   * @param  {String} placeString A custom user location
   * @return {Boolean}
   */
  function getLatLong(placeString, urlSearch) {
    if (!navigator.onLine && urlSearch) {
      updateStatus('badConnectionLastKnown');
      useLocalStorageData('badConnection');
      return;
    } else if (!navigator.onLine) {
      console.log('offline');
      updateStatus('errorNoConnLocSearch');
      enableControls();
      return;
    }
    var gpKey = makeRequest('GET', '/gm-key.php');
    gpKey.then(function success(key) {
      GoogleMapsLoader.KEY = key;
      GoogleMapsLoader.VERSION = gmapVersion;
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
    },
    function failure(rejectObj) {
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
    function handleError() {
      updateStatus('error');
      updateApp(lat, long, 'unknown');
    }
    gpKey.then(function success(key) {
      if (key.indexOf('<') >= 0) {
        throw new Error;
      }
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
      handleError();
    }).catch(function(e) {
      console.warn(e, 'error retreiving key');
      handleError();
    });
  }

  function showForm() {
    classListChain(coordsFormEl).remove('inactive').add('active');
    coordsFormInputEl.focus();
    coordsFormEl.tabIndex = 0;
    coordsFormInputEl.tabIndex = 0;
    coordsFormCloseBtnEl.tabIndex = 0;
    customLocSubmitBtnEl.tabIndex = 0;
  }

  function hideForm() {
    classListChain(coordsFormEl).remove('active').add('inactive');
    coordsFormEl.tabIndex = -1;
    coordsFormInputEl.tabIndex = -1;
    coordsFormCloseBtnEl.tabIndex = -1;
    customLocSubmitBtnEl.tabIndex = -1;
  }

  function getGeo() {
    var options = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 0
    };
    var oldCoords = localStorage.getItem('geoCoords');

    function success(position) {
      if (!navigator.onLine) {
        failure({message: null});
        return;
      }
      updateStatus('obtainedLocation');
      getPlaces(position.coords.latitude, position.coords.longitude);
    }

    function failure(failure) {
      // User/browser permission issue
      var statusString;
      if (microU.containsWord(failure.message, 'permission')) {
        statusString = 'noGeoAccess';
      }
      // Server/https issue
      else if (microU.containsWord(failure.message, 'secure')) {
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

    if (oldCoords) {
      success(JSON.parse(oldCoords));
    }

    updateStatus('location');

    // Geolocation not supported
    if (!navigator.geolocation) {
      updateStatus('noGeo');
      showForm();
      return;
    }

    navigator.geolocation.getCurrentPosition(success, failure, options);
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
    var _placeInput = document.getElementById('place');
    var _placeInputVal = _placeInput.value;
    if (typeof _placeInputVal !== 'string') {
      updateStatus('stringError');
    } else if (_placeInputVal.length === 0) {
      updateStatus('stringLengthError');
    } else {
      var _isValid = _placeInput.checkValidity();
      console.log('_isValid', _isValid);
      if (_isValid) {
        startApp('customLocation', _placeInputVal);
      }
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
    // Stop if playing
    if (isPlaying) {
      setStartState(true);
    } else {
      useCustomLocation();
    }
  }

  function userLocationSubmit(e) {
    e.preventDefault();
    // Stop if playing
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
    showForm();
  }, false);

  customLocSubmitBtnEl.addEventListener('click', customLocationSubmit, false);

  userLocBtnEl.addEventListener('click', userLocationSubmit, false);

  channel.subscribe('playing', function(locName) {
    // Only show this message if using live data
    if (!usingStaticData) {
      updateStatus('playing', locName);
    }
    setStopState();
  });

  channel.subscribe('allStopped', function(autoStart) {
    resetAppState();
    clearURLQuery();
    if (autoStart) {
      useCustomLocation();
    }
  });

  function loadLocFromURL(queryString) {
    // run search if there's a query string
    if (typeof queryString === 'string' && queryString.length >= 1) {
      disableControls();
      updateStatus('location');
      getLatLong(queryString, true);
    }
  }

  // Init
  updateStatus('start');
  hideForm();
  enableControls();
  resetModState();
  localStorage.clear();
  loadLocFromURL(query);
};
