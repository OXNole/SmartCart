// SmartCart — Google Places nearby grocery store finder
// Netlify function: /.netlify/functions/places
// Set GOOGLE_PLACES_API_KEY in Netlify environment variables

const GROCERY_KEYWORDS = [
  "grocery", "supermarket", "food market",
  "publix", "kroger", "harris teeter", "whole foods",
  "trader joe", "aldi", "walmart grocery", "target grocery",
  "fresh market", "sprouts", "wegmans", "safeway",
  "food lion", "ingles", "winn dixie", "piggly wiggly",
  "costco", "sams club", "lidl"
];

// Store chain → emoji mapping
function chainEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("publix"))        return "🟢";
  if (n.includes("harris teeter")) return "🔵";
  if (n.includes("whole foods"))   return "🌿";
  if (n.includes("trader joe"))    return "🌺";
  if (n.includes("aldi"))          return "🔶";
  if (n.includes("kroger"))        return "🔴";
  if (n.includes("walmart"))       return "⚡";
  if (n.includes("target"))        return "🎯";
  if (n.includes("fresh market"))  return "🟡";
  if (n.includes("sprouts"))       return "🥦";
  if (n.includes("costco"))        return "🏢";
  if (n.includes("wegmans"))       return "🛒";
  if (n.includes("food lion"))     return "🦁";
  if (n.includes("ingles"))        return "🛒";
  if (n.includes("winn"))          return "🛒";
  if (n.includes("lidl"))          return "🔷";
  return "🏪";
}

exports.handler = async function(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" })
    };
  }

  let lat, lng, radiusMiles;
  try {
    const body = JSON.parse(event.body);
    lat = body.lat;
    lng = body.lng;
    radiusMiles = body.radiusMiles || 15;
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid request body" })
    };
  }

  const radiusMeters = Math.round(radiusMiles * 1609.34);

  try {
    // Google Places Nearby Search — type: supermarket covers most grocery chains
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radiusMeters);
    url.searchParams.set("type", "supermarket");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Google Places error: ${data.status}`, detail: data.error_message })
      };
    }

    // Also search for "grocery_or_supermarket" to catch more stores
    const url2 = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url2.searchParams.set("location", `${lat},${lng}`);
    url2.searchParams.set("radius", radiusMeters);
    url2.searchParams.set("type", "grocery_or_supermarket");
    url2.searchParams.set("key", apiKey);

    const res2 = await fetch(url2.toString());
    const data2 = await res2.json();

    // Merge results, deduplicate by place_id
    const allResults = [...(data.results || []), ...(data2.results || [])];
    const seen = new Set();
    const merged = allResults.filter(p => {
      if (seen.has(p.place_id)) return false;
      seen.add(p.place_id);
      return true;
    });

    // Filter to recognizable grocery stores and format response
    const stores = merged
      .filter(place => {
        const name = place.name.toLowerCase();
        // Must be open or have no hours data (permanently closed excluded)
        if (place.permanently_closed) return false;
        // Check if it's a recognizable grocery store
        const isGrocery = GROCERY_KEYWORDS.some(k => name.includes(k)) ||
          (place.types || []).some(t => 
            t === "supermarket" || t === "grocery_or_supermarket" || t === "food"
          );
        return isGrocery;
      })
      .map(place => {
        // Calculate distance in miles (Haversine)
        const dLat = (place.geometry.location.lat - lat) * Math.PI / 180;
        const dLng = (place.geometry.location.lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 +
          Math.cos(lat * Math.PI/180) * Math.cos(place.geometry.location.lat * Math.PI/180) *
          Math.sin(dLng/2)**2;
        const distance = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return {
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || "",
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          distance: Math.round(distance * 10) / 10,
          emoji: chainEmoji(place.name),
          rating: place.rating || null,
          open: place.opening_hours?.open_now ?? null,
        };
      })
      .filter(s => s.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15); // cap at 15 results

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ stores })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
