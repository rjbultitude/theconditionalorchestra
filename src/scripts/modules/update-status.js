'use strict';

var statusMsgs = require('./messages');
var makeRequest = require('../utilities/make-request');

module.exports = function updateStatus(status, locationAddress, noAudioSupport, customMessage) {
  var messageBlock = document.getElementById('message-block');
  var iconsBlock = document.querySelector('.icons-block');
  var messagesParent = messageBlock.parentNode;

  if (noAudioSupport) {
    var noAudioEl = document.createElement('p');
    noAudioEl.innerHTML = statusMsgs.noAudio;
    messagesParent.insertBefore(noAudioEl, messageBlock);
    if (locationAddress) {
      messageBlock.innerHTML = statusMsgs.noAudioPlaying + locationAddress;
    }
    return;
  }

  //Absent key handler
  if (statusMsgs[status] === undefined) {
    console.log('status errors. cannot find key ', status);
  } else {
    messageBlock.innerHTML = statusMsgs[status];
  }

  //Absent location address handler
  if (locationAddress !== undefined) {
    messageBlock.innerHTML = statusMsgs[status] + locationAddress;
  }

  //Custom message
  if (customMessage !== undefined) {
    messageBlock.innerHTML = customMessage + statusMsgs[status] + locationAddress;
  }

  var iconUrls = {
    error: {
      url: 'img/error-icon.svg'
    },
    cloud: {
      url: 'img/cloud-cover-icon.svg'
    },
    location: {
      url: 'img/location-icon.svg'
    },
    sun: {
      url: 'img/sun-icon.svg'
    },
    playing: {
      url: 'img/playing-icon.svg'
    },
    weather: {
      url: 'img/weather-icon.svg'
    }
  };

  function getIconUrl(status, iconUrls) {
    if (status === 'start' || status === 'obtainedLocation') {
      return iconUrls.sun.url;
    } else if (status === 'location') {
      return iconUrls.location.url;
    } else if (status === 'playing') {
      return iconUrls.playing.url;
    } else if (status === 'weather') {
      return iconUrls.weather.url;
    } else {
      return iconUrls.error.url;
    }
  }

  //Update icons
  function setIcon(status, iconUrls) {
    var iconURl = getIconUrl(status, iconUrls);
    var fetchIcons = makeRequest('GET', iconURl, 'image/svg+xml');
    fetchIcons.then(function success(data) {
      iconsBlock.innerHTML = data;
    }, function failure(error) {
      console.log('error fetching data: ', error);
    });
  }

  setIcon(status, iconUrls);
};
