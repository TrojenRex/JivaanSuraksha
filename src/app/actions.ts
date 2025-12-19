'use server';

import { aiSymptomDetection } from '@/ai/flows/ai-symptom-detection';
import type { AISymptomDetectionOutput } from '@/ai/flows/ai-symptom-detection';
import { aiMedicineChecker } from '@/ai/flows/ai-medicine-checker';
import type { AIMedicineCheckerInput, AIMedicineCheckerOutput } from '@/ai/flows/ai-medicine-checker';


type AISymptomActionResult = {
  success: boolean;
  data?: AISymptomDetectionOutput;
  error?: string;
};

export async function getAiResponse(symptoms: string): Promise<AISymptomActionResult> {
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

type AIMedicineActionResult = {
  success: boolean;
  data?: AIMedicineCheckerOutput;
  error?: string;
};

export async function getMedicineInfo(input: AIMedicineCheckerInput): Promise<AIMedicineActionResult> {
  if (!input.medicine && !input.photoDataUri) {
    return {
      success: false,
      error: 'Please provide a medicine name or a photo.',
    };
  }

  try {
    const result = await aiMedicineChecker(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI medicine checker failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to process your request. Please try again later.',
    };
  }
}
