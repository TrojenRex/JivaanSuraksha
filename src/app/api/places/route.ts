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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is missing.');
    return NextResponse.json(
      {error: 'API configuration error. A Google Maps API key is required.'},
      {status: 500}
    );
  }

  if (!locationQuery) {
    return NextResponse.json(
      {error: 'Location text is required.'},
      {status: 400}
    );
  }

  try {
    // 1. Geocode the user's location text to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
      throw new Error(`Could not find a location for "${locationQuery}". Please try a more specific location. Status: ${geocodeData.status}. ${geocodeData.error_message || ''}`);
    }
    
    const location = geocodeData.results[0].geometry.location;
    const userLat = location.lat;
    const userLon = location.lng;

    // 2. Use the coordinates to find nearby hospitals
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLat},${userLon}&radius=5000&type=hospital&key=${apiKey}`;
    const placesResponse = await fetch(nearbySearchUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK') {
      if (placesData.status === 'REQUEST_DENIED') {
        return NextResponse.json(
            {error: 'The Google Places API request was denied. This is often because the "Places API" is not enabled in your Google Cloud project. Please ensure it is enabled.'},
            {status: 403}
        );
      }
      throw new Error(`Failed to fetch places: ${placesData.status}`);
    }

    // 3. Process and sort the results
    const places = placesData.results.map((place: any) => {
        const distance = calculateDistance(userLat, userLon, place.geometry.location.lat, place.geometry.location.lng);
        return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            phone: 'N/A', // Details API would be needed for phone number
            distance: `${distance.toFixed(1)} miles`,
            location: place.geometry.location,
        };
    });

    places.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));
    const nearbyPlaces = places.slice(0, 10);
    
    // 4. Generate the map URL
    let mapUrl = null;
    if (nearbyPlaces.length > 0) {
      const markers = nearbyPlaces.map((p: any, index: number) => `markers=color:red|label:${index + 1}|${p.location.lat},${p.location.lng}`).join('&');
      const userMarker = `markers=color:blue|label:U|${userLat},${userLon}`;
      mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=roadmap&${userMarker}&${markers}&key=${apiKey}`;
    }

    return NextResponse.json({ clinics: nearbyPlaces, mapUrl });
  } catch (error: any) {
    console.error('Error in GET /api/places:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}