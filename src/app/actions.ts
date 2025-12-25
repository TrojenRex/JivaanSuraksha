
'use server';

import { aiSymptomDetection } from '@/ai/flows/ai-symptom-detection';
import type { AISymptomDetectionInput, AISymptomDetectionOutput } from '@/ai/flows/ai-symptom-detection';
import { aiMedicineChecker } from '@/ai/flows/ai-medicine-checker';
import type { AIMedicineCheckerInput, AIMedicineCheckerOutput } from '@/ai/flows/ai-medicine-checker';
import { textToSpeech } from '@/ai/flows/ai-text-to-speech';
import type { TextToSpeechOutput } from '@/ai/flows/ai-text-to-speech';
import { aiDietPlanner } from '@/ai/flows/ai-diet-planner';
import type { AIDietPlannerInput, AIDietPlannerOutput } from '@/ai/flows/ai-diet-planner';
import { aiFirstAid } from '@/ai/flows/ai-first-aid';
import type { AIFirstAidInput, AIFirstAidOutput } from '@/ai/flows/ai-first-aid';
import { aiFirstAidImageGenerator } from '@/ai/flows/ai-first-aid-image-generator';
import type { AIFirstAidImageGeneratorInput, AIFirstAidImageGeneratorOutput } from '@/ai/flows/ai-first-aid-image-generator';
import { aiDescribeImage } from '@/ai/flows/ai-describe-image';
import type { AIDescribeImageInput, AIDescribeImageOutput } from '@/ai/flows/ai-describe-image';


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

export async function getDietPlan(input: AIDietPlannerInput): Promise<ActionResult<AIDietPlannerOutput>> {
  try {
    const result = await aiDietPlanner(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI diet planner failed:', error);
    return { success: false, error: 'Failed to generate diet plan.' };
  }
}

export async function getFirstAidInstructions(input: AIFirstAidInput): Promise<ActionResult<AIFirstAidOutput>> {
  if (!input.query) {
    return {
      success: false,
      error: 'Please provide an emergency to search for.',
    };
  }
  try {
    const result = await aiFirstAid(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI first aid failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to process your request. Please try again later.',
    };
  }
}

export async function getFirstAidImage(input: AIFirstAidImageGeneratorInput): Promise<ActionResult<AIFirstAidImageGeneratorOutput>> {
    if (!input.step) {
        return {
        success: false,
        error: 'Please provide a step to generate an image for.',
        };
    }
    try {
        const result = await aiFirstAidImageGenerator(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('AI first aid image generation failed:', error);
        return {
        success: false,
        error: 'Sorry, I was unable to generate an image for your request. Please try again later.',
        };
    }
}

export async function getImageDescription(input: AIDescribeImageInput): Promise<ActionResult<AIDescribeImageOutput>> {
  if (!input.photoDataUri) {
    return {
      success: false,
      error: 'Please provide a photo.',
    };
  }
  try {
    const result = await aiDescribeImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI image description failed:', error);
    return {
      success: false,
      error: 'Sorry, I was unable to analyze the image. Please try again later.',
    };
  }
}
