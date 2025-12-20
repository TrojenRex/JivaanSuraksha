'use server';

/**
 * @fileOverview An AI chatbot for mental health support.
 *
 * - aiMentalHealthCompanion - A function that responds to a user's message.
 * - AIMentalHealthCompanionInput - The input type for the function.
 * - AIMentalHealthCompanionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMentalHealthCompanionInputSchema = z.object({
  message: z.string().describe("The user's message or feeling."),
});
export type AIMentalHealthCompanionInput = z.infer<typeof AIMentalHealthCompanionInputSchema>;

const AIMentalHealthCompanionOutputSchema = z.object({
  response: z.string().describe('A supportive, empathetic, and non-judgmental response. If the user expresses distress, suggest a simple grounding exercise (like deep breathing) and gently recommend talking to a friend, family member, or mental health professional.'),
});
export type AIMentalHealthCompanionOutput = z.infer<typeof AIMentalHealthCompanionOutputSchema>;

export async function aiMentalHealthCompanion(input: AIMentalHealthCompanionInput): Promise<AIMentalHealthCompanionOutput> {
  return aiMentalHealthCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentalHealthCompanionPrompt',
  input: {schema: AIMentalHealthCompanionInputSchema},
  output: {schema: AIMentalHealthCompanionOutputSchema},
  prompt: `You are a supportive and caring AI mental health companion. You are not a therapist, but a friendly ear. Your goal is to listen and respond with empathy and encouragement.

  User's message: {{{message}}}
  
  Your response should be kind and understanding. Avoid giving direct advice. Instead, validate their feelings and offer gentle support. 
  
  If the user's message sounds like they are in significant distress, you MUST include a suggestion for a simple grounding technique (e.g., "Have you tried taking a few slow, deep breaths? Inhale for 4 counts, hold for 4, and exhale for 6. Let's do a few together.") and gently encourage them to reach out to a professional or a crisis hotline. Include a disclaimer that you are an AI and not a substitute for professional help.`,
});

const aiMentalHealthCompanionFlow = ai.defineFlow(
  {
    name: 'aiMentalHealthCompanionFlow',
    inputSchema: AIMentalHealthCompanionInputSchema,
    outputSchema: AIMentalHealthCompanionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
