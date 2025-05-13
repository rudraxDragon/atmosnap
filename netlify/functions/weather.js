export async function handler(event) {
  const { lat, lon } = JSON.parse(event.body)
  const apiKey = process.env.WEATHER_API_KEY

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather' }),
    }
  }
}
