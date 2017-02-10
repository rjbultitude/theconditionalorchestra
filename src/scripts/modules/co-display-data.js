'use strict';

module.exports = function() {
    return {
        primaryMap: [
          {
            key: 'pressure',
            title: 'Air pressure',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Root note is ',
            musicValue: ''
          },
          {
            key: 'isCloudy',
            title: 'Cloudy but not windy',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Bass note playing',
            musicValue: '',
            negativeKey: 'isWindy',
            negativeValue: ''
          },
          {
            key: 'temperature',
            title: 'Temperature',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'visibility',
            title: 'Visibility',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/visibility-icon.svg',
            music: 'Long note is offset by -',
            musicValue: '',
            musicAppendage: ' octaves'
          },
          {
            key: 'cloudCover',
            title: 'Cloud cover',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Master filter frequency ',
            musicValue: ''
          },
          {
            key: 'ozone',
            title: 'Ozone level',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/ozone-icon.svg',
            music: 'Number of lower chords: ',
            musicValue: ''
          },
          {
            key: 'dewPoint',
            title: 'Dew point',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of main sequence chords: ',
            musicValue: ''
          },
          {
            key: 'windSpeed',
            title: 'Wind speed',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/windy-icon.svg',
            music: 'Wind chime sound pitch ',
            musicValue: ''
          },
          {
            key: 'isHumid',
            title: 'Humid but no precipitation',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humid-icon.svg',
            music: 'Harp arpeggio playing ',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: ''
          },
          {
            key: 'isFine',
            title: 'Very fine conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Upper choral sound',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Filtered lower choral sound',
            musicValue: ''
          },
          {
            key: 'apparentTemperature',
            title: 'Apparent temperature',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Main sequence repeats ',
            musicValue: '',
            musicAppendage: ' times'
          },
          {
            key: 'precipType',
            title: 'Type of precipitation',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/rain-icon.svg',
            music: 'Bell sound playing ',
          },
          {
            key: 'precipIntensity',
            title: 'Precipitation intensity',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/rain-icon.svg',
            music: 'Bell arpeggio playing at ',
            musicValue: '',
            musicAppendage: ' bpm'
          },
          {
            key: 'isWindy',
            title: 'High winds',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/windy-icon.svg',
            music: 'Brass baritones playing',
            musicValue: ''
          },
          {
            key: 'windBearing',
            title: 'Wind bearing',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/bearing-icon.svg',
            music: 'Long note is ',
            musicValue: '',
            musicAppendage: ' note within chord'
          },
          {
            key: 'precipProbability',
            title: 'Pecipitation probability',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/rain-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'nearestStormBearing',
            title: 'Nearest storm bearing',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/bearing-icon.svg',
            music: 'Cymbals rate is ',
            musicValue: ''
          },
          {
            key: 'nearestStormDistance',
            title: 'Nearest storm distance',
            value: '',
            constrain: true,
            unit: 'miles',
            iconPath: '/img/storm-distance-icon.svg',
            music: 'Cymbals volume is ',
            musicValue: ''
          }
        ],
        chordTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isCold',
            title: 'Cold weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isStormy',
            title: 'Stormy weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not fine, cold, clement nor stormy',
            value: 'true',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          }
        ],
        chordSeqTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isWindy',
            title: 'Windy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/windy-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not fine, freezing, clement nor windy',
            value: 'true',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          }
        ],
        padTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isCold',
            title: 'Cold weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isStormy',
            title: 'Stormy weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not fine, cold, clement nor stormy ',
            value: 'true',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          }
        ],
        inversionMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isWindy',
            title: 'Cold weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/windy-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not fine, windy or freezing',
            value: 'true',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          }
        ],
        numNotesMap: [
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          },
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Not freezing or fine',
            value: 'true',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          }
        ]
    };
};
