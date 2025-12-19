'use server';

import { aiSymptomDetection } from '@/ai/flows/ai-symptom-detection';
import type { AISymptomDetectionOutput } from '@/ai/flows/ai-symptom-detection';

type ActionResult = {
  success: boolean;
  data?: AISymptomDetectionOutput;
  error?: string;
};

export async function getAiResponse(symptoms: string): Promise<ActionResult> {
  if (!symptoms || symptoms.trim().length < 10) {
    return {
      success: false,
      error: 'Please provide a more detailed description of your symptoms.',
    };
  }

  try {
    const result = await aiSymptomDetection({ symptoms });
    return { success: true, data: result };
  } catch (error) {
    console.error('AI symptom detection failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to process your request. Please try again later.',
    };
  }
}
