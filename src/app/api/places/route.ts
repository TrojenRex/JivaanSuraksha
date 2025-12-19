'use server';

import {NextRequest, NextResponse} from 'next/server';

async function getCoordsFromPincode(pincode: string, apiKey: string) {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;
    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error(`Could not geocode pincode. Status: ${data.status}. ${data.error_message || ''}`);
        }
        const location = data.results[0].geometry.location;
        const userLat = data.results[0].geometry.location.lat;
        const userLon = data.results[0].geometry.location.lng;

        // Check if the result is in India for pincodes
        const isIndia = data.results[0].address_components.some((c: any) => c.short_name === 'IN');
        if (!isIndia) {
            throw new Error("Pincode does not appear to be in India. Please enter a valid Indian pincode.");
        }

        return { lat: location.lat, lon: location.lng, userLat, userLon };
    } catch (error) {
        console.error('Error in geocoding:', error);
        throw new Error("Failed to convert pincode to location. Please check the pincode or try again.");
    }
}


export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  let lat = searchParams.get('lat');
  let lon = searchParams.get('lon');
  const pincode = searchParams.get('pincode');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is missing.');
    return NextResponse.json(
      {error: 'API configuration error. A Google Maps API key is required.'},
      {status: 500}
    );
  }

  let userLat : number | null = lat ? Number(lat) : null;
  let userLon : number | null = lon ? Number(lon) : null;

  try {
     if (pincode) {
        const coords = await getCoordsFromPincode(pincode, apiKey);
        lat = coords.lat.toString();
        lon = coords.lon.toString();
        userLat = coords.userLat;
        userLon = coords.userLon;
    }

    if (!lat || !lon || userLat === null || userLon === null) {
        return NextResponse.json(
        {error: 'Location (latitude and longitude or pincode) is required.'},
        {status: 400}
        );
    }
  
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=hospital&key=${apiKey}`;

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

    const places = data.results.map((place: any) => {
        const distance = calculateDistance(userLat as number, userLon as number, place.geometry.location.lat, place.geometry.location.lng);
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
  } catch (error: any) {
    console.error('Error fetching from Google Places API:', error);
    // Return a more specific error message if it's one of our thrown errors
     if (error.message.includes("pincode")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
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
