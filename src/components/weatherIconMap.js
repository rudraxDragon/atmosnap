const weatherCodeToIcon = {
  // ===== WeatherAPI Codes =====

  // Clear
  1000: 'wi-day-sunny',
  
  // Cloudy
  1003: 'wi-day-cloudy',
  1006: 'wi-cloudy',
  1009: 'wi-cloudy',
  
  // Mist/Fog
  1030: 'wi-fog',
  1135: 'wi-fog',
  1147: 'wi-fog',
  
  // Rain
  1063: 'wi-rain',        // Light rain
  1150: 'wi-rain',        // Light drizzle
  1153: 'wi-rain',        // Light drizzle
  1168: 'wi-rain',        // Light freezing drizzle
  1171: 'wi-rain',        // Heavy freezing drizzle
  1180: 'wi-rain',        // Light rain
  1183: 'wi-rain',        // Light rain
  1186: 'wi-rain',        // Moderate rain
  1189: 'wi-rain',        // Moderate rain
  1192: 'wi-showers',     // Heavy rain
  1195: 'wi-showers',     // Heavy rain
  1198: 'wi-showers',     // Freezing rain
  1201: 'wi-showers',     // Heavy freezing rain
  1240: 'wi-rain',        // Light showers
  1243: 'wi-showers',     // Moderate/heavy showers
  1246: 'wi-showers',     // Heavy showers
  
  // Snow
  1066: 'wi-snow',
  1069: 'wi-sleet',
  1072: 'wi-sleet',
  1114: 'wi-snow',
  1117: 'wi-snow',
  1204: 'wi-sleet',
  1207: 'wi-sleet',
  1210: 'wi-snow',
  1213: 'wi-snow',
  1216: 'wi-snow',
  1219: 'wi-snow',
  1222: 'wi-snow',
  1225: 'wi-snow',
  1237: 'wi-hail',
  1249: 'wi-sleet',
  1252: 'wi-sleet',
  1255: 'wi-snow',
  1258: 'wi-snow',
  1261: 'wi-hail',
  1264: 'wi-hail',
  
  // Thunderstorm
  1087: 'wi-thunderstorm',
  1273: 'wi-thunderstorm',
  1276: 'wi-thunderstorm',
  1279: 'wi-thunderstorm',
  1282: 'wi-thunderstorm',

  // ===== Visual Crossing Icon Strings =====
  "clear-day": "wi-day-sunny",
  "clear-night": "wi-night-clear",
  "partly-cloudy-day": "wi-day-cloudy",
  "partly-cloudy-night": "wi-night-alt-cloudy",
  "cloudy": "wi-cloudy",
  "overcast": "wi-cloudy",
  "rain": "wi-rain",
  "showers-day": "wi-day-showers",
  "showers-night": "wi-night-alt-showers",
  "thunderstorm": "wi-thunderstorm",
  "snow": "wi-snow",
  "snow-showers-day": "wi-day-snow",
  "snow-showers-night": "wi-night-alt-snow",
  "fog": "wi-fog",
  "wind": "wi-strong-wind",
  "hail": "wi-hail",
  "sleet": "wi-sleet",
  "freezing-rain": "wi-rain-mix"
}

export default weatherCodeToIcon
