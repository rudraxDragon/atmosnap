const weatherCodeToIcon = {
  // Clear
  1000: 'wi-day-sunny',

  // Partly cloudy
  1003: 'wi-day-cloudy',
  1006: 'wi-cloud',

  // Overcast
  1009: 'wi-cloudy',

  // Mist/Fog
  1030: 'wi-fog',
  1135: 'wi-fog',
  1147: 'wi-fog',

  // Rain
  1063: 'wi-showers',
  1180: 'wi-showers',
  1183: 'wi-rain',
  1186: 'wi-rain',
  1189: 'wi-rain',
  1192: 'wi-rain',
  1195: 'wi-rain',
  1240: 'wi-showers',
  1243: 'wi-rain',
  1246: 'wi-rain',

  // Thunderstorm
  1087: 'wi-thunderstorm',
  1273: 'wi-storm-showers',
  1276: 'wi-thunderstorm',

  // Snow
  1066: 'wi-snow',
  1210: 'wi-snow',
  1213: 'wi-snow',
  1216: 'wi-snow',
  1219: 'wi-snow',
  1222: 'wi-snow',
  1225: 'wi-snow',
  1255: 'wi-snow',
  1258: 'wi-snow',

  // Sleet
  1204: 'wi-sleet',
  1249: 'wi-sleet',

  // Freezing rain
  1198: 'wi-rain-mix',

  // Ice pellets
  1237: 'wi-hail',

  // Default fallback
  default: 'wi-na'
}

export default weatherCodeToIcon
