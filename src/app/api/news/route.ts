'use server';

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error('News API key is missing.');
    return NextResponse.json(
      { error: 'API configuration error. A News API key is required.' },
      { status: 500 }
    );
  }

  const query = 'medical OR health OR disease OR hospital OR waterborne';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 3600, // Revalidate every hour
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('NewsAPI Error:', errorData.message || response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch news: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure images have a fallback if one is not provided.
    const articles = data.articles.map((article: any) => ({
      ...article,
      urlToImage: article.urlToImage || 'https://picsum.photos/seed/mednewsfallback/600/400',
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching news.' },
      { status: 500 }
    );
  }
}
