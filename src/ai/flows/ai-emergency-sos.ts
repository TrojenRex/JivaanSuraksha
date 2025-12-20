'use server';

/**
 * @fileOverview An AI that drafts an SOS message.
 *
 * - aiEmergencySOS - A function that drafts an emergency message.
 * - AIEmergencySOSInput - The input type for the function.
 * - AIEmergencySOSOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIEmergencySOSInputSchema = z.object({
  location: z.string().describe("The user's current location or a maps link."),
});
export type AIEmergencySOSInput = z.infer<typeof AIEmergencySOSInputSchema>;

const AIEmergencySOSOutputSchema = z.object({
  message: z.string().describe('A pre-written SMS message to be sent to emergency contacts.'),
});
export type AIEmergencySOSOutput = z.infer<typeof AIEmergencySOSOutputSchema>;

export async function aiEmergencySOS(input: AIEmergencySOSInput): Promise<AIEmergencySOSOutput> {
  return aiEmergencySOSFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiEmergencySOSPrompt',
  input: {schema: AIEmergencySOSInputSchema},
  output: {schema: AIEmergencySOSOutputSchema},
  prompt: `You are an emergency response assistant. A user has triggered an SOS alert from an app called "Jivaan Suraksha".
  
  Their location is: {{{location}}}

  Draft a clear, concise, and urgent SMS message that can be sent to their emergency contacts. The message MUST:
  1. State that this is an emergency alert.
  2. Mention the user's location clearly.
  3. Be under 160 characters.
  
  Example: "EMERGENCY ALERT from Jivaan Suraksha. I am in danger and need help. My current location is: [Location]. Please contact me or send help immediately."
  
  Now, generate the message for the given location.`,
});

const aiEmergencySOSFlow = ai.defineFlow(
  {
    name: 'aiEmergencySOSFlow',
    inputSchema: AIEmergencySOSInputSchema,
    outputSchema: AIEmergencySOSOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
