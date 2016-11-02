/**
  Any changes? Remember to update
  the status icons too
*/

'use strict';

module.exports = {
    start: 'Ready',
    weather: 'Fetching weather data',
    location: 'Looking up name',
    playing: 'You are listening to the weather of ',
    noAudioPlaying: 'Showing the weather for ',
    error: 'Error getting your location',
    errorData: 'Error getting static weather data, sorry',
    noGeo: 'Geolocation is not supported by your browser Try searching',
    noGeoAccess: 'Please check that you\'ve granted permission to use your location or try a custom location',
    noGeoAcessLastKnown: 'Please check that you\'ve granted permission to use your location. Using last location: ',
    noGeoAcessStatic: 'Please check that you\'ve granted permission to use your location. Using default location: ',
    badPlaceName: 'Couldn\'t find that place sorry.',
    badPlaceNameStatic: 'Couldn\'t find that place sorry. Using last location: ',
    badPlaceNameLastKnown: 'Couldn\'t find that place sorry. Using last location: ',
    badConnection: 'Unable to retrieve your location, perhaps you have no connection',
    badConnectionLastKnown: 'Unable to retrieve your location. Are you offline? Using last known location ',
    badConnectionStatic: 'Unable to retrieve your location. Are you offline? Using default location ',
    stringError: 'Please enter text',
    obtainedLocation: 'Successfully retieved your location',
    noAddress: 'Could not find that place...perhaps it\'s just the ocean',
    noAudio: 'Your browser doesn\'t support web audio. Try using Chrome or Firefox'
};
