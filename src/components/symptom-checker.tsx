'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Mic, Volume2, VolumeX, Camera, Video, AlertCircle, ScanLine, XCircle, PlayCircle } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getAiResponse, getAudioFromText } from '@/app/actions';
import type { AISymptomDetectionInput } from '@/ai/flows/ai-symptom-detection';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const formSchema = z.object({
  symptoms: z.string(),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
  textContent: string;
};

interface CustomSpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

export default function SymptomChecker() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am Anshu, your AI health assistant. Please describe your symptoms, and I'll try to identify possible issues and suggest remedies. You can also use the microphone to speak or the camera to show your symptoms.",
      textContent: "Hello! I am Anshu, your AI health assistant. Please describe your symptoms, and I'll try to identify possible issues and suggest remedies. You can also use the microphone to speak or the camera to show your symptoms.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [playingMessage, setPlayingMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });
  
  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }
    const recognition = new SpeechRecognition() as CustomSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        form.setValue('symptoms', form.getValues('symptoms') + finalTranscript);
      }
    };
    
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = 'An unknown error occurred.';
        if (event.error === 'no-speech') errorMessage = 'No speech was detected. Please try again.';
        else if (event.error === 'audio-capture') errorMessage = 'Microphone is not available.';
        else if (event.error === 'not-allowed') errorMessage = 'Microphone permission denied.';
        toast({ variant: 'destructive', title: 'Voice Input Error', description: errorMessage });
        setIsListening(false);
    };
    recognitionRef.current = recognition;
  }, [form, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const stopAnalysis = () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      setIsAnalyzing(false);
    };

    const stopCamera = () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    if (!isCameraOpen) {
      stopCamera();
      stopAnalysis();
    }

    return () => {
      stopAnalysis();
    }
  }, [isCameraOpen]);
  
  const processRequest = useCallback(async (input: AISymptomDetectionInput) => {
    const isFromLiveAnalysis = input.photoDataUri && !input.symptoms;
    
    if (!isFromLiveAnalysis) {
      setIsLoading(true);
      const userMessage = input.symptoms || 'Image of a symptom';
      setMessages(prev => [...prev, { role: 'user', content: userMessage, textContent: userMessage }]);
    }

    const result = await getAiResponse(input);

    if (result.success && result.data) {
      const { possibleDiseases, suggestedCures } = result.data;
      if (isFromLiveAnalysis) {
         setAnalysisResult(`Possible Conditions: ${possibleDiseases}`);
      } else {
        const textContent = `Possible Conditions: ${possibleDiseases}. Suggested Actions: ${suggestedCures}.`;
        const aiContent = (
          <div>
            <h3 className="font-bold text-lg mb-2">Possible Conditions:</h3>
            <p className="mb-4">{possibleDiseases}</p>
            <h3 className="font-bold text-lg mb-2">Suggested Actions:</h3>
            <p>{suggestedCures}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Disclaimer: I am an AI assistant. This is not medical advice. Please consult a healthcare professional for any health concerns.
            </p>
          </div>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent, textContent }]);
      }
    } else {
      const errorContent = result.error || 'An unknown error occurred.';
       if (isFromLiveAnalysis) {
         setAnalysisResult(`Error: ${errorContent}`);
       } else {
        setMessages(prev => [...prev, { role: 'assistant', content: errorContent, textContent: errorContent }]);
       }
    }
    
    if (!isFromLiveAnalysis) {
      form.reset();
      setIsLoading(false);
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.symptoms.trim()) return;
    await processRequest({ symptoms: values.symptoms });
  }

  const handleListen = () => {
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Feature Not Supported', description: 'Your browser does not support voice recognition.' });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch(e) { console.error("Could not start recognition", e) }
    }
  };

  const handlePlayAudio = async (text: string, messageId: string) => {
    if (playingMessage === messageId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingMessage(null);
      return;
    }
    setPlayingMessage(messageId);
    const result = await getAudioFromText(text);
    if (result.success && result.data) {
      const audio = new Audio(result.data.audioDataUri);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setPlayingMessage(null);
        audioRef.current = null;
      };
    } else {
      toast({ variant: 'destructive', title: 'Audio Playback Error', description: result.error || 'Failed to generate audio.' });
      setPlayingMessage(null);
    }
  };

  const handleCameraOpen = async () => {
    setIsCameraOpen(true);
    setHasCameraPermission(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions.' });
      }
    } else {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Not Supported', description: 'Your browser does not support camera access.' });
    }
  };

  const captureFrameAndAnalyze = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      processRequest({ photoDataUri: dataUri });
    }
  }, [processRequest]);

  const toggleLiveAnalysis = () => {
    if (isAnalyzing) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      setIsAnalyzing(false);
      setAnalysisResult(null);
    } else {
      setIsAnalyzing(true);
      setAnalysisResult("Starting analysis...");
      captureFrameAndAnalyze(); // Immediate analysis
      analysisIntervalRef.current = setInterval(captureFrameAndAnalyze, 5000); // Analyze every 5 seconds
    }
  };

  const handleCaptureAndSubmit = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setIsCameraOpen(false);
      processRequest({ photoDataUri: dataUri });
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
        <CardHeader>
          <h2 className="text-xl sm:text-2xl font-bold text-center">{t('symptomChecker')}</h2>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[50vh] sm:h-[400px] w-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-2 sm:gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
                  )}
                  <div className={cn('max-w-[85%] rounded-lg p-3 text-sm shadow relative group', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    {message.content}
                    {message.role === 'assistant' && (
                      <Button variant="ghost" size="icon" className="absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handlePlayAudio(message.textContent, `msg-${index}`)} disabled={playingMessage !== null && playingMessage !== `msg-${index}`}>
                        {playingMessage === `msg-${index}` ? <VolumeX className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
                        <span className="sr-only">Speak</span>
                      </Button>
                    )}
                  </div>
                  {message.role === 'user' && (<Avatar className="h-8 w-8"><AvatarFallback><User className="h-5 w-5" /></AvatarFallback></Avatar>)}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
                  <div className="bg-muted rounded-lg p-3 text-sm flex items-center space-x-2 shadow">
                     <Loader2 className="h-5 w-5 animate-spin" /><span>Analyzing symptoms...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start w-full gap-2">
              <FormField
                control={form.control} name="symptoms"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea placeholder={isListening ? "Listening..." : "e.g., I have a high fever, headache, and a sore throat..."} className="resize-none" disabled={isLoading} rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.handleSubmit(onSubmit)(); } }} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={handleListen} disabled={isLoading}><Mic className="h-4 w-4" /><span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span></Button>
              <Button type="button" size="icon" variant="outline" onClick={handleCameraOpen} disabled={isLoading}><Camera className="h-4 w-4" /><span className="sr-only">Use Camera</span></Button>
              <Button type="submit" size="icon" disabled={isLoading || !form.getValues('symptoms')}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader><DialogTitle>Live Symptom Analysis</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {hasCameraPermission === null && <div className="flex items-center text-muted-foreground gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Waiting for camera...</span></div>}
            {hasCameraPermission === false && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Camera Access Denied</AlertTitle><AlertDescription>Please enable camera permissions in your browser settings.</AlertDescription></Alert>}
            <div className="relative w-full">
              <video ref={videoRef} className={cn("w-full aspect-video rounded-md bg-muted", hasCameraPermission !== true && "hidden")} autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission !== true && <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center"><Video className="h-16 w-16 text-muted-foreground" /></div>}
               {analysisResult && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white p-2 rounded-md text-sm flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-primary" />
                  <span>{analysisResult}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <Button onClick={toggleLiveAnalysis} disabled={!hasCameraPermission} variant={isAnalyzing ? "destructive" : "default"}>
                {isAnalyzing ? <><XCircle className="mr-2 h-4 w-4" />Stop Analysis</> : <><PlayCircle className="mr-2 h-4 w-4" />Start Live Analysis</>}
             </Button>
             <div className='flex gap-2'>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={handleCaptureAndSubmit} disabled={!hasCameraPermission || isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="mr-2 h-4 w-4" />}
                    Capture & Submit
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
