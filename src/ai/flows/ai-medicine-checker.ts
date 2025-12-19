'use server';

/**
 * @fileOverview An AI chatbot that provides information about medicines.
 *
 * - aiMedicineChecker - A function that handles the medicine information process.
 * - AIMedicineCheckerInput - The input type for the aiMedicineChecker function.
 * - AIMedicineCheckerOutput - The return type for the aiMedicineChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMedicineCheckerInputSchema = z.object({
  medicine: z
    .string()
    .describe(
      'The name of the medicine.'
    ),
});
export type AIMedicineCheckerInput = z.infer<typeof AIMedicineCheckerInputSchema>;

const AIMedicineCheckerOutputSchema = z.object({
  uses: z.string().describe('The common uses and indications for the medicine.'),
  sideEffects: z.string().describe('A list of potential side effects.'),
  dosage: z.string().describe('General dosage information. Include a strong disclaimer that this is not medical advice and a doctor or pharmacist must be consulted.'),
});
export type AIMedicineCheckerOutput = z.infer<typeof AIMedicineCheckerOutputSchema>;

export async function aiMedicineChecker(input: AIMedicineCheckerInput): Promise<AIMedicineCheckerOutput> {
  return aiMedicineCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMedicineCheckerPrompt',
  input: {schema: AIMedicineCheckerInputSchema},
  output: {schema: AIMedicineCheckerOutputSchema},
  prompt: `You are an AI medical assistant. A user has asked for information about a specific medicine. Provide a concise summary of its uses, common side effects, and general dosage information.

  IMPORTANT: Start the dosage information with a clear disclaimer that the user must consult a healthcare professional for actual dosage and medical advice.

  Medicine Name: {{{medicine}}}
  `,
});

const aiMedicineCheckerFlow = ai.defineFlow(
  {
    name: 'aiMedicineCheckerFlow',
    inputSchema: AIMedicineCheckerInputSchema,
    outputSchema: AIMedicineCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
