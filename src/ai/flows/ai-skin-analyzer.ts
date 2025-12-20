'use server';

/**
 * @fileOverview An AI that analyzes skin conditions from an image.
 *
 * - aiSkinAnalyzer - A function that handles the skin analysis process.
 * - AISkinAnalyzerInput - The input type for the aiSkinAnalyzer function.
 * - AISkinAnalyzerOutput - The return type for the aiSkinAnalyzer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISkinAnalyzerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe("A photo of the skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AISkinAnalyzerInput = z.infer<typeof AISkinAnalyzerInputSchema>;

const AISkinAnalyzerOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the skin condition seen in the photo."),
  possibleConditions: z.string().describe('A list of possible skin conditions (e.g., Eczema, Psoriasis, Acne).'),
  recommendations: z.string().describe('Suggested next steps and care recommendations. Include a strong disclaimer to see a doctor.'),
});
export type AISkinAnalyzerOutput = z.infer<typeof AISkinAnalyzerOutputSchema>;

export async function aiSkinAnalyzer(input: AISkinAnalyzerInput): Promise<AISkinAnalyzerOutput> {
  return aiSkinAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSkinAnalyzerPrompt',
  input: {schema: AISkinAnalyzerInputSchema},
  output: {schema: AISkinAnalyzerOutputSchema},
  prompt: `You are an AI dermatology assistant. Analyze the provided photo of a skin condition.

  Photo: {{media url=photoDataUri}}
  
  Based on the visual information, provide a detailed analysis, identify possible conditions, and suggest immediate care recommendations.
  
  IMPORTANT: Conclude your recommendations with a clear, bold disclaimer: "This is an AI analysis and not a medical diagnosis. Please consult a qualified dermatologist for an accurate diagnosis and treatment plan."
  `,
});

const aiSkinAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiSkinAnalyzerFlow',
    inputSchema: AISkinAnalyzerInputSchema,
    outputSchema: AISkinAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
