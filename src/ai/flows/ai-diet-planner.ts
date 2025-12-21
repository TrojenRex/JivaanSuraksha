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
    dietaryPreference: z.enum(["vegetarian", "vegan", "pescatarian", "non_vegetarian", "none"]).describe('Dietary preference (e.g., "vegetarian", "vegan", "pescatarian", "non_vegetarian", "none").'),
});
export type AIDietPlannerInput = z.infer<typeof AIDietPlannerInputSchema>;

const MealPlanSchema = z.object({
  breakfast: z.string().describe("A simple, healthy, and balanced breakfast option. Be specific with portion sizes where appropriate (e.g., '1 cup of yogurt')."),
  lunch: z.string().describe("A simple, healthy, and balanced lunch option. Be specific with portion sizes where appropriate."),
  dinner: z.string().describe("A simple, healthy, and balanced dinner option. Be specific with portion sizes where appropriate."),
  snacks: z.string().describe("1-2 simple and healthy snack options."),
});

const AIDietPlannerOutputSchema = z.object({
  plan: MealPlanSchema.describe('A detailed one-day sample meal plan including breakfast, lunch, dinner, and snacks.'),
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
  1.  Create a simple, balanced, and healthy one-day meal plan with separate entries for Breakfast, Lunch, Dinner, and Snacks.
  2.  The plan should be realistic for a regular person to follow. Suggest common and easily accessible foods.
  3.  Provide 2-3 actionable tips to support their health goal.
  
  Example meal plan item: "Oatmeal with berries and a handful of nuts."
  
  IMPORTANT: Make sure the generated fields do not contain any disclaimers. The disclaimer is handled by the application's UI.`,
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
