'use strict';

module.exports = (function() {
    return {
        primaryMap: [
          {
            key: 'pressure',
            musicKey: 'rootNote',
            title: 'Air pressure',
            value: '',
            constrain: true,
            unit: 'Mbs',
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
            iconPath: '/img/cloudy-icon.svg',
            music: 'Bass note playing',
            musicValue: '',
            negativeKey: 'isWindy',
            negativeValue: false
          },
          {
            key: 'visibility',
            title: 'Visibility',
            value: '',
            constrain: true,
            unit: 'miles',
            iconPath: '/img/visibility-icon.svg',
            music: 'Long note filter frequency ',
            musicValue: '',
            musicAppendage: ' Hz'
          },
          {
            key: 'cloudCover',
            title: 'Cloud cover',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/cloudy-icon.svg',
            music: 'Master filter frequency ',
            musicValue: '',
            musicAppendage: ' Hz'
          },
          {
            key: 'ozone',
            title: 'Ozone level',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/ozone-icon.svg',
            music: 'Number of 2nd sequence chords: ',
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
            key: 'isFine',
            title: 'Very fine conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Upper choral sound playing',
            musicValue: ''
          },
          {
            key: 'isFreezing',
            title: 'Freezing conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Filtered lower choral sound playing',
            musicValue: ''
          },
          {
            key: 'isFoggy',
            title: 'Foggy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/visibility-icon.svg',
            music: 'Percussion filtered; pad playing very softly',
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
            music: 'Ride cymbals tempo is ',
            musicValue: '',
            musicAppendage: ' bpm'
          },
          {
            key: 'uvIndex',
            title: 'UV index',
            value: '',
            constrain: true,
            unit: '',
            iconPath: '/img/uv-icon.svg',
            music: 'Maximum noise level ',
            musicValue: ''
          },
          {
            key: 'isWindy',
            title: 'High winds',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/wind-icon.svg',
            music: 'Brass baritones playing',
            musicValue: ''
          },
          {
            key: 'isOminous',
            title: 'Bad weather pending',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Percussion playing',
            musicValue: ''
          },
          {
            key: 'isArid',
            title: 'Arid conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Timpani playing',
            musicValue: ''
          },
          {
            key: 'isCrisp',
            title: 'Crisp conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Timpani playing',
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
            music: 'Ride cymbals max volume is ',
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
            negativeKey: ['isPrecip', 'isFine', 'isWindy'],
            negativeValue: false
          },
          {
            key: 'isSublime',
            title: 'Sublime conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Long note playing quietly; the rhodes a little louder',
            musicValue: ''
          },
          {
            key: 'temperature',
            title: 'Temperature',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/temperature-icon.svg',
            music: 'Melody playing ',
            musicValue: ''
          },
          {
            key: 'isMildAndHumid',
            title: 'Mild and humid conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Chords playing very softly',
            musicValue: '',
            negativeKey: ['isPrecip', 'isFine', 'isWindy'],
            negativeValue: false
          },
          {
            key: 'isVisbilityPoor',
            title: 'Visibility is poor',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/visibility-icon.svg',
            music: 'Long notes overlap',
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
            title: 'High winds',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/wind-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isPrecip',
            title: 'Precipitation',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/rain-icon.svg',
            music: 'Chord sequence type is ',
            musicValue: ''
          },
          {
            key: 'isCloudy',
            title: 'Cloudy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/cloudy-icon.svg',
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
            key: 'isWayBelowFreezing',
            title: 'Is way below freezing',
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
            key: 'isSmoggy',
            title: 'Dull or hazy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/cloudy-icon.svg',
            music: 'Pad instrument is ',
            musicValue: ''
          },
          {
            key: 'isFine',
            title: 'Fine conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
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
            key: 'isMild',
            title: 'Mild weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
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
            key: 'isOminous',
            title: 'Bad weather pending',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'isSirocco',
            title: 'Warm, arid and windy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
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
            key: 'isWayBelowFreezing',
            title: 'Is way below freezing',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Long note is a ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Neither muggy, arid, clement nor crisp',
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
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
            title: 'High winds',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/wind-icon.svg',
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
            key: 'isStormy',
            title: 'Stormy conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
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
            title: 'Bitter conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isWayBelowFreezing',
            title: 'Is way below freezing',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/freezing-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isViolentStorm',
            title: 'Violent storm',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Not extreme weather',
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/storm-icon.svg',
            music: 'Number of semitones in octave: ',
            musicValue: ''
          },
        ],
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
            musicAppendage: ' bpm',
            negativeKey: ['isPrecip', 'isFine', 'isWindy'],
            negativeValue: false
          },
          {
            key: 'pressure',
            title: 'Air pressure',
            value: '',
            constrain: false,
            unit: 'Mbs',
            iconPath: '/img/pressure-icon.svg',
            music: 'Harp arpeggio playing ',
            musicValue: '',
            negativeKey: ['isPrecip', 'isFine', 'isWindy'],
            negativeValue: false
          }
        ],
        leadMap: [
          {
            key: 'isFine',
            title: 'Fine weather',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/sun-icon.svg',
            music: 'Rhodes arpeggio playing ',
            musicValue: '',
            negativeKey: 'isPrecip',
            negativeValue: false
          }
        ],
        padLengthMap: [
          {
            key: 'isClement',
            title: 'Clement conditions',
            value: '',
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Loop mode is full note',
            musicValue: ''
          },
          {
            key: 'isOther',
            title: 'Inclement conditions',
            value: true,
            constrain: false,
            unit: '',
            iconPath: '/img/weather-icon.svg',
            music: 'Loop mode is varying lengths',
            musicValue: ''
          }
        ]
    };
})();
