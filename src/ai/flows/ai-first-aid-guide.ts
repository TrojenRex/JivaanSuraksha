'use server';

/**
 * @fileOverview An AI that provides first-aid instructions.
 *
 * - aiFirstAidGuide - A function that provides first-aid steps.
 * - AIFirstAidGuideInput - The input type for the aiFirstAidGuide function.
 * - AIFirstAidGuideOutput - The return type for the aiFirstAidGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIFirstAidGuideInputSchema = z.object({
  emergency: z.string().describe('The type of first-aid emergency (e.g., "minor burn", "bee sting", "sprained ankle").'),
});
export type AIFirstAidGuideInput = z.infer<typeof AIFirstAidGuideInputSchema>;

const AIFirstAidGuideOutputSchema = z.object({
  steps: z.string().describe('A clear, numbered, step-by-step guide for what to do. Use simple language.'),
  whenToSeeDoctor: z.string().describe('A list of symptoms or situations that indicate when to seek professional medical help.'),
});
export type AIFirstAidGuideOutput = z.infer<typeof AIFirstAidGuideOutputSchema>;

export async function aiFirstAidGuide(input: AIFirstAidGuideInput): Promise<AIFirstAidGuideOutput> {
  return aiFirstAidGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFirstAidGuidePrompt',
  input: {schema: AIFirstAidGuideInputSchema},
  output: {schema: AIFirstAidGuideOutputSchema},
  prompt: `You are an AI first-aid assistant. A user needs immediate instructions for a specific situation.

  Emergency: {{{emergency}}}
  
  Provide a simple, clear, step-by-step guide on how to handle this situation. Also, provide a section explaining when it's crucial to see a doctor.
  
  Structure your response clearly. Start with the immediate steps.
  
  CRITICAL: Begin the entire response with a disclaimer: "DISCLAIMER: This is for informational purposes only. For severe injuries or emergencies, call your local emergency number immediately. This is not a substitute for professional medical advice."`,
});

const aiFirstAidGuideFlow = ai.defineFlow(
  {
    name: 'aiFirstAidGuideFlow',
    inputSchema: AIFirstAidGuideInputSchema,
    outputSchema: AIFirstAidGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
