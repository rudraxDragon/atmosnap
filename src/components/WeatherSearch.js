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
        return data
      }
    } catch (error) {
    }

    // Fallback to WeatherAPI for India
    try {
      const res = await fetch('/.netlify/functions/weather', {
        method: 'POST',
        body: JSON.stringify({ lat, lon }),
      })

      if (!res.ok) throw new Error('Failed to fetch weather data')

      const data = await res.json()
      return data
    } catch (error) {
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
      return data
    } catch (error) {
      throw new Error('Failed to fetch weather data')
    }
  }
}

export default WeatherSearch
