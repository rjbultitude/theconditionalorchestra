'use strict';

var Forecastio = require('../libs/forecast.io');
var audioVisual = require('./audio-visual');
var Nll = require('./nll-cnstrctr');
var GoogleMapsLoader = require('google-maps');
var makeRequest = require('./make-request');
var maxMinVals = require('./max-min-values');
var postal = require('postal');
var channel = postal.channel();

module.exports = function() {
	var coordsSubmitBtn = document.getElementById('form-coords-btn');
	var useLocBtn = document.getElementById('use-location-btn');
	var messageBlock = document.getElementById('message-block');
	var noAddressMsg = 'address not found';

	//start app
	audioVisual();

	function updateApp(lat, long, name) {
		var newLocation = new Nll(lat, long, name);
		messageBlock.innerHTML = 'Fetching weather data';
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
				//Post the data to rest of app
				channel.publish('userUpdate', locationData);
			} else {
				console.log('conditions.length is ', conditions.length);
			}
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
								locName = noAddressMsg;
							}
						}
						else {
							console.log('Geocoder failed due to: ' + status);
							locName = noAddressMsg;
						}
						messageBlock.innerHTML = locName;
						useLocBtn.disabled = false;
						updateApp(lat, long, locName);
					}
				);
			});
		}, function(rejectObj) {
			console.log(rejectObj.status);
			console.log(rejectObj.statusText);
			messageBlock.innerHTML = 'Error getting your location';
			updateApp(lat, long, 'unknown');
		});
	}

	function showForm() {
		messageBlock.innerHTML = 'Geolocation is not supported by your browser \n' +
			'Try searching';
		var formEl = document.getElementById('form-coords');
		formEl.style.display = 'block';
	}

	function getGeo() {
		if (!navigator.geolocation) {
			showForm();
			return;
		}

		function success(position) {
			messageBlock.innerHTML = 'Looking up name';
			getPlaces(position.coords.latitude, position.coords.longitude);
		}

		function failure(failure) {
			messageBlock.innerHTML = 'Unable to retrieve your location \n' +
			'perhaps you have no connection';
			useLocBtn.disabled = false;
			//Ensure we're on https or localhost
			if(failure.message.indexOf('Only secure origins are allowed') === 0) {
      	console.log('Only secure origins are allowed');
    	}
			//Use previous state to run app
			if(Object.keys(window.localStorage).length > 0) {
				var restoredData = localStorage.getItem('locationData');
				channel.publish('restoreUserData', JSON.parse(restoredData));
			} else {
				console.log('attempt to use localStorage', window.localStorage);
			}
		}

		navigator.geolocation.getCurrentPosition(success, failure);
	}

	coordsSubmitBtn.addEventListener('click', function (e) {
		e.preventDefault();
		var lat = parseInt(document.getElementById('lat').value, 10);
		var long = parseInt(document.getElementById('long').value, 10);
		if (typeof lat !== 'number' || typeof long !== 'number') {
			messageBlock.innerHTML = 'please enter a number';
		}
		else {
			getPlaces(lat, long);
		}
	});

	var staticPlaces = [
		{
			name: 'philedelphia', lat: 39.952584, long: -75.165222
		},
		{
			name: 'Ho Chi', lat: 10.754727, long: 106.550903
		},
		{
			name: 'Alberto de Agostini', lat: -54.646128, long: -70.029602
		},
		{
			name: 'Commonwealth Bay', lat: -67.006549, long: 142.657298
		}
	];

	//TODO use completely static data
	//for first time users with bad connection
	var staticLocationData = {};

	useLocBtn.addEventListener('click', function(e) {
		e.preventDefault();
		messageBlock.innerHTML = 'Getting your location';
		//For testing:
		// getPlaces(staticPlaces[2].lat, staticPlaces[2].long);
		// console.log('Using static data');
		//For live:
		getGeo();
		useLocBtn.disabled = true;
	});
};
