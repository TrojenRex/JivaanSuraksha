'use server';

import {NextRequest, NextResponse} from 'next/server';

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959; // Radius of the Earth in miles
  const rlat1 = lat1 * (Math.PI/180);
  const rlat2 = lat2 * (Math.PI/180);
  const difflat = rlat2 - rlat1;
  const difflon = (lon2-lon1) * (Math.PI/180);
  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

// Main GET handler
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const locationQuery = searchParams.get('location');

  if (!locationQuery) {
    return NextResponse.json(
      {error: 'Location text is required.'},
      {status: 400}
    );
  }

  try {
    // 1. Geocode the user's location text to get coordinates using OpenStreetMap Nominatim
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`;
    const geocodeResponse = await fetch(geocodeUrl, { 
      headers: { 'User-Agent': 'JivaanSuraksha/1.0 (Firebase Studio App)' } 
    });
    const geocodeData = await geocodeResponse.json();

    if (!geocodeResponse.ok || !geocodeData || geocodeData.length === 0) {
      return NextResponse.json(
        {error: `Could not find a location for "${locationQuery}". Please try a more specific location.`},
        {status: 404}
      );
    }
    
    const location = geocodeData[0];
    const userLat = parseFloat(location.lat);
    const userLon = parseFloat(location.lon);

    // 2. Use the coordinates to find nearby hospitals using OpenStreetMap Overpass API
    const radiusInMeters = 8046; // Approx 5 miles
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusInMeters},${userLat},${userLon});
        way["amenity"="hospital"](around:${radiusInMeters},${userLat},${userLon});
        relation["amenity"="hospital"](around:${radiusInMeters},${userLat},${userLon});
        node["amenity"="clinic"](around:${radiusInMeters},${userLat},${userLon});
        way["amenity"="clinic"](around:${radiusInMeters},${userLat},${userLon});
        relation["amenity"="clinic"](around:${radiusInMeters},${userLat},${userLon});
      );
      out center;
    `;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const placesResponse = await fetch(overpassUrl, {
        headers: { 'User-Agent': 'JivaanSuraksha/1.0 (Firebase Studio App)' } 
    });
    
    if (!placesResponse.ok) {
        const errorText = await placesResponse.text();
        console.error('Overpass API error:', errorText);
        return NextResponse.json({ error: 'why is this line comming' }, { status: 503 });
    }

    const placesData = await placesResponse.json();


    // 3. Process and sort the results
    const places = placesData.elements.map((place: any) => {
        const placeLat = place.lat || place.center?.lat;
        const placeLon = place.lon || place.center?.lon;
        const distance = calculateDistance(userLat, userLon, placeLat, placeLon);
        
        // Construct address from tags
        const tags = place.tags || {};
        const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ');

        return {
            id: place.id,
            name: tags.name || 'Unnamed Clinic/Hospital',
            address: address || 'Address not available',
            phone: tags.phone || tags['contact:phone'] || null,
            distance: `${distance.toFixed(1)} miles`,
            location: { lat: placeLat, lon: placeLon },
        };
    }).filter((place: any) => place.location.lat && place.location.lon);

    places.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));
    const nearbyPlaces = places.slice(0, 10);
    
    return NextResponse.json({ clinics: nearbyPlaces });
  } catch (error: any) {
    console.error('Error in GET /api/places:', error);
    return NextResponse.json({ error: "An unexpected error occurred while fetching nearby clinics. Please try again later." }, { status: 500 });
  }
}
