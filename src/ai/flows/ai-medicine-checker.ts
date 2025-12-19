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
    .optional()
    .describe('The name of the medicine.'),
  photoDataUri: z
    .string()
    .optional()
    .describe("A photo of the medicine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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
  prompt: `You are an AI medical assistant. A user has asked for information about a specific medicine.
  
  You will be provided with either a name, a photo of the medicine, or both. Your task is to first identify the medicine. If you are given a photo, identify the medicine from the image. If you are given a name, use that. If you are given both, prioritize the name but use the photo for confirmation if possible.

  Once the medicine is identified, provide a concise summary of its uses, common side effects, and general dosage information.

  IMPORTANT: Start the dosage information with a clear disclaimer that the user must consult a healthcare professional for actual dosage and medical advice.

  {{#if medicine}}Medicine Name: {{{medicine}}}{{/if}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  `,
});

const aiMedicineCheckerFlow = ai.defineFlow(
  {
    name: 'aiMedicineCheckerFlow',
    inputSchema: AIMedicineCheckerInputSchema,
    outputSchema: AIMedicineCheckerOutputSchema,
  },
  async input => {
    if (!input.medicine && !input.photoDataUri) {
        throw new Error('Either a medicine name or a photo must be provided.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
