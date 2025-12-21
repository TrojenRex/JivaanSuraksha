'use server';

/**
 * @fileOverview An AI that generates a simple line drawing for a first-aid step.
 *
 * - aiFirstAidImageGenerator - A function that generates an image for a first-aid step.
 * - AIFirstAidImageGeneratorInput - The input type for the function.
 * - AIFirstAidImageGeneratorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const AIFirstAidImageGeneratorInputSchema = z.object({
  step: z.string().describe('A single step of first-aid instruction.'),
});
export type AIFirstAidImageGeneratorInput = z.infer<typeof AIFirstAidImageGeneratorInputSchema>;

const AIFirstAidImageGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe('A data URI of the generated image. Expected format: \'data:image/png;base64,<encoded_data>\'.'),
});
export type AIFirstAidImageGeneratorOutput = z.infer<typeof AIFirstAidImageGeneratorOutputSchema>;

export async function aiFirstAidImageGenerator(input: AIFirstAidImageGeneratorInput): Promise<AIFirstAidImageGeneratorOutput> {
  return aiFirstAidImageGeneratorFlow(input);
}

const aiFirstAidImageGeneratorFlow = ai.defineFlow(
  {
    name: 'aiFirstAidImageGeneratorFlow',
    inputSchema: AIFirstAidImageGeneratorInputSchema,
    outputSchema: AIFirstAidImageGeneratorOutputSchema,
  },
  async ({ step }) => {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate a very simple, minimalist, black and white line drawing icon that visually represents the following first-aid step. The background must be transparent. The drawing should be clear, easy to understand, and avoid any complex details or text. Focus on a single action or object.

      First-aid step: "${step}"`,
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
