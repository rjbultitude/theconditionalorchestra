'use strict';

var Forecastio = require('../libs/forecast.io');
var Nll = require('./nll-cnstrctr');
var GoogleMapsLoader = require('google-maps');
var makeRequest = require('./make-request');
var maxMinVals = require('./max-min-values');
var postal = require('postal');
var channel = postal.channel();
var updateStatus = require('./update-status');
var classListChain = require('./class-list-chain');

module.exports = function() {
	//Debug
	localStorage.clear();
	//Vars
	var userLocBtnEl = document.getElementById('use-location-btn');
	var linkLocationSelectEl = document.getElementById('link-location-select');
  var coordsFormEl = document.querySelector('[data-ref="form-coords"]');
  var coordsFormInputEl = coordsFormEl.querySelector('[data-ref="place-field"]');
  var coordsFormSubmitBtnEl = coordsFormEl.querySelector('[data-ref="submit"]');
  var coordsFormCloseBtnEl = coordsFormEl.querySelector('[data-ref="close"]');
	var controlsEl = document.querySelector('[data-ref="controls"]');
  var isPlaying = false;

  function updateApp(lat, long, name) {
		var newLocation = new Nll(lat, long, name);
		updateStatus('weather');
		var forecast = new Forecastio({
			PROXY_SCRIPT: '/proxy.php'
		});

  	forecast.getCurrentConditions(newLocation, function(conditions) {
  		if (conditions.length === 1) {
  			var locationData = {
  				cloudCover: {value: conditions[0].getCloudCover() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.cloudCover.max, maxMinVals.forecastParams.cloudCover.min, 'cloudCover') : conditions[0].getCloudCover() },
  				speed: {value: conditions[0].getWindSpeed() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.windSpeed.max, maxMinVals.forecastParams.windSpeed.min, 'windSpeed') : conditions[0].getWindSpeed() },
  				pressure: {value: conditions[0].getPressure() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.pressure.max, maxMinVals.forecastParams.pressure.min, 'pressure') : conditions[0].getPressure() },
  				visibility: {value: conditions[0].getVisibility() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.visibility.max, maxMinVals.forecastParams.visibility.min, 'visibility') : conditions[0].getVisibility() },
  				bearing: {value: conditions[0].getWindBearing() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.windBearing.max, maxMinVals.forecastParams.windBearing.min, 'windBearing') : conditions[0].getWindBearing() },
  				ozone: {value: conditions[0].getOzone() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.ozone.max, maxMinVals.forecastParams.ozone.min, 'ozone') : conditions[0].getOzone() },
  				humidity: {value: conditions[0].getHumidity() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.humidity.max, maxMinVals.forecastParams.humidity.min, 'humidity') : conditions[0].getHumidity() },
  				dewPoint: {value: conditions[0].getDewPoint() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.dewPoint.max, maxMinVals.forecastParams.dewPoint.min, 'dewPoint') : conditions[0].getDewPoint() },
  				temperature: {value: conditions[0].getTemperature() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.temperature.max, maxMinVals.forecastParams.temperature.min, 'temperature') : conditions[0].getTemperature() },
  				apparentTemp: {value: conditions[0].getApparentTemperature() === undefined ? maxMinVals.getMean(maxMinVals.forecastParams.apparentTemp.max, maxMinVals.forecastParams.apparentTemp.min, 'apparentTemp') : conditions[0].getApparentTemperature() }
  				//name: newLocation.name
  			};
			  //Add the location name
			  //Ensure it's not enumerable
			  Object.defineProperty( locationData, 'name', {value: newLocation.name, writable: true, configurable: true, enumerable: false});
			  //Add the max & min condition vals
  			addMinMaxLoop:
  			for (var key in locationData) {
  				if (locationData.hasOwnProperty(key)) {
  					Object.defineProperty(locationData[key], 'min', {writable: true, enumerable: true, value: maxMinVals.forecastParams[key].min});
  					Object.defineProperty(locationData[key], 'max', {writable: true, enumerable: true, value: maxMinVals.forecastParams[key].max});
  				}
  			}
        //Add max & min sound values
        Object.defineProperty(locationData, 'soundParams', {writable: false, enumerable: true, value: maxMinVals.soundParams});
  			//Keep last state for next time
  			//in case user should be offline
  			var locationDataString = JSON.stringify(locationData);
  			localStorage.setItem('locationData', locationDataString);
        console.log('local storage set');
  			//Post the data to rest of app
  			channel.publish('userUpdate', locationData);
  			controlsEl.style.display = 'block';
  		}
      else {
  			console.log('There seems to be more than one location: ', conditions.length);
  		}
      userLocBtnEl.disabled = false;
		});
	}

  function useStaticData() {
    var fetchStaticData = makeRequest('GET', 'data/static-data.json');
    fetchStaticData.then(function success(staticData) {
      staticData = JSON.parse(staticData);
      updateStatus('defaultData', staticData.name);
      channel.publish('userUpdate', staticData);
      userLocBtnEl.disabled = false;
    },
    function failure() {
      updateStatus('errorData');
      console.log('failed to load static data');
    });
  }

  //Use previous state to run app
  function useLocalStorageData() {
    if(Object.keys(window.localStorage).length > 0) {
      var restoredData = localStorage.getItem('locationData');
      updateStatus('lastKnown', restoredData.name);
      channel.publish('userUpdate', JSON.parse(restoredData));
      userLocBtnEl.disabled = false;
    }
    //Else use static location data
    else {
      console.log('no data in localStorage');
      useStaticData();
    }
  }


  function getLatLong(placeString) {
		var gpKey = makeRequest('GET', '/gm-key.php');
		gpKey.then(function(key) {
			GoogleMapsLoader.KEY = key;
			GoogleMapsLoader.load(function(google) {
				var geocoder = new google.maps.Geocoder();

				geocoder.geocode( { 'address' : placeString }, function(results, status) {
	        if( status === google.maps.GeocoderStatus.OK ) {
	            var lat = results[0].geometry.location.lat();
	            var long = results[0].geometry.location.lng();
							var address = results[0].formatted_address;
							updateApp(lat, long, address);
	        } else {
              updateStatus('badPlaceName');
	            console.log('Geocode failed due to: ' + status );
              useStaticData();
	        }
		    });
			});
		});
	}


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
	}

	function hideForm() {
		classListChain(coordsFormEl).remove('active').add('inactive');
    coordsFormEl.tabIndex = -1;
    coordsFormInputEl.tabIndex = -1;
	}

	function getGeo() {
    updateStatus('location');

		if (!navigator.geolocation) {
			updateStatus('noGeo');
			showForm();
			return;
		}

		function success(position) {
			updateStatus('success');
			getPlaces(position.coords.latitude, position.coords.longitude);
		}

		function failure(failure) {
			updateStatus('badConnection');
			//Ensure we're on https or localhost
			if(failure.message.indexOf('Only secure origins are allowed') === 0) {
      	console.log('Only secure origins are allowed');
    	}
			useLocalStorageData();
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
    if (inputType === 'userLocation') {
      userLocBtnEl.disabled = true;
      //Test
      //getTestLocation(0);

      //Live
      getGeo();
    } else if (inputType === 'customLocation') {
      userLocBtnEl.disabled = true;
      getLatLong(placeInput);
    } else {
      console.log('inputType error ', inputType);
    }
  }

  function useCustomLocation() {
    var placeInput = document.getElementById('place').value;
    if (typeof placeInput !== 'string') {
      updateStatus('string');
    }
    else {
      startApp('customLocation', placeInput);
    }
  }

  function setStartState() {
    channel.publish('stop');
    isPlaying = false;
    updateStatus('start');
    userLocBtnEl.innerHTML = 'Play my weather';
    controlsEl.style.display = 'none';
  }

  function setStopState() {
    isPlaying = true;
    userLocBtnEl.innerHTML = 'Stop orchestra';
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

	coordsFormSubmitBtnEl.addEventListener('click', function(e) {
    e.preventDefault();
    if (isPlaying) {
      setStartState();
    } else {
      useCustomLocation();
    }
  }, false);

	userLocBtnEl.addEventListener('click', function(e) {
    e.preventDefault();
    if (isPlaying) {
      setStartState();
    } else {
      startApp('userLocation', null);
    }
  }, false);

  channel.subscribe('play', function(){
    setStopState();
  });

  //Init
  updateStatus('start');
  hideForm();
};
