'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Volume2, VolumeX, Brain } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { getMentalHealthResponse, getAudioFromText } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';

const formSchema = z.object({
  message: z.string(),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
  textContent: string;
};

export default function MentalHealthCompanion() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello. I'm Anshu, your mental health companion. Please feel free to share what's on your mind. I'm here to listen without judgment.",
      textContent: "Hello. I'm Anshu, your mental health companion. Please feel free to share what's on your mind. I'm here to listen without judgment.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessage, setPlayingMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handlePlayAudio = async (text: string, messageId: string) => {
    if (playingMessage === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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
      toast({
        variant: 'destructive',
        title: 'Audio Playback Error',
        description: result.error || 'Failed to generate audio.',
      });
      setPlayingMessage(null);
    }
  };

  const processRequest = async (input: { message: string }) => {
    setIsLoading(true);
    const userMessage = input.message;
    setMessages(prev => [...prev, { role: 'user', content: userMessage, textContent: userMessage }]);

    const result = await getMentalHealthResponse(input);

    if (result.success && result.data) {
        const { response } = result.data;
        const textContent = response;
        const aiContent = (
            <p className="whitespace-pre-wrap">{response}</p>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent, textContent }]);
    } else {
      const errorContent = result.error || 'An unknown error occurred.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorContent, textContent: errorContent }]);
    }

    form.reset();
    setIsLoading(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.message.trim()) return;
    await processRequest({ message: values.message });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
    <CardHeader className="items-center text-center">
        <Brain className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">{t('mentalHealthCompanion')}</CardTitle>
        <CardDescription>A safe space to share your thoughts and feelings. I'm here to listen.</CardDescription>
    </CardHeader>
    <CardContent>
        <ScrollArea className="h-[50vh] sm:h-[400px] w-full pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
            {messages.map((message, index) => (
            <div
                key={index}
                className={cn(
                'flex items-start gap-2 sm:gap-4',
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
                    'max-w-[85%] rounded-lg p-3 text-sm shadow relative group',
                    message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
                >
                {message.content}
                {message.role === 'assistant' && (
                    <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handlePlayAudio(message.textContent, `msg-${index}`)}
                    disabled={playingMessage !== null && playingMessage !== `msg-${index}`}
                    >
                    {playingMessage === `msg-${index}` ? (
                        <VolumeX className="h-4 w-4 animate-pulse" />
                    ) : (
                        <Volume2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Speak</span>
                    </Button>
                )}
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
                    <span>Thinking...</span>
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
            name="message"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormControl>
                    <Textarea
                    placeholder="Type your message here..."
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
            <Button type="submit" size="icon" disabled={isLoading || !form.getValues('message')}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
            </Button>
        </form>
        </Form>
    </CardFooter>
    </Card>
  );
}
