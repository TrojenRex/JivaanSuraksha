
'use server';

import { aiSymptomDetection } from '@/ai/flows/ai-symptom-detection';
import type { AISymptomDetectionInput, AISymptomDetectionOutput } from '@/ai/flows/ai-symptom-detection';
import { aiMedicineChecker } from '@/ai/flows/ai-medicine-checker';
import type { AIMedicineCheckerInput, AIMedicineCheckerOutput } from '@/ai/flows/ai-medicine-checker';
import { textToSpeech } from '@/ai/flows/ai-text-to-speech';
import type { TextToSpeechOutput } from '@/ai/flows/ai-text-to-speech';
import { aiSkinAnalyzer } from '@/ai/flows/ai-skin-analyzer';
import type { AISkinAnalyzerInput, AISkinAnalyzerOutput } from '@/ai/flows/ai-skin-analyzer';
import { aiDietPlanner } from '@/ai/flows/ai-diet-planner';
import type { AIDietPlannerInput, AIDietPlannerOutput } from '@/ai/flows/ai-diet-planner';
import { aiEmergencySOS } from '@/ai/flows/ai-emergency-sos';
import type { AIEmergencySOSInput, AIEmergencySOSOutput } from '@/ai/flows/ai-emergency-sos';


// Generic Action Result type
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getAiSymptomResponse(input: AISymptomDetectionInput): Promise<ActionResult<AISymptomDetectionOutput>> {
  if (!input.symptoms && !input.photoDataUri) {
    return {
      success: false,
      error: 'Please provide a more detailed description of your symptoms or an image.',
    };
  }

  try {
    const result = await aiSymptomDetection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI symptom detection failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to process your request. Please try again later.',
    };
  }
}

export async function getMedicineInfo(input: AIMedicineCheckerInput): Promise<ActionResult<AIMedicineCheckerOutput>> {
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

export async function getAudioFromText(text: string): Promise<ActionResult<TextToSpeechOutput>> {
  if (!text) {
    return {
      success: false,
      error: 'Please provide text to convert to speech.',
    };
  }

  try {
    const result = await textToSpeech({ text });
    return { success: true, data: result };
  } catch (error) {
    console.error('AI text-to-speech failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to convert the text to speech. Please try again later.',
    };
  }
}

export async function getSkinAnalysis(input: AISkinAnalyzerInput): Promise<ActionResult<AISkinAnalyzerOutput>> {
  if (!input.photoDataUri) {
    return {
      success: false,
      error: 'Please provide a photo for analysis.',
    };
  }
  try {
    const result = await aiSkinAnalyzer(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI skin analyzer failed:', error);
    return { success: false, error: 'Failed to analyze skin condition.' };
  }
}

export async function getDietPlan(input: AIDietPlannerInput): Promise<ActionResult<AIDietPlannerOutput>> {
  try {
    const result = await aiDietPlanner(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI diet planner failed:', error);
    return { success: false, error: 'Failed to generate diet plan.' };
  }
}

export async function getEmergencySOSMessage(input: AIEmergencySOSInput): Promise<ActionResult<AIEmergencySOSOutput>> {
   if (!input.location) {
    return { success: false, error: 'Location is required for SOS.' };
  }
  try {
    const result = await aiEmergencySOS(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI emergency SOS failed:', error);
    return { success: false, error: 'Failed to generate SOS message.' };
  }
}
