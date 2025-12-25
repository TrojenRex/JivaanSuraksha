
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import wav from 'wav';

// Define the expected input schema
const TextToSpeechInputSchema = z.object({
  text: z.string(),
});

// Helper to convert PCM buffer to WAV buffer
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (chunk) => bufs.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(bufs)));
    
    writer.write(pcmData);
    writer.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = TextToSpeechInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { text } = validatedInput.data;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) {
      throw new Error('No media returned from TTS model');
    }

    // Convert base64 data URI to a buffer
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    // Convert PCM audio buffer to WAV format
    const wavBuffer = await toWav(audioBuffer);

    // Return the WAV audio as a streaming response
    return new NextResponse(wavBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(wavBuffer.length),
      },
    });
  } catch (error: any) {
    console.error('TTS API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate audio', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
