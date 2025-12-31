'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Siren, User, Phone, MapPin, AlertTriangle, PartyPopper, Mic, Play, Square, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from './language-provider';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required.'),
  contactNumber: z.string().min(10, 'A valid contact number is required.'),
  location: z.string().min(5, 'A detailed location or address is required.'),
});

interface CustomSpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

export default function BookAmbulance() {
  const { t } = useLanguage();
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [audioRecording, setAudioRecording] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition() as CustomSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setTranscribedText(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({ variant: 'destructive', title: 'Voice Input Error', description: 'Could not process audio.' });
        setIsListening(false);
    };
    
    recognitionRef.current = recognition;
  }, [toast]);
  
  const handleToggleRecording = async () => {
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Feature Not Supported', description: 'Your browser does not support voice recognition.' });
      return;
    }
  
    if (isListening) {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioRecording(audioUrl);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        recognitionRef.current?.start();
        setIsListening(true);
        setAudioRecording(null);
        setTranscribedText('');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please enable microphone permissions.' });
      }
    }
  };

  const handlePlayRecording = () => {
      if(audioRecording && audioRef.current) {
          audioRef.current.src = audioRecording;
          audioRef.current.play();
      }
  }

  const handleDeleteRecording = () => {
    setAudioRecording(null);
    setTranscribedText('');
    if (audioRef.current) {
        audioRef.current.src = '';
    }
  }


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      contactNumber: '',
      location: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Ambulance booked with details:', {
        ...values,
        emergencyAudioTranscription: transcribedText
    });
    setIsLoading(false);
    setIsBooked(true);
  }
  
  const handleReset = () => {
    form.reset();
    setIsBooked(false);
    setAudioRecording(null);
    setTranscribedText('');
  }

  if (isBooked) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2" style={{transform: 'translateZ(20px)'}}>
        <CardHeader className="items-center text-center">
          <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-bold">Booking Confirmed!</CardTitle>
          <CardDescription>An ambulance is on its way to your location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <Alert>
                <Siren className="h-4 w-4" />
                <AlertTitle>Estimated Arrival Time</AlertTitle>
                <AlertDescription className="font-bold text-2xl">
                    15 Minutes
                </AlertDescription>
            </Alert>
            <p className="text-muted-foreground text-sm">Please keep your phone line open. The ambulance driver will contact you shortly. Ensure the path is clear for the paramedics.</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
             <Button onClick={handleReset} className="w-full">Book Another Ambulance</Button>
             <p className="text-xs text-muted-foreground">For immediate concerns, call emergency services directly.</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2" style={{transform: 'translateZ(20px)'}}>
      <CardHeader className="items-center text-center">
        <Siren className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="text-3xl font-bold">{t('bookAmbulance')}</CardTitle>
        <CardDescription>Fill out the form below for immediate assistance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This is a Simulation</AlertTitle>
            <AlertDescription>
                This feature is for demonstration only. In a real emergency, always call your local emergency number.
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g., +1 555-123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location / Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide a detailed address, landmark, or GPS coordinates..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
                <FormLabel className="flex items-center gap-2"><Mic className="h-4 w-4" /> Record Emergency Details</FormLabel>
                <div className={cn("p-4 rounded-md border flex items-center justify-center gap-4", isListening ? 'border-destructive' : 'border-input')}>
                    <Button type="button" variant={isListening ? 'destructive' : 'outline'} size="icon" className='h-14 w-14 rounded-full' onClick={handleToggleRecording} disabled={isLoading}>
                        {isListening ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        <span className="sr-only">{isListening ? 'Stop Recording' : 'Start Recording'}</span>
                    </Button>
                    <div className='flex-1 text-center'>
                        {isListening ? (
                            <p className='text-destructive animate-pulse'>Recording...</p>
                        ) : audioRecording ? (
                            <div className='flex items-center gap-2'>
                                <Button type="button" variant="ghost" size="icon" onClick={handlePlayRecording}>
                                    <Play className="h-5 w-5" />
                                </Button>
                                <p className='text-sm text-muted-foreground truncate flex-1'>Recording saved.</p>
                                <Button type="button" variant="ghost" size="icon" onClick={handleDeleteRecording}>
                                    <X className="h-5 w-5" />
                                </Button>
                                <audio ref={audioRef} className='hidden' />
                            </div>
                        ) : (
                            <p className='text-muted-foreground'>Tap to record</p>
                        )}
                    </div>
                </div>
                {transcribedText && (
                    <div className='p-3 bg-muted rounded-md text-sm text-muted-foreground'>
                        <p className='font-semibold mb-1'>Transcript:</p>
                        <p>{transcribedText}</p>
                    </div>
                )}
            </div>
             
            <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Ambulance Now'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    