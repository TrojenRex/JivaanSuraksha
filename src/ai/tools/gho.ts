
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GhoParamsSchema = z.object({
  query: z.string().describe('A query for the WHO Global Health Observatory (GHO). Use this to find data and statistics on global health topics, including mental health.'),
});
export type GhoParams = z.infer<typeof GhoParamsSchema>;

export const gho = ai.defineTool(
  {
    name: 'gho',
    description: 'Provides access to the World Health Organization’s Global Health Observatory (GHO) data. Use it to answer questions about global health statistics, indicators, and data related to mental health and other health topics.',
    inputSchema: GhoParamsSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // In a real implementation, this would fetch data from the GHO API.
    // For this prototype, we'll return a mocked response.
    console.log(`[GHO Tool] Received query: ${input.query}`);
    return `Successfully queried the WHO GHO database for: "${input.query}". In a real application, this tool would connect to the WHO API to retrieve and return live data. For example, a query for "depression statistics" might return: "Globally, an estimated 5% of adults suffer from depression."`;
  }
);
