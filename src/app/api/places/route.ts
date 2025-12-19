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
      console.error('Google Places API Error:', data.error_message || data.status);
      if (data.status === 'REQUEST_DENIED') {
        return NextResponse.json(
            {error: 'The Google Places API request was denied. This is often because the "Places API" is not enabled in your Google Cloud project. Please ensure it is enabled.'},
            {status: 500}
        );
      }
      return NextResponse.json(
        {error: `Failed to fetch places: ${data.status}`},
        {status: 500}
      );
    }
    
    const placesPromises = data.results.slice(0, 10).map(async (place: any) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,geometry&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        
        if (detailsData.status !== 'OK') {
            return null;
        }

        const detailsResult = detailsData.result;
        
        // Calculate distance (simplified)
        const distance = calculateDistance(Number(lat), Number(lon), detailsResult.geometry.location.lat, detailsResult.geometry.location.lng);

        return {
            id: place.place_id,
            name: detailsResult.name,
            address: detailsResult.formatted_address,
            phone: detailsResult.formatted_phone_number || 'N/A',
            distance: `${distance.toFixed(1)} miles`,
            location: detailsResult.geometry.location,
        };
    });

    const placesWithDetails = (await Promise.all(placesPromises)).filter(p => p !== null);

    // Sort by distance
    placesWithDetails.sort((a,b) => parseFloat(a!.distance) - parseFloat(b!.distance));
    
    let mapUrl = null;
    if (placesWithDetails.length > 0) {
      const markers = placesWithDetails.map((p, index) => `markers=color:red|label:${index+1}|${p!.location.lat},${p!.location.lng}`).join('&');
      const userMarker = `markers=color:blue|label:U|${lat},${lon}`;
      mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=roadmap&${userMarker}&${markers}&key=${apiKey}`;
    }

    return NextResponse.json({ clinics: placesWithDetails, mapUrl });
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
