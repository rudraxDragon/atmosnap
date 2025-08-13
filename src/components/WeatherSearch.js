const WeatherSearch = async (lat, lon, searchRegion = 'india') => {
  if (searchRegion === 'india') {
    // For India: Try Visual Crossing first, fallback to WeatherAPI
    try {
      const res = await fetch('/.netlify/functions/visualcrossing', {
        method: 'POST',
        body: JSON.stringify({ lat, lon }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Using Visual Crossing weather data for India')
        return data
      }
    } catch (error) {
      console.log('❌ Visual Crossing failed, falling back to WeatherAPI')
    }

    // Fallback to WeatherAPI for India
    try {
      const res = await fetch('/.netlify/functions/weather', {
        method: 'POST',
        body: JSON.stringify({ lat, lon }),
      })

      if (!res.ok) throw new Error('Failed to fetch weather data')

      const data = await res.json()
      console.log('✅ Using WeatherAPI fallback for India')
      return data
    } catch (error) {
      console.error('Both weather APIs failed for India:', error)
      throw new Error('Failed to fetch weather data from all sources')
    }
  } else {
    // For outside India: Use WeatherAPI only
    try {
      const res = await fetch('/.netlify/functions/weather', {
        method: 'POST',
        body: JSON.stringify({ lat, lon }),
      })

      if (!res.ok) throw new Error('Failed to fetch weather data')

      const data = await res.json()
      console.log('✅ Using WeatherAPI for location outside India')
      return data
    } catch (error) {
      console.error('WeatherAPI failed for outside India:', error)
      throw new Error('Failed to fetch weather data')
    }
  }
}

export default WeatherSearch
