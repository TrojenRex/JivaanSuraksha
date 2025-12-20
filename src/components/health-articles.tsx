'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Loader2, RefreshCw, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getHealthArticle, getHealthTopics } from '@/app/actions';
import type { AIHealthArticleOutput } from '@/ai/flows/ai-health-articles';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Skeleton } from './ui/skeleton';

type ArticleCache = {
  [key: string]: AIHealthArticleOutput | 'loading' | 'error';
};

export default function HealthArticles() {
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [articleCache, setArticleCache] = useState<ArticleCache>({});
  const { toast } = useToast();

  const fetchTopics = useCallback(async () => {
    setIsTopicsLoading(true);
    setError(null);
    setTopics([]);
    setArticleCache({});

    const result = await getHealthTopics();

    if (result.success && result.data) {
      setTopics(result.data.topics);
    } else {
      const errorMessage = result.error || "Failed to load health topics. Please try again.";
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
    setIsTopicsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleTopicSelect = async (topic: string) => {
    if (articleCache[topic] && articleCache[topic] !== 'error') {
      return; // Already loaded or loading, do nothing
    }

    setArticleCache(prev => ({ ...prev, [topic]: 'loading' }));

    const result = await getHealthArticle({ topic });

    if (result.success && result.data) {
      setArticleCache(prev => ({ ...prev, [topic]: result.data }));
    } else {
      setArticleCache(prev => ({ ...prev, [topic]: 'error' }));
      toast({
        variant: 'destructive',
        title: `Failed to load article`,
        description: result.error || `Could not load the article for "${topic}".`,
      });
    }
  };

  const renderArticleContent = (topic: string) => {
    const article = articleCache[topic];
    if (article === 'loading') {
      return (
        <div className="space-y-4 py-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      );
    }
    if (article === 'error') {
      return (
        <p className="text-destructive text-sm py-4">
          Sorry, this article could not be loaded. Please try again.
        </p>
      );
    }
    if (typeof article === 'object') {
      return (
        <article className="prose prose-sm dark:prose-invert max-w-none text-left pt-2">
          <p className="whitespace-pre-wrap">{article.article}</p>
        </article>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="items-center text-center">
        <Newspaper className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">Health Articles</CardTitle>
        <CardDescription>Explore AI-curated articles on wellness and health topics.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col justify-center">
        {isTopicsLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Generating interesting topics for you...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to Load Topics</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger
                  onClick={() => handleTopicSelect(topic)}
                  className="text-base font-semibold hover:no-underline"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Sparkles className="h-5 w-5 text-primary/70 flex-shrink-0" />
                    {topic}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{renderArticleContent(topic)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t pt-6">
        <Button onClick={fetchTopics} disabled={isTopicsLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isTopicsLoading ? 'animate-spin' : ''}`} />
          {isTopicsLoading ? 'Loading...' : 'Load New Topics'}
        </Button>
      </CardFooter>
    </Card>
  );
}
