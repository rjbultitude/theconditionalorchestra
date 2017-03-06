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
            key: 'visibility',
            title: 'Visibility',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/visibility-icon.svg',
            music: 'Pad chords reverb length ',
            musicValue: '',
            musicAppendage: ' seconds'
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
            unit: 'mph',
            iconPath: '/img/windy-icon.svg',
            music: 'Wind chime sound pitch ',
            musicValue: ''
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
            key: 'precipProbability',
            title: 'Precipitation probability',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/rain-icon.svg',
            music: 'Ride cymbals volume is ',
            musicValue: ''
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
          },
          {
            key: 'isHumid',
            title: 'Humid conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Harp arpeggio is playing',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: ''
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
            value: true,
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
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          }
        ],
        padTypeMap: [
          {
            key: 'isBitter',
            title: 'Bitter conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
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
            key: 'isViolentStorm',
            title: 'Violent storm',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isCold',
            title: 'Cold conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isFine',
            title: 'Cold conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Is not stormy, cold, bitter nor fine ',
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          }
        ],
        longNoteTypeMap: [
          {
            key: 'isMuggy',
            title: 'Muggy weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'isArid',
            title: 'Warm arid conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'isCrisp',
            title: 'Cold, dry conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Neither muggy, arid nor crisp',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Long note is a ',
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
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Inversion types are ',
            musicValue: ''
          }
        ],
        numNotesMap: [
          {
            key: 'isBitter',
            title: 'Bitter conditions',
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
            title: 'Not bitter or fine',
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Number of notes per chord is ',
            musicValue: ''
          }
        ],
        semiTonesMap: [
          {
            key: 'isBitter',
            title: 'Bitter',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isStormy',
            title: 'Stormy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isViolentStorm',
            title: 'Violent storm',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Not extreme weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
        ],
        //TODO
        //Should this be called secondary map?
        //It doesn't have an isOther property
        //and could be used to manage any duplicate
        humidArpMap: [
          {
            key: 'humidity',
            title: 'Humidity',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/humidity-icon.svg',
            music: 'Harp arpeggio tempo is ',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: ''
          },
          {
            key: 'pressure',
            title: 'Air pressure',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/pressure-icon.svg',
            music: 'Harp arpeggio intervals are ',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: ''
          }
        ]
    };
};
