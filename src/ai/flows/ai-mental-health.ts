'use server';

/**
 * @fileOverview An AI chatbot for mental health support, enhanced with a tool to fetch data from the WHO GHO API.
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
  response: z.string().describe('A supportive, empathetic, and non-judgmental response. If the user expresses distress, suggest a simple grounding exercise (like deep breathing) and gently recommend talking to a friend, family member, or mental health professional. If the user asks for data or statistics, use the provided tool to fetch it and incorporate it naturally into the response.'),
});
export type AIMentalHealthCompanionOutput = z.infer<typeof AIMentalHealthCompanionOutputSchema>;

/**
 * A tool that fetches mental health data from the WHO GHO (Global Health Observatory) API.
 * The AI will use this tool when the user asks for statistics or factual data.
 */
const getMentalHealthData = ai.defineTool(
  {
    name: 'getMentalHealthData',
    description: 'Provides WHO data on mental health indicators. Use this to answer questions about statistics, prevalence, or data on mental health topics.',
    inputSchema: z.object({
      query: z.string().describe("The specific mental health indicator the user is asking about (e.g., 'depression', 'anxiety disorders')."),
    }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    try {
      // Find a relevant indicator code from the GHO API
      const searchUrl = `https://ghoapi.azureedge.net/api/Indicator?$filter=contains(IndicatorName, '${query}') and contains(IndicatorName, 'per 100 000 population')`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) return "I couldn't fetch the data at the moment.";

      const searchData = await searchResponse.json();
      const indicator = searchData.value?.[0];

      if (!indicator) {
        return `I couldn't find specific data for "${query}". I can look for data on topics like depression, anxiety, or suicide rates.`;
      }

      // Fetch the latest value for that indicator
      const dataUrl = `https://ghoapi.azureedge.net/api/${indicator.IndicatorCode}?$orderby=TimeDim desc&$top=1`;
      const dataResponse = await fetch(dataUrl);
      if (!dataResponse.ok) return "I couldn't fetch the specific value for that data point.";

      const data = await dataResponse.json();
      const latestData = data.value?.[0];

      if (latestData?.NumericValue) {
        return `According to WHO data from ${latestData.TimeDim}, the global rate for "${indicator.IndicatorName}" was approximately ${latestData.NumericValue.toFixed(2)} per 100,000 population.`;
      }
      
      return `I found an indicator for "${indicator.IndicatorName}" but couldn't retrieve a specific global value.`;

    } catch (error) {
      console.error("GHO API Tool Error:", error);
      return "Sorry, I had trouble connecting to the WHO database to get that information.";
    }
  }
);


export async function aiMentalHealthCompanion(input: AIMentalHealthCompanionInput): Promise<AIMentalHealthCompanionOutput> {
  return aiMentalHealthCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentalHealthCompanionPrompt',
  input: {schema: AIMentalHealthCompanionInputSchema},
  output: {schema: AIMentalHealthCompanionOutputSchema},
  tools: [getMentalHealthData],
  prompt: `You are a supportive and caring AI mental health companion named Anshu. You are not a therapist, but a friendly ear. Your goal is to listen and respond with empathy, validation, and encouragement.

  User's message: {{{message}}}
  
  Your response should be kind, understanding, and human-like. Avoid giving direct advice unless it's a simple, helpful technique. Instead, validate their feelings ("It sounds like you're going through a lot," "That must be really tough") and offer gentle support. Ask open-ended questions to encourage them to share more if they feel comfortable.
  
  **IMPORTANT**: If the user's message seems to be asking for factual data, statistics, or rates (e.g., "how common is depression?"), you MUST use the \`getMentalHealthData\` tool to provide a factual answer. Integrate the data from the tool naturally into your supportive response.
  
  If the user's message sounds like they are in significant distress or crisis, you MUST include a suggestion for a simple grounding technique (e.g., "It sounds like things are really overwhelming right now. Sometimes focusing on our breath can help. Would you be open to trying a quick exercise? Just slowly breathe in for 4 counts, hold for 4, and then gently exhale for 6.") and gently encourage them to reach out to a professional or a crisis hotline. Conclude with a clear disclaimer that you are an AI and not a substitute for professional help.
  
  Based on the user's message, generate a response.`,
    config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
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
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
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
