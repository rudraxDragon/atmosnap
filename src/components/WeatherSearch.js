const WeatherSearch = async (lat, lon) => {
  const res = await fetch('/.netlify/functions/weather', {
    method: 'POST',
    body: JSON.stringify({ lat, lon }),
  })

  if (!res.ok) throw new Error('Failed to fetch weather data')

  const data = await res.json()
  return data
}

export default WeatherSearch
