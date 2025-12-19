'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User, Camera, Video, AlertCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { getMedicineInfo } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';


const formSchema = z.object({
  medicine: z.string(),
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
      content: "Hello! I am Anshu. Enter the name of a medicine, or use the camera to take a picture of it. I'll provide you with information about its uses, side effects, and general dosage.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    // Stop camera stream when the dialog is closed
    if (!isCameraOpen) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOpen]);
  
  const handleCameraOpen = async () => {
    setIsCameraOpen(true);
    setHasCameraPermission(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    } else {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
    }
  };

  const processRequest = async (input: { medicine?: string, photoDataUri?: string }) => {
    setIsLoading(true);
    const userMessage = input.medicine || 'Image of a medicine';
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const result = await getMedicineInfo(input);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.medicine.trim()) return;
    await processRequest({ medicine: values.medicine });
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame onto the canvas
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
                     <span>Analyzing...</span>
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
                        placeholder="e.g., Paracetamol, or use the camera ->"
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
              <Button type="button" size="icon" variant="outline" onClick={handleCameraOpen} disabled={isLoading}>
                <Camera className="h-4 w-4" />
                <span className="sr-only">Use Camera</span>
              </Button>
              <Button type="submit" size="icon" disabled={isLoading || !form.getValues('medicine')}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Scan Medicine</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {hasCameraPermission === null && (
              <div className="flex items-center text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Waiting for camera...</span>
              </div>
            )}
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                  Please enable camera permissions in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}
            <div className="relative w-full">
              <video
                ref={videoRef}
                className={cn(
                  "w-full aspect-video rounded-md bg-muted",
                  hasCameraPermission !== true && "hidden"
                )}
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission !== true && <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center"><Video className="h-16 w-16 text-muted-foreground" /></div>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleCapture} disabled={!hasCameraPermission || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="mr-2 h-4 w-4" />}
              Capture & Analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
