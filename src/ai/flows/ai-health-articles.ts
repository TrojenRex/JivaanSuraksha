'use server';

/**
 * @fileOverview An AI that generates a short health article.
 *
 * - aiHealthArticle - A function that generates an article on a topic.
 * - AIHealthArticleInput - The input type for the function.
 * - AIHealthArticleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIHealthArticleInputSchema = z.object({
  topic: z.string().describe('The health topic for the article (e.g., "Benefits of Hydration", "Managing Stress").'),
});
export type AIHealthArticleInput = z.infer<typeof AIHealthArticleInputSchema>;

const AIHealthArticleOutputSchema = z.object({
  title: z.string().describe("A catchy title for the article."),
  article: z.string().describe('A short, easy-to-read article (3-4 paragraphs) on the topic. Use simple language.'),
});
export type AIHealthArticleOutput = z.infer<typeof AIHealthArticleOutputSchema>;

export async function aiHealthArticle(input: AIHealthArticleInput): Promise<AIHealthArticleOutput> {
  return aiHealthArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHealthArticlePrompt',
  input: {schema: AIHealthArticleInputSchema},
  output: {schema: AIHealthArticleOutputSchema},
  prompt: `You are an AI health writer. Your task is to generate a short, informative, and engaging article on a given health topic.

  Topic: {{{topic}}}
  
  Write a brief article (3-4 paragraphs) that is easy for a general audience to understand. Start with a catchy title.
  
  IMPORTANT: End the article with a disclaimer: "This article is for informational purposes only and does not constitute medical advice. Consult with a healthcare professional for any health concerns."`,
});

const aiHealthArticleFlow = ai.defineFlow(
  {
    name: 'aiHealthArticleFlow',
    inputSchema: AIHealthArticleInputSchema,
    outputSchema: AIHealthArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
