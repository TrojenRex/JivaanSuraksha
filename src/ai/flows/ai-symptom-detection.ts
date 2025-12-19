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
    .optional()
    .describe(
      'A description of symptoms the user is experiencing.'
    ),
  photoDataUri: z
    .string()
    .optional()
    .describe("A photo of the symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AISymptomDetectionInput = z.infer<typeof AISymptomDetectionInputSchema>;

const AISymptomDetectionOutputSchema = z.object({
  possibleDiseases: z.string().describe('A list of possible diseases based on the visual and/or textual symptoms. Be concise.'),
  suggestedCures: z.string().describe('A list of suggested actions or home remedies. Be concise.'),
});
export type AISymptomDetectionOutput = z.infer<typeof AISymptomDetectionOutputSchema>;

export async function aiSymptomDetection(input: AISymptomDetectionInput): Promise<AISymptomDetectionOutput> {
  return aiSymptomDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomDetectionPrompt',
  input: {schema: AISymptomDetectionInputSchema},
  output: {schema: AISymptomDetectionOutputSchema},
  prompt: `You are a helpful AI medical assistant. Your goal is to analyze the provided symptoms, which can be text-based, a visual from a photo, or both, and then provide a concise list of possible conditions and suggested actions.

  Analyze the user's input carefully.
  {{#if symptoms}}
  Textual Symptoms: {{{symptoms}}}
  {{/if}}
  {{#if photoDataUri}}
  Visual Symptom: {{media url=photoDataUri}}
  {{/if}}
  
  Based on your analysis, provide a brief list of possible diseases and another brief list of suggested cures or next steps. Prioritize accuracy but keep the response brief and easy to understand.
  `,
});

const aiSymptomDetectionFlow = ai.defineFlow(
  {
    name: 'aiSymptomDetectionFlow',
    inputSchema: AISymptomDetectionInputSchema,
    outputSchema: AISymptomDetectionOutputSchema,
  },
  async input => {
    if (!input.symptoms && !input.photoDataUri) {
        throw new Error('Either symptoms or a photo must be provided.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
