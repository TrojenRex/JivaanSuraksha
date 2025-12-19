'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

export default function MedicalNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news. Please try again later.');
        }
        const data = await response.json();
        setArticles(data.articles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Daily Medical News</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-64 text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">An error occurred</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col backdrop-blur-sm bg-card/80 border-2">
              <CardHeader>
                <div className="relative w-full h-40 mb-4 rounded-t-lg overflow-hidden">
                  <Image
                    src={article.urlToImage}
                    alt={article.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint="medical news"
                  />
                </div>
                <CardTitle className="text-lg font-bold leading-tight">{article.title}</CardTitle>
                <CardDescription className="text-xs pt-1">
                  {article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{article.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link href={article.url} target="_blank" rel="noopener noreferrer">
                    Read more
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
