'use strict';

var Forecastio = require('../libs/forecast.io');
var GoogleMapsLoader = require('google-maps');
var postal = require('postal');
var channel = postal.channel();
var Nll = require('./nll-cnstrctr');
var maxMinVals = require('../settings/max-min-values');
var updateStatus = require('./update-status');
var makeRequest = require('../utilities/make-request');
var classListChain = require('../utilities/class-list-chain');
var getMeanVal = require('../utilities/get-mean-val');

module.exports = function() {
	//Vars
	var userLocBtnEl = document.getElementById('use-location-btn');
	var linkLocationSelectEl = document.getElementById('link-location-select');
  var coordsFormEl = document.querySelector('[data-ref="form-coords"]');
  var coordsFormInputEl = coordsFormEl.querySelector('[data-ref="place-field"]');
  var coordsFormSubmitBtnEl = coordsFormEl.querySelector('[data-ref="submit"]');
  var coordsFormCloseBtnEl = coordsFormEl.querySelector('[data-ref="close"]');
	var visualLaunchEl = document.querySelector('[data-ref="visuals-launcher"]');
  var isPlaying = false;

  function enableControls() {
    userLocBtnEl.disabled = false;
    coordsFormSubmitBtnEl.disabled = false;
  }

  function disableControls() {
    userLocBtnEl.disabled = true;
    coordsFormSubmitBtnEl.disabled = true;
  }

  function updateApp(lat, long, name) {
		var newLocation = new Nll(lat, long, name);
		updateStatus('weather');
		var forecast = new Forecastio({
			PROXY_SCRIPT: '/proxy.php'
		});

    //TODO
    // Break this function up
  	forecast.getCurrentConditions(newLocation, function(conditions) {
  		if (conditions.length === 1) {
        // Set numerical integer and floating point values
        // Order is important for use in mapPitchValues
  			var locationData = {
          dewPoint: {value: conditions[0].getDewPoint() === undefined ? getMeanVal(maxMinVals.forecastParams.dewPoint.max, maxMinVals.forecastParams.dewPoint.min, 'dewPoint', true) : conditions[0].getDewPoint() },
          humidity: {value: conditions[0].getHumidity() === undefined ? getMeanVal(maxMinVals.forecastParams.humidity.max, maxMinVals.forecastParams.humidity.min, 'humidity', true) : conditions[0].getHumidity() },
          ozone: {value: conditions[0].getOzone() === undefined ? getMeanVal(maxMinVals.forecastParams.ozone.max, maxMinVals.forecastParams.ozone.min, 'ozone', true) : conditions[0].getOzone() },
          bearing: {value: conditions[0].getWindBearing() === undefined ? getMeanVal(maxMinVals.forecastParams.windBearing.max, maxMinVals.forecastParams.windBearing.min, 'windBearing', true) : conditions[0].getWindBearing() },
          temperature: {value: conditions[0].getTemperature() === undefined ? getMeanVal(maxMinVals.forecastParams.temperature.max, maxMinVals.forecastParams.temperature.min, 'temperature', true) : conditions[0].getTemperature() },
          apparentTemp: {value: conditions[0].getApparentTemperature() === undefined ? getMeanVal(maxMinVals.forecastParams.apparentTemp.max, maxMinVals.forecastParams.apparentTemp.min, 'apparentTemp', true) : conditions[0].getApparentTemperature() },
          cloudCover: {value: conditions[0].getCloudCover() === undefined ? getMeanVal(maxMinVals.forecastParams.cloudCover.max, maxMinVals.forecastParams.cloudCover.min, 'cloudCover', true) : conditions[0].getCloudCover() },
          windSpeed: {value: conditions[0].getWindSpeed() === undefined ? getMeanVal(maxMinVals.forecastParams.windSpeed.max, maxMinVals.forecastParams.windSpeed.min, 'windSpeed', true) : conditions[0].getWindSpeed() },
  				visibility: {value: conditions[0].getVisibility() === undefined ? getMeanVal(maxMinVals.forecastParams.visibility.max, maxMinVals.forecastParams.visibility.min, 'visibility', true) : conditions[0].getVisibility() },
          pressure: {value: conditions[0].getPressure() === undefined ? getMeanVal(maxMinVals.forecastParams.pressure.max, maxMinVals.forecastParams.pressure.min, 'pressure', true) : conditions[0].getPressure() },
  				precipIntensity: {value: conditions[0].getPrecipIntensity() }
  			};
			  //Add the max & min condition vals
  			addMinMaxLoop:
  			for (var key in locationData) {
  				if (locationData.hasOwnProperty(key)) {
  					Object.defineProperty(locationData[key], 'min', {writable: true, enumerable: true, value: maxMinVals.forecastParams[key].min});
  					Object.defineProperty(locationData[key], 'max', {writable: true, enumerable: true, value: maxMinVals.forecastParams[key].max});
  				}
  			}
        //Add the location name
			  Object.defineProperty(locationData, 'name', {value: newLocation.name, writable: true, configurable: true, enumerable: true});
        //Add string or time values
        Object.defineProperty(locationData, 'precipType', {writable: true, enumerable: true, value: conditions[0].getPrecipitationType() });
        //Add max & min sound values
        Object.defineProperty(locationData, 'soundParams', {writable: false, enumerable: true, value: maxMinVals.soundParams});
  			//Keep last state for next time
  			//in case user should be offline
  			var locationDataString = JSON.stringify(locationData);
  			localStorage.setItem('locationData', locationDataString);
        //console.log('local storage set', locationDataString);
  			// Post the data to rest of app
  			channel.publish('userUpdate', locationData);
        updateStatus('playing', locationData.name);
  			visualLaunchEl.style.display = 'block';
  		}
      else {
  			console.log('There seems to be more than one location: ', conditions.length);
  		}
      enableControls();
		});
	}

  function handleNoGeoData(statusString, data, localStorageExists) {
    if (statusString === 'badPlaceName' && localStorageExists === true) {
      updateStatus('badPlaceNameLastKnown', data.name);
    } else if (statusString === 'badPlaceName' && localStorageExists === false) {
      updateStatus('badPlaceNameStatic', data.name);
    } else if (statusString === 'noGeoAccess' && localStorageExists === true) {
      updateStatus('noGeoAcessLastKnown', data.name);
    } else if (statusString === 'noGeoAccess' && localStorageExists === false) {
      updateStatus('noGeoAcessStatic', data.name);
    } else if (statusString === 'badConnection' && localStorageExists === true) {
      updateStatus('badConnectionLastKnown', data.name);
    } else if (statusString === 'badConnection' && localStorageExists === false) {
      updateStatus('badConnectionStatic', data.name);
    } else {
      console.error('Unhandled error, status: ', statusString);
    }
  }

  function useStaticData(statusString) {
    var fetchStaticData = makeRequest('GET', 'data/static-data.json');
    fetchStaticData.then(function success(staticData) {
      var staticDataJSON = JSON.parse(staticData);
      handleNoGeoData(statusString, staticDataJSON, false);
      enableControls();
      channel.publish('userUpdate', staticDataJSON);
    },
    function failure() {
      updateStatus('errorData');
      enableControls();
      console.error('failed to load static data');
    });
  }

  //Use previous state to run app
  function useLocalStorageData(statusString) {
    if(Object.keys(window.localStorage).length > 0) {
      var restoredData = localStorage.getItem('locationData');
      var restoredDataJSON = JSON.parse(restoredData);
      handleNoGeoData(statusString, restoredDataJSON, true);
      channel.publish('userUpdate', restoredDataJSON);
      enableControls();
    }
    //Else use static location data
    else {
      console.log('no data in localStorage');
      useStaticData(statusString);
    }
  }

  /**
   * Converts string from form input to lat long and runs app
   * @param  {String} placeString A custom user location
   * @return {Boolean}
   */
  function getLatLong(placeString) {
		var gpKey = makeRequest('GET', '/gm-key.php');
		gpKey.then(function(key) {
			GoogleMapsLoader.KEY = key;
			GoogleMapsLoader.load(function(google) {
				var geocoder = new google.maps.Geocoder();

				geocoder.geocode( { 'address' : placeString }, function(results, status) {
          var statusString;
	        if( status === google.maps.GeocoderStatus.OK ) {
	            var lat = results[0].geometry.location.lat();
	            var long = results[0].geometry.location.lng();
							var address = results[0].formatted_address;
							updateApp(lat, long, address);
	        } else {
              statusString = 'badPlaceName';
              updateStatus(statusString);
	            console.log('Geocode failed due to: ' + status );
              useLocalStorageData(statusString);
	        }
		    });
			});
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
						}
						else {
							console.log('Reverse Geocoder failed due to: ' + status);
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
    return new RegExp('(?:[^.\w]|^|^\\W+)' + word + '(?:[^.\w]|\\W(?=\\W+|$)|$)').test(string);
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

  function getTestLocation(index) {
		var fetchStaticPlaces = makeRequest('GET', 'data/static-places.json');
		fetchStaticPlaces.then(function (staticPlaces) {
			var staticPlacesJSON = JSON.parse(staticPlaces);
			getPlaces(staticPlacesJSON[index].lat, staticPlacesJSON[index].long);
			console.log('Using static data');
		}, function (status) {
			console.log(status.statusText);
		});
  }

  function startApp(inputType, placeInput) {
    // Temporarily disable buttons
    disableControls();

    if (inputType === 'userLocation') {
      getTestLocation(0); //Test
      //getGeo(); //Live
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
    }
    else {
      startApp('customLocation', placeInput);
    }
  }

  function setStartState() {
    channel.publish('stop');
  }

  function setStopState() {
    isPlaying = true;
    userLocBtnEl.innerHTML = 'Stop orchestra';
    coordsFormSubmitBtnEl.innerHTML = 'Stop';
  }

  function customLocationSubmit(e) {
    e.preventDefault();
    if (isPlaying) {
      setStartState();
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

  function userLocationSubmitTest(e) {
    e.preventDefault();
    if (isPlaying) {
        setStartState();
    } else {
      var staticWeatherData = makeRequest('GET', 'data/static-weather.json');
      staticWeatherData.then(function(weatherData) {
        var locationData = JSON.parse(weatherData);
        channel.publish('userUpdate', locationData);
        updateStatus('playing', locationData.name);
        visualLaunchEl.style.display = 'block';
      });
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

  channel.subscribe('playing', function(audioSupported){
    if (audioSupported === false) {
      updateStatus('error', null, true);
    }
    setStopState();
  });

  channel.subscribe('allStopped', function() {
    isPlaying = false;
    updateStatus('start');
    userLocBtnEl.innerHTML = 'Play my weather';
    coordsFormSubmitBtnEl.innerHTML = 'Play';
    visualLaunchEl.style.display = 'none';
  });

  //Init
  updateStatus('start');
  hideForm();
  enableControls();
	localStorage.clear();
};
