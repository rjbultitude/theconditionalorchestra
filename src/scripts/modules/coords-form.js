'use strict';

var Forecastio = require('../libs/forecast.io');
var audioVisual = require('./audio-visual');
var PitchValues = require('./pitch-cnstrctr');
var CharacterValues = require('./character-cnstrctr');
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
				var cloudCover = conditions[0].getCloudCover() === undefined ? maxMinVals.getMean(maxMinVals.cloudCoverMax, maxMinVals.cloudCoverMin, 'cloudCover') : conditions[0].getCloudCover();
				var speed = conditions[0].getWindSpeed() === undefined ? maxMinVals.getMean(maxMinVals.windSpeedMax, maxMinVals.windSpeedMin, 'windSpeed') : conditions[0].getWindSpeed();
				var pressure = conditions[0].getPressure() === undefined ? maxMinVals.getMean(maxMinVals.pressureMax, maxMinVals.pressureMin, 'pressure') : conditions[0].getPressure();
				var visibility = conditions[0].getVisibility() === undefined ? maxMinVals.getMean(maxMinVals.visibilityMax, maxMinVals.visibilityMin, 'visibility') : conditions[0].getVisibility();
				var bearing = conditions[0].getWindBearing() === undefined ? maxMinVals.getMean(maxMinVals.windBearingMax, maxMinVals.windBearingMin, 'windBearing') : conditions[0].getWindBearing();
				var ozone = conditions[0].getOzone() === undefined ? maxMinVals.getMean(maxMinVals.ozoneMax, maxMinVals.ozoneMin, 'ozone') : conditions[0].getOzone();
				var humidity = conditions[0].getHumidity() === undefined ? maxMinVals.getMean(maxMinVals.humidityMax, maxMinVals.humidityMin, 'humidity') : conditions[0].getHumidity();
				var dewPoint = conditions[0].getDewPoint() === undefined ? maxMinVals.getMean(maxMinVals.dewPointMax, maxMinVals.dewPointMin, 'dewPoint') : conditions[0].getDewPoint();
				var temperature = conditions[0].getTemperature() === undefined ? maxMinVals.getMean(maxMinVals.temperatureMax, maxMinVals.temperatureMin, 'temperature') : conditions[0].getTemperature();
				var apparentTemp = conditions[0].getApparentTemperature() === undefined ? maxMinVals.getMean(maxMinVals.apparentTempMax, maxMinVals.apparentTempMin, 'apparentTemp') : conditions[0].getApparentTemperature();
				var name = newLocation.name;
				//need to pass two objects
				//one for the notes
				//one for the controllers
				var characterValues = new CharacterValues(name, cloudCover, speed, pressure, visibility);
				var pitchValues = new PitchValues(bearing, ozone, humidity, dewPoint, temperature, apparentTemp);
				var userLocConditions = {characterValues: characterValues, pitchValues: pitchValues};
				// console.log('characterValues', characterValues);
				// console.log('pitchValues', pitchValues);
				// console.log('userLocConditions', userLocConditions);
				channel.publish('userUpdate', userLocConditions);
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
								console.log('address not found');
							}
						}
						else {
							console.log('Geocoder failed due to: ' + status);
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
			'Try again in a minute';
			useLocBtn.disabled = false;
			//console.log('failure.message', failure.message);
			if(failure.message.indexOf('Only secure origins are allowed') === 0) {
      	console.log('Only secure origins are allowed');
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

	useLocBtn.addEventListener('click', function(e) {
		e.preventDefault();
		messageBlock.innerHTML = 'Getting your location';
		//For testing:
		getPlaces(staticPlaces[2].lat, staticPlaces[2].long);
		console.log('Using static data');
		//For live:
		//getGeo();
		useLocBtn.disabled = true;
	});
};
