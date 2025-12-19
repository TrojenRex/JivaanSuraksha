'use server';

import { NextResponse } from 'next/server';

const mockNewsData = {
  status: 'ok',
  totalResults: 5,
  articles: [
    {
      source: {
        id: null,
        name: 'ScienceDaily',
      },
      author: null,
      title: 'New study reveals how gut bacteria can affect mental health',
      description:
        'Researchers have discovered a direct link between the composition of gut microbiota and mood regulation, opening new possibilities for treating depression and anxiety through probiotic therapies.',
      url: 'https://www.sciencedaily.com/releases/2023/10/231025123456.htm',
      urlToImage: 'https://picsum.photos/seed/mednews1/600/400',
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      content:
        'A groundbreaking study has provided compelling evidence that the trillions of bacteria residing in our gut can have a significant impact on our mental state. The findings suggest that certain bacterial strains can produce neuroactive compounds...',
    },
    {
      source: {
        id: 'medical-new-today',
        name: 'Medical News Today',
      },
      author: 'John Doe',
      title: 'Breakthrough in Water Purification Technology for Remote Areas',
      description:
        'A new, low-cost water filter has been developed that can remove over 99.9% of pathogens, including those causing cholera and typhoid, offering a new hope for providing safe drinking water in developing nations.',
      url: 'https://www.medicalnewstoday.com/articles/breakthrough-water-purification',
      urlToImage: 'https://picsum.photos/seed/mednews2/600/400',
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      content:
        'Access to clean drinking water remains a major global challenge. This new filter, made from readily available materials, uses a novel nano-coating to trap and neutralize harmful microorganisms...',
    },
    {
      source: {
        id: null,
        name: 'WHO News',
      },
      author: 'World Health Organization',
      title: 'WHO releases new guidelines for preventing waterborne diseases',
      description:
        'The World Health Organization has issued updated recommendations for governments and healthcare providers on the prevention, surveillance, and control of diseases like cholera, dysentery, and typhoid.',
      url: 'https://www.who.int/news/item/new-guidelines-for-waterborne-diseases',
      urlToImage: 'https://picsum.photos/seed/mednews3/600/400',
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      content:
        'The new guidelines emphasize the importance of integrated strategies, including improved water sanitation and hygiene (WASH), early detection systems, and rapid response protocols to manage outbreaks effectively...',
    },
    {
      source: {
        id: null,
        name: 'Nature Medicine',
      },
      author: 'Dr. Emily Carter',
      title: 'AI model accurately predicts water contamination events',
      description:
        'Scientists have trained an artificial intelligence model that can predict the risk of water source contamination with high accuracy by analyzing satellite imagery and environmental data.',
      url: 'https://www.nature.com/nm/articles/s41591-023-01234-5',
      urlToImage: 'https://picsum.photos/seed/mednews4/600/400',
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
      content:
        'The AI system leverages deep learning to identify patterns that precede contamination events, such as changes in land use, rainfall patterns, and industrial activity. This could allow for proactive public health interventions...',
    },
    {
      source: {
        id: 'the-lancet',
        name: 'The Lancet',
      },
      author: 'Prof. David Chen',
      title: 'Long-term health effects of low-level exposure to contaminated water',
      description:
        'A 20-year longitudinal study has revealed surprising long-term health consequences, including increased risks of certain cancers and autoimmune disorders, from chronic exposure to low levels of common water contaminants.',
      url: 'https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(23)00123-4/fulltext',
      urlToImage: 'https://picsum.photos/seed/mednews5/600/400',
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      content:
        'This extensive research highlights the need for stricter regulations on drinking water quality and continuous monitoring, as even contaminants below current legal limits may pose a significant health risk over time...',
    },
  ],
};

export async function GET() {
  // In a real application, you would fetch this data from a news API.
  // For this example, we are returning mock data.
  // You would need an API key for a service like NewsAPI.org and use it here.
  // Example: const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=health&apiKey=YOUR_API_KEY`);
  return NextResponse.json(mockNewsData);
}
