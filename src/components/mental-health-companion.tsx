
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Sparkle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getMentalHealthResponse } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

export default function MentalHealthCompanion() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello. I'm Anshu, your supportive companion. I'm here to listen without judgment. How are you feeling today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: values.message }]);

    const result = await getMentalHealthResponse({ message: values.message });

    if (result.success && result.data) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.data!.response }]);
    } else {
      const errorContent = result.error || 'Sorry, I encountered an issue and cannot respond right now.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorContent }]);
    }

    form.reset();
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3">
          <Sparkle className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">{t('mentalHealthCompanion')}</CardTitle>
        </div>
        <CardDescription>A safe space to share your thoughts. I'm here to listen.</CardDescription>
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
                    'max-w-[85%] rounded-lg p-3 text-sm shadow',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
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
