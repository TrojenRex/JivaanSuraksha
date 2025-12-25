'use server';

/**
 * @fileOverview An AI flow that describes an image.
 *
 * - aiDescribeImage - A function that takes an image and returns a description.
 * - AIDescribeImageInput - The input type for the function.
 * - AIDescribeImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AIDescribeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe("A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AIDescribeImageInput = z.infer<typeof AIDescribeImageInputSchema>;

const AIDescribeImageOutputSchema = z.object({
  description: z.string().describe('A concise description of the image, focusing on any visible injuries or medical situations.'),
});
export type AIDescribeImageOutput = z.infer<typeof AIDescribeImageOutputSchema>;

export async function aiDescribeImage(input: AIDescribeImageInput): Promise<AIDescribeImageOutput> {
  return aiDescribeImageFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiDescribeImagePrompt',
    input: {schema: AIDescribeImageInputSchema},
    output: {schema: AIDescribeImageOutputSchema},
    prompt: `Analyze the following image and provide a short, factual description of what you see. If there is a visible injury or what appears to be a medical emergency, describe it clearly and concisely. Focus on the most critical information.

    Visual Input: {{media url=photoDataUri}}`,
    model: googleAI.model('gemini-2.5-flash'),
});


const aiDescribeImageFlow = ai.defineFlow(
  {
    name: 'aiDescribeImageFlow',
    inputSchema: AIDescribeImageInputSchema,
    outputSchema: AIDescribeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
