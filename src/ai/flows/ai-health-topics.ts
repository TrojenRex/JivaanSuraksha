'use server';

/**
 * @fileOverview An AI that generates a list of health topics.
 *
 * - aiHealthTopics - A function that generates a list of topics.
 * - AIHealthTopicsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIHealthTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe("An array of 5-7 interesting and varied health topics."),
});
export type AIHealthTopicsOutput = z.infer<typeof AIHealthTopicsOutputSchema>;

export async function aiHealthTopics(): Promise<AIHealthTopicsOutput> {
  return aiHealthTopicsFlow();
}

const prompt = ai.definePrompt({
  name: 'aiHealthTopicsPrompt',
  output: {schema: AIHealthTopicsOutputSchema},
  prompt: `You are an AI health content curator. Your task is to generate a list of 5 to 7 engaging and diverse health and wellness topics for a general audience.
  
  The topics should be interesting and cover a range of subjects like nutrition, exercise, mental health, preventative care, and common conditions.
  
  Examples:
  - "The Surprising Benefits of a 10-Minute Walk"
  - "Understanding Your Gut Microbiome"
  - "How to Create a Healthy Sleep Routine"
  - "Simple Mindfulness Exercises for Stress Relief"
  - "The Link Between Hydration and Brain Function"
  
  Now, generate a new list of 5-7 topics.`,
});

const aiHealthTopicsFlow = ai.defineFlow(
  {
    name: 'aiHealthTopicsFlow',
    outputSchema: AIHealthTopicsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
