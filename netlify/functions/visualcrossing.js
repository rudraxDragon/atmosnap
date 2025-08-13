// netlify/functions/visualcrossing.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {

    const { lat, lon } = JSON.parse(event.body || "{}");
    if (!lat || !lon) {
      throw new Error(`Missing lat/lon in request: lat=${lat}, lon=${lon}`);
    }

    const VC_KEY = process.env.VISUAL_CROSSING_API_KEY;
    if (!VC_KEY) {
      throw new Error("Missing VISUALCROSSING_KEY in environment variables");
    }

    // 1️⃣ Get weather from Visual Crossing
    const vcUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${VC_KEY}&contentType=json`;

    const vcRes = await fetch(vcUrl);
    if (!vcRes.ok) {
      throw new Error(`Visual Crossing API returned ${vcRes.status} ${vcRes.statusText}`);
    }
    const weatherData = await vcRes.json();

    // 2️⃣ Reverse geocode to get city name
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "Atmosnap/1.0 (rudraksh.prasad)" },
    });
    if (!geoRes.ok) {
      throw new Error(`Nominatim API returned ${geoRes.status} ${geoRes.statusText}`);
    }
    const geoData = await geoRes.json();

    // 3️⃣ Attach location name
    weatherData.location = {
      name: geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.hamlet || geoData.address?.locality || geoData.display_name?.split(',')[0] || "Unknown place",      country: geoData.address?.country || "Unknown country",
      region: geoData.address?.state || "",
      lat,
      lon
    };

    return {
      statusCode: 200,
      body: JSON.stringify(weatherData),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
