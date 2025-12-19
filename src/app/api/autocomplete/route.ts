'use server';

import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const input = searchParams.get('input');

  if (!input) {
    return NextResponse.json(
      {error: 'Input text is required.'},
      {status: 400}
    );
  }

  try {
    const autocompleteUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5`;
    const autocompleteResponse = await fetch(autocompleteUrl, {
      headers: {
        'User-Agent': 'JivaanSuraksha/1.0 (Firebase Studio App)',
      }
    });

    if (!autocompleteResponse.ok) {
        throw new Error('Failed to fetch autocomplete suggestions from OpenStreetMap');
    }

    const autocompleteData = await autocompleteResponse.json();
    
    const predictions = autocompleteData.map((item: any) => ({
      description: item.display_name,
      place_id: item.place_id,
    }));

    return NextResponse.json({suggestions: predictions});
  } catch (error: any) {
    console.error('Error in GET /api/autocomplete:', error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
