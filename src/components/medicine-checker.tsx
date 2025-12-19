'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Pill } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getMedicineInfo } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';

const formSchema = z.object({
  medicine: z.string().min(2, {
    message: 'Please enter a medicine name of at least 2 characters.',
  }),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

export default function MedicineChecker() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am Anshu. Enter the name of a medicine, and I'll provide you with information about its uses, side effects, and general dosage.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicine: '',
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
    setMessages(prev => [...prev, { role: 'user', content: values.medicine }]);

    const result = await getMedicineInfo(values.medicine);

    if (result.success && result.data) {
      const { uses, sideEffects, dosage } = result.data;
      const aiContent = (
        <div>
          <h3 className="font-bold text-lg mb-2">Uses:</h3>
          <p className="mb-4">{uses}</p>
          <h3 className="font-bold text-lg mb-2">Side Effects:</h3>
          <p className="mb-4">{sideEffects}</p>
          <h3 className="font-bold text-lg mb-2">Dosage:</h3>
          <p>{dosage}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Disclaimer: I am an AI assistant. This is not medical advice. Always consult a healthcare professional or pharmacist regarding medication.
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
        <h2 className="text-2xl font-bold text-center">{t('medicineChecker')}</h2>
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
                   <span>Checking medicine...</span>
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
              name="medicine"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Paracetamol, Ibuprofen..."
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
