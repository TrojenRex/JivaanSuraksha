'use server';

/**
 * @fileOverview An AI that generates a diet plan based on user preferences.
 *
 * - aiDietPlanner - A function that handles the diet plan generation.
 * - AIDietPlannerInput - The input type for the aiDietPlanner function.
 * - AIDietPlannerOutput - The return type for the aiDietPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDietPlannerInputSchema = z.object({
    age: z.number().describe('The age of the user.'),
    weight: z.string().describe('The weight of the user (e.g., "70kg" or "150lbs").'),
    height: z.string().describe('The height of the user (e.g., "175cm" or "5ft 9in").'),
    goal: z.string().describe('The primary health goal (e.g., "weight loss", "muscle gain", "maintain weight").'),
    dietaryPreference: z.string().describe('Dietary preference (e.g., "vegetarian", "vegan", "none").'),
});
export type AIDietPlannerInput = z.infer<typeof AIDietPlannerInputSchema>;

const AIDietPlannerOutputSchema = z.object({
  plan: z.string().describe('A one-day sample meal plan including breakfast, lunch, dinner, and snacks. Provide simple, healthy options.'),
  tips: z.string().describe('A few general tips to help the user achieve their goal.'),
});
export type AIDietPlannerOutput = z.infer<typeof AIDietPlannerOutputSchema>;

export async function aiDietPlanner(input: AIDietPlannerInput): Promise<AIDietPlannerOutput> {
  return aiDietPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDietPlannerPrompt',
  input: {schema: AIDietPlannerInputSchema},
  output: {schema: AIDietPlannerOutputSchema},
  prompt: `You are an AI nutritionist. A user has provided their details and wants a one-day sample diet plan.

  User Details:
  - Age: {{{age}}}
  - Weight: {{{weight}}}
  - Height: {{{height}}}
  - Goal: {{{goal}}}
  - Dietary Preference: {{{dietaryPreference}}}

  Create a simple, balanced, and healthy one-day meal plan (Breakfast, Lunch, Dinner, Snacks) that aligns with their goal and dietary preference. Also provide 2-3 actionable tips.
  
  IMPORTANT: Include a disclaimer that this is a sample plan and they should consult a registered dietitian for a comprehensive personal plan.`,
});

const aiDietPlannerFlow = ai.defineFlow(
  {
    name: 'aiDietPlannerFlow',
    inputSchema: AIDietPlannerInputSchema,
    outputSchema: AIDietPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
