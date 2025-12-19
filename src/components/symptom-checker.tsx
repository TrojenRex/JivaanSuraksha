'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Mic } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getAiResponse } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe your symptoms in at least 10 characters.',
  }),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

// Define SpeechRecognition interface for cross-browser compatibility
interface CustomSpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;


export default function SymptomChecker() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am Anshu, your AI health assistant. Please describe your symptoms, and I'll try to identify possible issues and suggest remedies. You can also use the microphone to speak your symptoms.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });
  
  useEffect(() => {
    if (!SpeechRecognition) {
      // API not supported, no need to initialize
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
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = 'An unknown error occurred during speech recognition.';
        if (event.error === 'no-speech') {
            errorMessage = 'No speech was detected. Please try again.';
        } else if (event.error === 'audio-capture') {
            errorMessage = 'Microphone is not available. Please check your microphone settings.';
        } else if (event.error === 'not-allowed') {
            errorMessage = 'Permission to use microphone was denied. Please allow microphone access in your browser settings.';
        }
        toast({
            variant: 'destructive',
            title: 'Voice Input Error',
            description: errorMessage,
        });
        setIsListening(false);
    };
    
    recognitionRef.current = recognition;

  }, [form, toast]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleListen = () => {
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Feature Not Supported',
        description: 'Your browser does not support voice recognition.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch(e) {
          console.error("Could not start recognition", e)
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: values.symptoms }]);

    const result = await getAiResponse(values.symptoms);

    if (result.success && result.data) {
      const { possibleDiseases, suggestedCures } = result.data;
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
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: result.error || 'An unknown error occurred.' }]);
    }

    form.reset();
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">AI Symptom Checker</h2>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg p-3 text-sm shadow',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm flex items-center space-x-2 shadow">
                   <Loader2 className="h-5 w-5 animate-spin" />
                   <span>Analyzing symptoms...</span>
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
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={isListening ? "Listening..." : "e.g., I have a high fever, headache, and a sore throat..."}
                      className="resize-none"
                      disabled={isLoading}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button
              type="button"
              size="icon"
              variant={isListening ? 'destructive' : 'outline'}
              onClick={handleListen}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
              <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
            </Button>
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
