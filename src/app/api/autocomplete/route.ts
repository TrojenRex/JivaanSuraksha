'use server';

import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const input = searchParams.get('input');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is missing.');
    return NextResponse.json(
      {error: 'API configuration error.'},
      {status: 500}
    );
  }

  if (!input) {
    return NextResponse.json(
      {error: 'Input text is required.'},
      {status: 400}
    );
  }

  try {
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();

    if (autocompleteData.status !== 'OK') {
        if (autocompleteData.status === 'REQUEST_DENIED') {
            return NextResponse.json(
                {error: 'The Google Places Autocomplete API request was denied. Please ensure it is enabled in your Google Cloud project.'},
                {status: 403}
            );
        }
      throw new Error(`Failed to fetch autocomplete suggestions: ${autocompleteData.status}`);
    }

    return NextResponse.json({suggestions: autocompleteData.predictions});
  } catch (error: any) {
    console.error('Error in GET /api/autocomplete:', error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
