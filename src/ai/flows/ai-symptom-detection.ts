'use server';

/**
 * @fileOverview An AI chatbot that detects symptoms and suggests possible diseases and cures.
 *
 * - aiSymptomDetection - A function that handles the symptom detection process.
 * - AISymptomDetectionInput - The input type for the aiSymptomDetection function.
 * - AISymptomDetectionOutput - The return type for the aiSymptomDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISymptomDetectionInputSchema = z.object({
  symptoms: z
    .string()
    .describe(
      'A description of symptoms the user is experiencing.'
    ),
});
export type AISymptomDetectionInput = z.infer<typeof AISymptomDetectionInputSchema>;

const AISymptomDetectionOutputSchema = z.object({
  possibleDiseases: z.string().describe('A list of possible diseases.'),
  suggestedCures: z.string().describe('A list of suggested cures.'),
});
export type AISymptomDetectionOutput = z.infer<typeof AISymptomDetectionOutputSchema>;

export async function aiSymptomDetection(input: AISymptomDetectionInput): Promise<AISymptomDetectionOutput> {
  return aiSymptomDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomDetectionPrompt',
  input: {schema: AISymptomDetectionInputSchema},
  output: {schema: AISymptomDetectionOutputSchema},
  prompt: `You are a helpful AI chatbot that takes a user's symptoms and returns a list of possible diseases and suggested cures.

  Symptoms: {{{symptoms}}}
  `,
});

const aiSymptomDetectionFlow = ai.defineFlow(
  {
    name: 'aiSymptomDetectionFlow',
    inputSchema: AISymptomDetectionInputSchema,
    outputSchema: AISymptomDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
