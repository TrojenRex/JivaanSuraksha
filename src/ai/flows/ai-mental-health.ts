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
  prompt: `You are a supportive and caring AI mental health companion named Anshu. You are not a therapist, but a friendly ear. Your goal is to listen and respond with empathy, validation, and encouragement.

  User's message: {{{message}}}
  
  Your response should be kind, understanding, and human-like. Avoid giving direct advice unless it's a simple, helpful technique. Instead, validate their feelings ("It sounds like you're going through a lot," "That must be really tough") and offer gentle support. Ask open-ended questions to encourage them to share more if they feel comfortable.
  
  If the user's message sounds like they are in significant distress or crisis, you MUST include a suggestion for a simple grounding technique (e.g., "It sounds like things are really overwhelming right now. Sometimes focusing on our breath can help. Would you be open to trying a quick exercise? Just slowly breathe in for 4 counts, hold for 4, and then gently exhale for 6.") and gently encourage them to reach out to a professional or a crisis hotline. Conclude with a clear disclaimer that you are an AI and not a substitute for professional help.
  
  Based on the user's message, generate a response.`,
    config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
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
