'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, User, Camera, Video, AlertCircle, Scan, Upload, Sparkles } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

import { getSkinAnalysis } from '@/app/actions';
import type { AISkinAnalyzerOutput } from '@/ai/flows/ai-skin-analyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';

const formSchema = z.object({
  image: z.string().optional(),
});

export default function SkinAnalyzer() {
  const { t } = useLanguage();
  const [analysisResult, setAnalysisResult] = useState<AISkinAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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

  const processImage = async (dataUri: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setImagePreview(dataUri);

    const result = await getSkinAnalysis({ photoDataUri: dataUri });

    if (result.success && result.data) {
      setAnalysisResult(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error || 'Could not analyze the image. Please try again.',
      });
      setImagePreview(null); // Clear preview on error
    }

    form.reset();
    setIsLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        processImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

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
          description: 'Please enable camera permissions in your browser settings.',
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
  
  const handleCapture = () => {
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
      processImage(dataUri);
    }
  };
  
  const handleReset = () => {
      setImagePreview(null);
      setAnalysisResult(null);
      form.reset();
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
        <CardHeader className="items-center text-center">
            <Scan className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">{t('skinAnalyzer')}</CardTitle>
            <CardDescription>{t('skinAnalyzerDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!imagePreview && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-muted-foreground">Upload or take a photo of the affected skin area.</p>
                <div className="flex gap-4">
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button onClick={handleCameraOpen} disabled={isLoading} variant="secondary">
                        <Camera className="mr-2 h-4 w-4" />
                        Use Camera
                    </Button>
                </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your image... This may take a moment.</p>
            </div>
          )}

          {imagePreview && !isLoading && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className='space-y-4'>
                        <h3 className="font-bold text-lg text-left">Your Image</h3>
                        <div className="relative aspect-square w-full max-w-sm mx-auto">
                            <Image
                                src={imagePreview}
                                alt="Skin condition preview"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg border-2"
                            />
                        </div>
                    </div>
                    <div className='space-y-4 text-left'>
                        <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Analysis</h3>
                        {analysisResult ? (
                            <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg border">
                                <div className="space-y-1">
                                    <h4 className="font-semibold">Possible Conditions</h4>
                                    <p className="text-muted-foreground">{analysisResult.possibleConditions}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold">Detailed Analysis</h4>
                                    <p className="text-muted-foreground">{analysisResult.analysis}</p>
                                </div>
                                 <div className="space-y-1">
                                    <h4 className="font-semibold">Recommendations</h4>
                                    <p className="text-muted-foreground">{analysisResult.recommendations}</p>
                                </div>
                            </div>
                        ) : (
                             <p className="text-muted-foreground">No analysis available.</p>
                        )}
                    </div>
                </div>
            </div>
          )}

        </CardContent>
        {imagePreview && !isLoading && (
            <CardFooter className="justify-center">
                 <Button onClick={handleReset} variant="outline">Analyze Another Image</Button>
            </CardFooter>
        )}
      </Card>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Scan Skin Condition</DialogTitle>
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
                  Please enable camera permissions to use this feature.
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