'use strict';

module.exports = function() {
    return {
        chordTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isCold',
            title: 'Cold weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isStormy',
            title: 'Stormy weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not freezing, fine, cold nor clement ',
            value: 'true',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord types are ',
            musicValue: ''
          }
        ],
        chordSeqTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isWindy',
            title: 'Windy conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not freezing, fine, cold nor clement ',
            value: 'true',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          }
        ],
        padTypeMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isCold',
            title: 'Cold weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isStormy',
            title: 'Stormy weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not freezing, fine, cold nor clement ',
            value: 'true',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          }
        ],
        inversionMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isWindy',
            title: 'Cold weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Clement conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not fine, windy or freezing',
            value: 'true',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          }
        ],
        numNotesMap: [
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          },
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Not freezing or fine',
            value: 'true',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          }
        ],
        primaryMap: [
          {
            key: 'pressure',
            title: 'Air pressure',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Root note is ',
            musicValue: ''
          },
          {
            key: 'isCloudy',
            title: 'Cloudy but not windy',
            value: '',
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
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'visibility',
            title: 'Visibility',
            value: '',
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Long note is offset by -',
            musicValue: '',
            musicAppendage: ' octaves'
          },
          {
            key: 'cloudCover',
            title: 'Cloud cover',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Master filter frequency ',
            musicValue: ''
          },
          {
            key: 'ozone',
            title: 'Ozone level',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Number of lower chords: ',
            musicValue: ''
          },
          {
            key: 'dewPoint',
            title: 'Dew point',
            value: '',
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of main sequence chords: ',
            musicValue: ''
          },
          {
            key: 'windSpeed',
            title: 'Wind speed',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Wind chime sound pitch',
            musicValue: ''
          },
          {
            key: 'isHumid',
            title: 'Humid but no precipitation',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Harp arpeggio playing ',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: ''
          },
          {
            key: 'isFine',
            title: 'Very fine conditions',
            value: '',
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Upper choral sound',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Filtered lower choral sound',
            musicValue: ''
          },
          {
            key: 'apparentTemperature',
            title: 'Apparent temperature',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Main sequence repeats ',
            musicValue: '',
            musicAppendage: ' times'
          },
          {
            key: 'precipType',
            title: 'Type of precipitation',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Bell sound playing ',
          },
          {
            key: 'precipIntensity',
            title: 'Precipitation intensity',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Bell arpeggio playing at ',
            musicValue: '',
            musicAppendage: ' bpm'
          },
          {
            key: 'isWindy',
            title: 'High winds',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Brass baritones playing',
            musicValue: ''
          },
          {
            key: 'isWindyArp',
            title: 'High winds',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Harp sequence type is ',
            musicValue: ''
          },
          {
            key: 'summary',
            title: 'Overview',
            value: '*',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Pad sound is ',
            musicValue: ''
          },
          {
            key: 'windBearing',
            title: 'Wind bearing',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Long note is ',
            musicValue: '',
            musicAppendage: ' note from chord'
          },
          {
            key: 'precipProbability',
            title: 'Pecipitation probability',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'nearestStormBearing',
            title: 'Nearest storm bearing',
            value: '',
            unit: '',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Cymbals rate is ',
            musicValue: ''
          },
          {
            key: 'nearestStormDistance',
            title: 'Nearest storm distance',
            value: '',
            unit: 'miles',
            iconPath: '/img/cloud-cover-icon.svg',
            music: 'Cymbals volume is ',
            musicValue: ''
          },
          {
            key: 'extremeWeather',
            title: 'Extreme weather',
            value: '',
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Number of notes in chord is ',
            musicValue: ''
          }
        ]
    };
};
