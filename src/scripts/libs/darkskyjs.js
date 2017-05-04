'use strict';

//Install ES6 Promise and Moment.js using npm or
//if using require.js manage the paths as you see fit

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['moment', 'es6-promise'], function(moment) {
      return (root.DarkSky = factory(moment));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = (root.DarkSky = factory(require('moment'), require(
      'es6-promise').Promise));
  } else {
    // Browser globals (root is window)
    root.DarkSky = factory(root.moment);
  }
}(this, function(moment) {

  /* 	By Ian Tearle
  	github.com/iantearle

  	Other contributors
  	Richard Bultitude
  	github.com/rjbultitude
  	Brandon Love
  	github.com/brandonlove
  */

  //Error strings
  var fioServiceError =
    'There was a problem accessing darksky.net. Make sure you have a valid key';

  //Forecast Class
  /**
   * Will construct a new DarkSky object
   *
   * @param string $config
   * @return boolean
   */
  function DarkSky(config) {
    //var PROXY_SCRIPT = '/proxy.php';
    if (!config) {
      console.log('You must pass DarkSky configurations');
    }
    if (!config.PROXY_SCRIPT) {
      if (!config.API_KEY) {
        console.log('API_KEY or PROXY_SCRIPT must be set in DarkSky config');
      }
    }
    this.API_KEY = config.API_KEY;
    this.url = (typeof config.PROXY_SCRIPT !== 'undefined') ? config.PROXY_SCRIPT +
      '?url=' : 'https://api.darksky.net/forecast/' + config.API_KEY + '/';
  }

  function makeRequest(method, url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  /**
   * Checks the location object
   * passed into the app
   * and wraps it in an array
   * if it wasn't one already
   *
   * @param object $locObject
   * @return array
   */
  function checkObject(locObject) {
    var locationsObjWrap = [];
    if (!Array.isArray(locObject)) {
      //console.log('locations was not an array');
      locationsObjWrap.push(locObject);
      return locationsObjWrap;
    } else {
      return locObject;
    }
  }

  /**
   * Will build a url string from the lat long coords
   * and return a promise with the json
   *
   * @param number $latitude
   * @param number $longitude
   * @return promise object
   */
  DarkSky.prototype.requestData = function requestData(latitude, longitude) {
    var requestUrl = this.url + latitude + ',' + longitude;
    return makeRequest('GET', requestUrl);
  };

  DarkSky.prototype.requestAllLocData = function requestAllLocData(
    locations) {
    var locDataArr = [];
    for (var i = 0, length = locations.length; i < length; i++) {
      var content = this.requestData(locations[i].latitude, locations[i].longitude);
      locDataArr.push(content);
    }
    return locDataArr;
  };

  /**
   * Will take a locations object and a callback function
   * and pass the current conditions into the callback
   *
   * @param object $locations
   * @param function $appFn
   * @return boolean
   */
  DarkSky.prototype.getCurrentConditions = function getCurrentConditions(
    locations, appFn) {
    var locationsArr = checkObject(locations);
    var allLocDataArr = this.requestAllLocData(locationsArr);
    Promise.all(allLocDataArr).then(function(forecasts) {
      if (forecasts.length === 0 || forecasts[0] === '' || forecasts[
          0] === null || forecasts[0] === undefined) {
        console.log(fioServiceError);
        return;
      } else {
        var currDataSets = [];
        for (var i = 0, length = forecasts.length; i < length; i++) {
          var currJsonData = JSON.parse(forecasts[i]);
          currDataSets.push(new DarkSkyConditions(
            currJsonData.currently,
            locations[i].name || 'no name provided'
          ));
        }
        //Pass data to callback
        appFn(currDataSets);
        return currDataSets;
      }
    }, function(rejectObj) {
      console.log(rejectObj.status);
      console.log(rejectObj.statusText);
    });
  };

  /**
   * Will take a locations object and a callback function
   * and pass the conditions on hourly basis for today into the callback
   *
   * @param object $locations
   * @param function $appFn
   * @return boolean
   */
  DarkSky.prototype.getForecastToday = function getForecastToday(locations,
    appFn) {
    var locationsArr = checkObject(locations);
    var allLocDataArr = this.requestAllLocData(locationsArr);
    Promise.all(allLocDataArr).then(function(forecasts) {
      if (forecasts.length === 0 || forecasts[0] === '' || forecasts[
          0] === null || forecasts[0] === undefined) {
        console.log(fioServiceError);
        return;
      } else {
        var hourlyDataSets = [];
        for (var i = 0, length = forecasts.length; i < length; i++) {
          var today = moment().format('YYYY-MM-DD');
          var thisHourlySet = [];
          var dailyJsonData = JSON.parse(forecasts[i]);
          //DarkSky returns an array for each
          for (var j = 0, dLength = dailyJsonData.hourly.data.length; j <
            dLength; j++) {
            var hourlyData = dailyJsonData.hourly.data[j];
            if (moment.unix(hourlyData.time).format('YYYY-MM-DD') ===
              today) {
              thisHourlySet.push(new DarkSkyConditions(
                hourlyData,
                locations[i].name || 'no name provided'
              ));
            }
          }
          hourlyDataSets.push(thisHourlySet);
        }
        //Pass data to callback
        appFn(hourlyDataSets);
        return hourlyDataSets;
      }
    }, function(rejectObj) {
      console.log(rejectObj.status);
      console.log(rejectObj.statusText);
    });
  };

  /**
   * Will take a locations object and a callback function
   * and pass the daily conditions for next seven days into the callback
   *
   * @param object $locations
   * @param function $appFn
   * @return boolean
   */
  DarkSky.prototype.getForecastWeek = function getForecastWeek(locations,
    appFn) {
    var locationsArr = checkObject(locations);
    var allLocDataArr = this.requestAllLocData(locationsArr);
    Promise.all(allLocDataArr).then(function(forecasts) {
      if (forecasts.length === 0 || forecasts[0] === '' || forecasts[
          0] === null || forecasts[0] === undefined) {
        console.log(fioServiceError);
        return;
      } else {
        var weekDataSets = [];
        for (var i = 0, length = forecasts.length; i < length; i++) {
          var thisWeekSets = [];
          var weeklyJsonData = JSON.parse(forecasts[i]);
          //DarkSky returns an array for each
          for (var j = 0; j < weeklyJsonData.daily.data.length; j++) {
            var dailyDataSet = weeklyJsonData.daily.data[j];
            thisWeekSets.push(new DarkSkyConditions(
              dailyDataSet,
              locations[i].name || 'no name provided'
            ))
          }
          weekDataSets.push(thisWeekSets);
        }
        //Pass data to callback
        appFn(weekDataSets);
        return weekDataSets;
      }
    }, function(rejectObj) {
      console.log(rejectObj.status);
      console.log(rejectObj.statusText);
    });
  };

  function DarkSkyConditions(rawData, name) {
    DarkSkyConditions.prototype = {
      rawData: rawData
    };
    this.name = name || 'no name provided';
    /**
     * Will return the temperature
     *
     * @return String
     */
    this.temperature = function() {
      return rawData.temperature;
    };
    /**
     * Will return the apparent temperature
     *
     * @return String
     */
    this.apparentTemperature = function() {
      return rawData.apparentTemperature;
    };
    /**
     * Get the summary of the conditions
     *
     * @return String
     */
    this.summary = function() {
      return rawData.summary;
    };
    /**
     * Get the icon of the conditions
     *
     * @return String
     */
    this.icon = function() {
      return rawData.icon;
    };
    /**
     * Get the time, when $format not set timestamp else formatted time
     *
     * @param String $format
     * @return String
     */
    this.time = function(format) {
      if (!format) {
        return rawData.time;
      } else {
        return moment.unix(rawData.time).format(format);
      }
    };
    /**
     * Get the pressure
     *
     * @return String
     */
    this.pressure = function() {
      return rawData.pressure;
    };
    /**
     * get humidity
     *
     * @return String
     */
    this.humidity = function() {
      return rawData.humidity;
    };
    /**
     * Get the wind speed
     *
     * @return String
     */
    this.windSpeed = function() {
      return rawData.windSpeed;
    };
    /**
     * Get wind direction
     *
     * @return type
     */
    this.windBearing = function() {
      return rawData.windBearing;
    };
    /**
     * get precipitation type
     *
     * @return type
     */
    this.precipType = function() {
      return rawData.precipType;
    };
    /**
     * get the probability 0..1 of precipitation type
     *
     * @return type
     */
    this.precipProbability = function() {
      return rawData.precipProbability;
    };
    /**
     * Get the cloud cover
     *
     * @return type
     */
    this.cloudCover = function() {
      return rawData.cloudCover;
    };
    /**
     * get the min temperature
     *
     * only available for week forecast
     *
     * @return type
     */
    this.temperatureMin = function() {
      return rawData.temperatureMin;
    };
    /**
     * get max temperature
     *
     * only available for week forecast
     *
     * @return type
     */
    this.temperatureMax = function() {
      return rawData.temperatureMax;
    };
    /**
     * get sunrise time
     *
     * only available for week forecast
     *
     * @return type
     */
    this.sunriseTime = function() {
      return rawData.sunriseTime;
    };
    /**
     * get sunset time
     *
     * only available for week forecast
     *
     * @return type
     */
    this.sunsetTime = function() {
      return rawData.sunsetTime;
    };
    /**
     * get precipitation intensity
     *
     * @return number
     */
    this.precipIntensity = function() {
      return rawData.precipIntensity;
    };
    /**
     * get dew point
     *
     * @return number
     */
    this.dewPoint = function() {
      return rawData.dewPoint;
    };
    /**
     * get the ozone
     *
     * @return number
     */
    this.ozone = function() {
      return rawData.ozone;
    };
    /**
     * get the visibility
     *
     * @return number
     */
    this.visibility = function() {
      return rawData.visibility;
    };
    /**
     * get the nearest storm bearing
     *
     * @return number
     */
    this.nearestStormBearing = function() {
      return rawData.nearestStormBearing;
    };
    /**
     * get the nearest storm distance
     *
     * @return number
     */
    this.nearestStormDistance = function() {
      return rawData.nearestStormDistance;
    };
  }

  return DarkSky;
}));
