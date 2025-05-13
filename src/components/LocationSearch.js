const LocationSearch = async (location) => { 
  const url = `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=5`
  const res = await fetch(url)
  const data = await res.json()
  return data[0]
}

export default LocationSearch
