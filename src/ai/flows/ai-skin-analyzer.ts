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
  analysis: z.string().describe("A detailed dermatological analysis of what is visible in the photo. Describe color, texture, shape, and distribution objectively. Use clear, descriptive language."),
  possibleConditions: z.string().describe('A numbered list of possible, general dermatological conditions that could match the visual evidence. Phrase carefully, for example: "1. Condition X: ...", "2. Condition Y: ...".'),
  recommendations: z.string().describe('A list of suggested next steps and safe, general at-home care advice. This must include a prominent disclaimer to consult a professional for an accurate diagnosis.'),
});
export type AISkinAnalyzerOutput = z.infer<typeof AISkinAnalyzerOutputSchema>;

export async function aiSkinAnalyzer(input: AISkinAnalyzerInput): Promise<AISkinAnalyzerOutput> {
  return aiSkinAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSkinAnalyzerPrompt',
  input: {schema: AISkinAnalyzerInputSchema},
  output: {schema: AISkinAnalyzerOutputSchema},
  prompt: `You are Anshu, an AI dermatology assistant. Your role is to analyze a user-provided photo of a skin condition and provide a helpful, structured, and informational (but non-diagnostic) response.

  Photo: {{media url=photoDataUri}}
  
  Based on the visual information in the photo, perform the following three tasks and structure your output accordingly:
  1.  **Detailed Analysis**: Provide a detailed, objective description of what you see. Mention dermatological characteristics like color (e.g., erythematous, hyperpigmented), texture (e.g., scaly, smooth), shape (e.g., annular, linear), and distribution if visible.
  2.  **Possible Conditions**: List 2-3 potential, general categories of skin conditions that might present this way. Do not state the user *has* a condition. Use phrases like "This could potentially be related to..." or "Conditions with a similar appearance include...".
  3.  **Recommendations**: Provide general, safe, at-home care advice (e.g., 'keep the area clean and dry,' 'avoid harsh soaps').
  
  CRITICAL: Conclude your recommendations with a clear, bold disclaimer in its own paragraph: "**DISCLAIMER: I am an AI assistant, not a medical professional. This analysis is for informational purposes only and is not a substitute for a diagnosis from a qualified dermatologist. Please consult a doctor for accurate diagnosis and treatment.**"
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
