'use strict';

var Forecastio = require('../libs/forecast.io');
var audioVisual = require('./audio-visual');
var ConditionsValues = require('./cond-cnstrctr');
var Nll = require('./nll-cnstrctr');
var GoogleMapsLoader = require('google-maps');
var makeRequest = require('./make-request');
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
				var speed = conditions[0].getWindSpeed();
				var bearing = conditions[0].getWindBearing();
				var ozone = conditions[0].getOzone();
				var visibility = conditions[0].getVisibility();
				var pressure = conditions[0].getPressure();
				var humidity = conditions[0].getHumidity();
				var cloudCover = conditions[0].getCloudCover();
				var dewPoint = conditions[0].getDewPoint();
				var temperature = conditions[0].getTemperature();
				var apparentTemp = conditions[0].getApparentTemperature();
				//TO DO get correct name
				var name = newLocation.name;
				var userLocConditions = new ConditionsValues(speed, bearing, ozone, visibility, pressure, humidity, cloudCover, dewPoint, temperature, apparentTemp, name);
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
						messageBlock.innerHTML = '';
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
		var lat = document.getElementById('lat').value;
		var long = document.getElementById('long').value;
		if (typeof lat !== 'number' || typeof long !== 'number') {
			messageBlock.innerHTML = 'please enter a number';
		}
		else {
			updateApp(lat, long);
		}
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

	useLocBtn.addEventListener('click', function(e) {
		e.preventDefault();
		messageBlock.innerHTML = 'Getting your location';
		//For testing
		//getPlaces(19.896766, -155.582782);
		getGeo();
	});
};
