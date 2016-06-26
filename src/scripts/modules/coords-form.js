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
				var cloudCover = conditions[0].getCloudCover() || maxMinVals.getMean(maxMinVals.cloudCoverMax, maxMinVals.cloudCoverMin, 'cloudCover');
				var speed = conditions[0].getWindSpeed() || maxMinVals.getMean(maxMinVals.windSpeedMax, maxMinVals.windSpeedMin, 'windSpeed');
				var pressure = conditions[0].getPressure() || maxMinVals.getMean(maxMinVals.pressureMax, maxMinVals.pressureMin, 'pressure');
				var visibility = conditions[0].getVisibility() || maxMinVals.getMean(maxMinVals.visibilityMax, maxMinVals.visibilityMin, 'visibility');
				var bearing = conditions[0].getWindBearing() || maxMinVals.getMean(maxMinVals.windBearingMax, maxMinVals.windBearingMin, 'windBearing');
				var ozone = conditions[0].getOzone() || maxMinVals.getMean(maxMinVals.ozoneMax, maxMinVals.ozoneMin, 'ozone');
				var humidity = conditions[0].getHumidity() || maxMinVals.getMean(maxMinVals.humidityMax, maxMinVals.humidityMin, 'humidity');
				var dewPoint = conditions[0].getDewPoint() || maxMinVals.getMean(maxMinVals.dewPointMax, maxMinVals.dewPointMin, 'dewPoint');
				var temperature = conditions[0].getTemperature() || maxMinVals.getMean(maxMinVals.temperatureMax, maxMinVals.temperatureMin, 'temperature');
				var apparentTemp = conditions[0].getApparentTemperature() || maxMinVals.getMean(maxMinVals.apparentTempMax, maxMinVals.apparentTempMin, 'apparentTemp');
				var name = newLocation.name;
				//need to pass two objects
				//one for the notes
				//one for the controllers
				var characterValues = new CharacterValues(name, cloudCover, speed, pressure, visibility);
				var pitchValues = new PitchValues(bearing, ozone, humidity, dewPoint, temperature, apparentTemp);
				var userLocConditions = {characterValues: characterValues, pitchValues: pitchValues};
				console.log('userLocConditions', userLocConditions);
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
									var add = results[0].formatted_address;
									var value = add.split(',');
									var count = value.length;
									var cityPc = value[count - 2];
									var cityArr = cityPc.split(',');
									var city = cityArr[0];
									locName = city;
								}
							} else {
								console.log('address not found');
							}
						}
						else {
							console.log('Geocoder failed due to: ' + status);
						}
						messageBlock.innerHTML = locName;
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
		// messageBlock.innerHTML = 'Geolocation is not supported by your browser \n' +
		// 	'Try searching';
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
			if(failure.message.indexOf('Only secure origins are allowed') === 0) {
      	console.log('Only secure origins are allowed');
    	}
			console.log('Unable to retrieve your location');
		}

		navigator.geolocation.getCurrentPosition(success, failure);
	}

	coordsSubmitBtn.addEventListener('click', function (e) {
		e.preventDefault();
		var lat = parseInt(document.getElementById('lat').value, 10);
		var long = parseInt(document.getElementById('long').value, 10);
		console.log('lat', typeof lat);
		console.log('lat', lat);
		console.log('long', typeof long);
		console.log('long', long);
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
			name: 'alberto de agostini', lat: -54.646128, long: -70.029602
		}
	];

	useLocBtn.addEventListener('click', function(e) {
		e.preventDefault();
		messageBlock.innerHTML = 'Getting your location';
		//For testing:
		getPlaces(staticPlaces[1].lat, staticPlaces[1].long);
		console.log('Using static data');
		//For live:
		//getGeo();
	});
};
