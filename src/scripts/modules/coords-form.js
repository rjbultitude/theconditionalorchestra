'use strict';

var Forecastio = require('../libs/forecast.io');
var audioVisual = require('./audio-visual');
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
	var coordsSubmitBtn = document.getElementById('form-coords-btn');
	var useLocBtn = document.getElementById('use-location-btn');
	var linkLocationSelect = document.getElementById('link-location-select');
  var formEl = document.querySelector('[data-ref="form-coords"]');
  var formButtonCloseEl = formEl.querySelector('.button-close');
	var controlsEl = document.querySelector('[data-ref="controls"]');

	//start app
	audioVisual();

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
			} else {
				console.log('There seems to be more than one location: ', conditions.length);
			}
		});
	}

	function getLatLong(placeString) {
		var gpKey = makeRequest('GET', '/gm-key.php');
		gpKey.then(function(key) {
			GoogleMapsLoader.KEY = key;
			GoogleMapsLoader.load(function(google) {
				var geocoder = new google.maps.Geocoder();

				geocoder.geocode( { 'address' : placeString }, function( results, status ) {
	        if( status === google.maps.GeocoderStatus.OK ) {
							console.log('results', results);
	            var lat = results[0].geometry.location.lat();
	            var long = results[0].geometry.location.lng();
							var address = results[0].formatted_address;
							updateApp(lat, long, address);
	        } else {
	            console.log('Geocode was not successful for the following reason: ' + status );
	        }
		    });
			});
		});
	}


	function getPlaces(lat, long) {
		var gpKey = makeRequest('GET', '/gm-key.php');
		gpKey.then(function(key) {
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
							console.log('Geocoder failed due to: ' + status);
							locName = 'somewhere in the ocean?';
							updateStatus('address');
						}
						updateStatus('location');
						useLocBtn.disabled = false;
						updateApp(lat, long, locName);
					}
				);
			});
		}, function(rejectObj) {
				console.log(rejectObj.status);
				console.log(rejectObj.statusText);
				updateStatus('error');
				updateApp(lat, long, 'unknown');
			});
	}

	function showForm() {
		classListChain(formEl).remove('inactive').add('active');
	}

	function hideForm() {
		classListChain(formEl).remove('active').add('inactive');
	}

	function getGeo() {
		if (!navigator.geolocation) {
			updateStatus('geo');
			showForm();
			return;
		}

		function success(position) {
			updateStatus('success');
			getPlaces(position.coords.latitude, position.coords.longitude);
		}

		function failure(failure) {
			updateStatus('connection');
			useLocBtn.disabled = false;
			//Ensure we're on https or localhost
			if(failure.message.indexOf('Only secure origins are allowed') === 0) {
      	console.log('Only secure origins are allowed');
    	}
			//Use previous state to run app
			if(Object.keys(window.localStorage).length > 0) {
				var restoredData = localStorage.getItem('locationData');
				updateStatus('lastKnown', restoredData.name);
				channel.publish('restoreUserData', JSON.parse(restoredData));
			}
			//Else use static location data
			else {
				console.log('no data in localStorage');
				var fetchStaticData = makeRequest('GET', 'data/static-data.json');
				fetchStaticData.then(function success(staticData) {
					staticData = JSON.parse(staticData);
					updateStatus('defaultData', staticData.name);
					channel.publish('staticData', staticData);
				},
				function failure() {
					console.log('failed to load static data');
				});
			}
		}

		navigator.geolocation.getCurrentPosition(success, failure);
	}

	formButtonCloseEl.addEventListener('click', function(e) {
		e.preventDefault();
		hideForm();
	});

	linkLocationSelect.addEventListener('click', function(e) {
		e.preventDefault();
		//hideOptions();
		showForm();
	}, false);

	coordsSubmitBtn.addEventListener('click', function (e) {
		e.preventDefault();
		var placeInput = document.getElementById('place').value;
		if (typeof placeInput !== 'string') {
			updateStatus('string');
		}
		else {
			getLatLong(placeInput);
		}
	});

	useLocBtn.addEventListener('click', function(e) {
		e.preventDefault();
		updateStatus('location');
		//For testing:
		// var fetchStaticPlaces = makeRequest('GET', 'data/static-places.json');
		// fetchStaticPlaces.then(function (staticPlaces) {
		// 	var staticPlacesJSON = JSON.parse(staticPlaces);
		// 	getPlaces(staticPlacesJSON[2].lat, staticPlacesJSON[2].long);
		// 	console.log('Using static data');
		// }, function (status) {
		// 	console.log(status.statusText);
		// });
		//For live:
		getGeo();
		useLocBtn.disabled = true;
	});
};
