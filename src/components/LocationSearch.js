const LocationSearch = async (location, searchRegion = 'india') => {
  // Build URL based on search region using Nominatim
  let url;
  if (searchRegion === 'india') {
    // Search within India only
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&countrycodes=in&limit=1&addressdetails=1`
  } else {
    // Search outside India (exclude India from results)
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=1&exclude_place_ids=&countrycodes=!in`
  }
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Atmosnap/1.0 (weather-app)'
      }
    })
    const data = await res.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      
      // Filter out India results for 'outside' search
      if (searchRegion === 'outside' && result.address?.country?.toLowerCase().includes('india')) {
        return null
      }
      
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export default LocationSearch
