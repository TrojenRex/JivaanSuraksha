'use server';

import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json(
      {error: 'Latitude and longitude are required.'},
      {status: 400}
    );
  }

  if (!apiKey) {
    console.error('Google Maps API key is missing.');
    return NextResponse.json(
      {error: 'API configuration error. A Google Maps API key is required.'},
      {status: 500}
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=hospital&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('Google Places API Error:', data.status, data.error_message);
       if (data.status === 'REQUEST_DENIED') {
            return NextResponse.json(
                {error: 'The Google Places API request was denied. This is often because the "Places API" is not enabled in your Google Cloud project. Please ensure it is enabled.'},
                {status: 403}
            );
        }
      return NextResponse.json(
        {error: `Failed to fetch places: ${data.status}`},
        {status: 500}
      );
    }
    
    const userLat = Number(lat);
    const userLon = Number(lon);

    const places = data.results.map((place: any) => {
        const distance = calculateDistance(userLat, userLon, place.geometry.location.lat, place.geometry.location.lng);
        return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            phone: 'N/A', // Details API needed for phone number
            distance: `${distance.toFixed(1)} miles`,
            location: place.geometry.location,
        };
    });

    // Sort by distance
    places.sort((a:any, b:any) => parseFloat(a.distance) - parseFloat(b.distance));
    const nearbyPlaces = places.slice(0, 10);
    
    let mapUrl = null;
    if (nearbyPlaces.length > 0) {
      const markers = nearbyPlaces.map((p:any, index:number) => `markers=color:red|label:${index+1}|${p.location.lat},${p.location.lng}`).join('&');
      const userMarker = `markers=color:blue|label:U|${lat},${lon}`;
      mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=roadmap&${userMarker}&${markers}&key=${apiKey}`;
    }

    return NextResponse.json({ clinics: nearbyPlaces, mapUrl });
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}

// Haversine formula to calculate distance between two lat/lon points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959; // Radius of the Earth in miles
  const rlat1 = lat1 * (Math.PI/180); // Convert degrees to radians
  const rlat2 = lat2 * (Math.PI/180); // Convert degrees to radians
  const difflat = rlat2-rlat1; // Radian difference (latitudes)
  const difflon = (lon2-lon1) * (Math.PI/180); // Radian difference (longitudes)

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}
