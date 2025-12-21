'use server';

/**
 * @fileOverview An AI that generates first-aid instructions for a given emergency.
 *
 * - aiFirstAid - A function that handles first-aid instruction generation.
 * - AIFirstAidInput - The input type for the aiFirstAid function.
 * - AIFirstAidOutput - The return type for the aiFirstAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { aiFirstAidImageGenerator } from './ai-first-aid-image-generator';

const AIFirstAidInputSchema = z.object({
  query: z.string().describe('The emergency or injury to get first-aid instructions for (e.g., "how to treat a jellyfish sting").'),
});
export type AIFirstAidInput = z.infer<typeof AIFirstAidInputSchema>;

const StepSchema = z.object({
  text: z.string().describe("A single, clear, step-by-step first-aid instruction for a layperson. Do not include step numbers."),
});

const AIFirstAidOutputSchema = z.object({
  title: z.string().describe('The official or common name for the emergency.'),
  steps: z.array(z.object({
    text: z.string(),
    imageUrl: z.string().optional(),
  })).describe("An array of objects, where each object contains the text for a step and an optional URL for a generated image illustrating the step."),
  whenToSeeDoctor: z.string().describe('A clear, concise list of signs or symptoms that indicate when to seek professional medical help.'),
});
export type AIFirstAidOutput = z.infer<typeof AIFirstAidOutputSchema>;

export async function aiFirstAid(input: AIFirstAidInput): Promise<AIFirstAidOutput> {
  return aiFirstAidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFirstAidPrompt',
  input: {schema: AIFirstAidInputSchema},
  output: {schema: z.object({
    title: z.string().describe('The official or common name for the emergency.'),
    steps: z.array(StepSchema).describe("An array of clear, step-by-step first-aid instructions for a layperson. Each step should be a separate item in the array. Do not include any warnings or disclaimers in this field."),
    whenToSeeDoctor: z.string().describe('A clear, concise list of signs or symptoms that indicate when to seek professional medical help.'),
  })},
  prompt: `You are an expert AI First-Aid Responder. A user is asking for immediate instructions for a medical emergency.

  User's query: {{{query}}}
  
  Your Task:
  1.  Identify the emergency from the user's query.
  2.  Provide a clear, simple, step-by-step guide on what to do. The language must be easy for a non-medical person to understand in a stressful situation. Return this as an array of steps.
  3.  Provide a separate, clear list of signs that indicate the person should see a doctor or call emergency services.
  
  IMPORTANT: Do NOT include any disclaimers or warnings like "This is not medical advice" in your output. This is handled by the application's UI. Focus only on providing the title, steps, and when to see a doctor.`,
});

const aiFirstAidFlow = ai.defineFlow(
  {
    name: 'aiFirstAidFlow',
    inputSchema: AIFirstAidInputSchema,
    outputSchema: AIFirstAidOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get a response from the AI prompt.");
    }

    const imagePromises = output.steps.map(step => 
      aiFirstAidImageGenerator({ step: step.text }).catch(e => {
        console.error(`Failed to generate image for step: "${step.text}"`, e);
        return { imageUrl: null }; // Return null on failure to not block the whole flow
      })
    );
    
    const images = await Promise.all(imagePromises);

    const stepsWithImages = output.steps.map((step, index) => ({
      text: step.text,
      imageUrl: images[index]?.imageUrl || undefined,
    }));

    return {
      title: output.title,
      steps: stepsWithImages,
      whenToSeeDoctor: output.whenToSeeDoctor,
    };
  }
);
