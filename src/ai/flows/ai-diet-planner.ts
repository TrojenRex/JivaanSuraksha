'use server';

/**
 * @fileOverview An AI that generates a personalized diet plan based on detailed user input.
 *
 * - aiDietPlanner - A function that handles the diet plan generation.
 * - AIDietPlannerInput - The input type for the aiDietPlanner function.
 * - AIDietPlannerOutput - The return type for the aiDietPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDietPlannerInputSchema = z.object({
    age: z.number().describe('The age of the user.'),
    weight: z.string().describe('The weight of the user (e.g., "70kg").'),
    height: z.string().describe('The height of the user (e.g., "175cm").'),
    gender: z.string().describe('The gender of the user (e.g., "male", "female").'),
    activityLevel: z.string().describe('The user\'s activity level (e.g., "sedentary", "light", "moderate", "active", "very_active").'),
    goal: z.string().describe('The primary health goal (e.g., "weight_loss", "muscle_gain", "maintenance").'),
    dietaryPreference: z.string().describe('Dietary preference (e.g., "vegetarian", "vegan", "pescatarian", "none").'),
});
export type AIDietPlannerInput = z.infer<typeof AIDietPlannerInputSchema>;

const AIDietPlannerOutputSchema = z.object({
  plan: z.string().describe('A detailed one-day sample meal plan including breakfast, lunch, dinner, and snacks. Provide simple, healthy, and balanced options. Be specific with portion sizes where appropriate (e.g., "1 cup of yogurt", "100g of chicken breast").'),
  tips: z.string().describe('A few general, actionable tips to help the user achieve their goal, related to diet, hydration, or lifestyle.'),
});
export type AIDietPlannerOutput = z.infer<typeof AIDietPlannerOutputSchema>;

export async function aiDietPlanner(input: AIDietPlannerInput): Promise<AIDietPlannerOutput> {
  return aiDietPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDietPlannerPrompt',
  input: {schema: AIDietPlannerInputSchema},
  output: {schema: AIDietPlannerOutputSchema},
  prompt: `You are an expert AI nutritionist. A user has provided their details and wants a personalized one-day sample diet plan.

  User Details:
  - Age: {{{age}}}
  - Gender: {{{gender}}}
  - Weight: {{{weight}}}
  - Height: {{{height}}}
  - Activity Level: {{{activityLevel}}}
  - Primary Goal: {{{goal}}}
  - Dietary Preference: {{{dietaryPreference}}}

  Your Task:
  1.  Create a simple, balanced, and healthy one-day meal plan (Breakfast, Lunch, Dinner, and 1-2 Snack options) that aligns with their goal and dietary preference.
  2.  The plan should be realistic for a regular person to follow. Suggest common and easily accessible foods.
  3.  Provide 2-3 actionable tips to support their health goal.
  
  Example structure for the meal plan:
  **Breakfast:** [Dish Name]. E.g., Oatmeal with berries and a handful of nuts.
  **Lunch:** [Dish Name]. E.g., Grilled chicken salad with mixed greens, and a vinaigrette dressing.
  **Dinner:** [Dish Name]. E.g., Baked salmon with roasted vegetables and quinoa.
  **Snacks:** [Option 1], [Option 2]. E.g., Greek yogurt, an apple with peanut butter.
  
  IMPORTANT: Make sure the generated \`plan\` and \`tips\` fields do not contain any disclaimers. The disclaimer is handled by the application's UI.`,
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
