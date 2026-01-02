import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/google-genai';

export const googleAI = googleAIPlugin({apiKey: process.env.GEMINI_API_KEY});

export const ai = genkit({
  plugins: [googleAI],
});
