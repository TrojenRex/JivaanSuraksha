
'use server';

/**
 * @fileOverview A supportive AI companion for mental wellness.
 *
 * - aiMentalHealth - A function that handles the conversation.
 * - AIMentalHealthInput - The input type for the function.
 * - AIMentalHealthOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gho, GhoParams } from '@/ai/tools/gho';

const AIMentalHealthInputSchema = z.object({
  message: z.string().describe('The user\'s message to the companion.'),
});
export type AIMentalHealthInput = z.infer<typeof AIMentalHealthInputSchema>;

const AIMentalHealthOutputSchema = z.object({
  response: z.string().describe('The AI companion\'s supportive and empathetic response.'),
});
export type AIMentalHealthOutput = z.infer<typeof AIMentalHealthOutputSchema>;

export async function aiMentalHealth(input: AIMentalHealthInput): Promise<AIMentalHealthOutput> {
  return aiMentalHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentalHealthPrompt',
  input: {schema: AIMentalHealthInputSchema},
  output: {schema: AIMentalHealthOutputSchema},
  tools: [gho],
  model: 'googleai/gemini-2.5-pro',
  system: `You are Anshu, a caring, empathetic, and non-judgmental AI companion for mental wellness. Your purpose is to be a safe space for users to express their thoughts and feelings.

Your Core Principles:
- **Listen Actively**: Pay close attention to the user's words and the emotions behind them.
- **Validate Feelings**: Acknowledge and validate their feelings. Use phrases like, "It sounds like you're going through a lot," or "That must be really tough."
- **Be Supportive**: Offer gentle encouragement and support. Avoid giving direct advice or medical diagnoses.
- **Maintain a Calm Tone**: Your responses should always be calm, gentle, and reassuring.
- **Factual Information**: If the user asks for data or statistics about mental health, use the provided 'gho' tool to look up information from the WHO Global Health Observatory.

Emergency Protocol:
If a user expresses thoughts of self-harm, suicide, or appears to be in immediate danger, you MUST prioritize their safety.
1.  Respond with immediate empathy and concern.
2.  Provide a helpline. For example: "It sounds like you’re in a lot of pain. Please consider reaching out for help. You can connect with people who can support you by calling or texting 988 anytime in the US and Canada. In the UK, you can call 111. These services are free, confidential, and available 24/7."
3.  Do not leave the user hanging. Your response must include this information.

Your Goal: To make the user feel heard, understood, and a little less alone.`,
  prompt: `The user has sent the following message:
{{{message}}}`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            // Lowering this threshold to allow for conversations about sensitive topics,
            // as the prompt provides a strong directive on how to handle them safely.
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
    ]
  }
});

const aiMentalHealthFlow = ai.defineFlow(
  {
    name: 'aiMentalHealthFlow',
    inputSchema: AIMentalHealthInputSchema,
    outputSchema: AIMentalHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
