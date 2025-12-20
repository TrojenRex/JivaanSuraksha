
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getHealthArticle } from '@/app/actions';
import type { AIHealthArticleOutput } from '@/ai/flows/ai-health-articles';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const healthTopics = [
    'Benefits of Hydration',
    'Managing Stress',
    'The Importance of Sleep',
    'Healthy Eating on a Budget',
    'Simple Exercises for a Strong Core',
    'Understanding Mental Health',
    'The Power of a Morning Routine',
    'Benefits of Walking Daily',
    'Tips for Better Posture',
    'Healthy Snacking Ideas',
];

const getRandomTopic = (currentTopic: string | null) => {
    let newTopic = currentTopic;
    while (newTopic === currentTopic) {
        newTopic = healthTopics[Math.floor(Math.random() * healthTopics.length)];
    }
    return newTopic;
}


export default function HealthArticles() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<AIHealthArticleOutput | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArticle = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic(topic);

    const result = await getHealthArticle({ topic });

    if (result.success && result.data) {
      setArticle(result.data);
    } else {
      setError(result.error || "Failed to generate the article. Please try again.");
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not load article.',
      });
    }
    setIsLoading(false);
  }, [toast]);
  
  useEffect(() => {
    fetchArticle(getRandomTopic(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchArticle]);

  const handleRefresh = () => {
    fetchArticle(getRandomTopic(currentTopic));
  }


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="items-center text-center">
        <Newspaper className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">Health Articles</CardTitle>
        <CardDescription>AI-curated articles on wellness and health topics.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Generating a fresh article for you...</p>
            </div>
        ) : error ? (
            <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Failed to Load Article</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        ) : article ? (
            <article className="prose prose-sm dark:prose-invert max-w-none text-left">
                <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
                <p className="whitespace-pre-wrap">{article.article}</p>
            </article>
        ) : null}
      </CardContent>
       <CardFooter className="justify-center border-t pt-6">
            <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Read Another Article'}
            </Button>
      </CardFooter>
    </Card>
  );
}
