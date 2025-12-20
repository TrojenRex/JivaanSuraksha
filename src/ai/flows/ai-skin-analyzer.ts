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
  analysis: z.string().describe("A detailed analysis of the skin condition seen in the photo. Be descriptive and clear."),
  possibleConditions: z.string().describe('A comma-separated list of possible skin conditions (e.g., Eczema, Psoriasis, Acne). List at least 2-3 possibilities if appropriate.'),
  recommendations: z.string().describe('Suggested next steps and basic at-home care recommendations. This must include a strong disclaimer to see a doctor for a real diagnosis.'),
});
export type AISkinAnalyzerOutput = z.infer<typeof AISkinAnalyzerOutputSchema>;

export async function aiSkinAnalyzer(input: AISkinAnalyzerInput): Promise<AISkinAnalyzerOutput> {
  return aiSkinAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSkinAnalyzerPrompt',
  input: {schema: AISkinAnalyzerInputSchema},
  output: {schema: AISkinAnalyzerOutputSchema},
  prompt: `You are an AI dermatology assistant. Your role is to analyze a user-provided photo of a skin condition and give a helpful, informational, but non-diagnostic response.

  Photo: {{media url=photoDataUri}}
  
  Based on the visual information in the photo, perform the following three tasks:
  1.  **Detailed Analysis**: Describe what you see in the image in a neutral, objective way. Mention things like color, texture, shape, and distribution if visible.
  2.  **Possible Conditions**: List 2-3 potential, general categories of skin conditions that might match the visual evidence. Do not state that the user *has* a condition. Use phrases like "This could potentially be related to..." or "Conditions that can look like this include...".
  3.  **Recommendations**: Provide general, safe, at-home care advice that might help with generic skin irritation (e.g., 'keep the area clean and dry,' 'avoid harsh soaps').
  
  CRITICAL: Conclude your recommendations with a clear, bold disclaimer in its own paragraph: "**DISCLAIMER: This is an AI analysis and not a medical diagnosis. It is for informational purposes only. Please consult a qualified dermatologist or healthcare professional for an accurate diagnosis and treatment plan.**"
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
