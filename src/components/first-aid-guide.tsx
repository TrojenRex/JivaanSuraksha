
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Loader2, AlertTriangle, ArrowLeft, Wind, HeartPulse, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFirstAidInstructions } from '@/app/actions';
import type { AIFirstAidGuideOutput } from '@/ai/flows/ai-first-aid-guide';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const emergencies = [
  { name: 'Minor Burn', icon: Flame, value: 'minor burn' },
  { name: 'Sprained Ankle', icon: Wind, value: 'sprained ankle' },
  { name: 'Bee Sting', icon: Wind, value: 'bee sting' },
  { name: 'Nosebleed', icon: HeartPulse, value: 'nosebleed' },
  { name: 'Minor Cut', icon: HeartPulse, value: 'minor cut' },
  { name: 'Choking', icon: Wind, value: 'choking' },
];

export default function FirstAidGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIFirstAidGuideOutput | null>(null);
  const { toast } = useToast();

  const handleSelectEmergency = async (emergency: string) => {
    setIsLoading(true);
    setResult(null);

    const response = await getFirstAidInstructions({ emergency });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error || 'Failed to get instructions.',
      });
    }

    setIsLoading(false);
  };
  
  const handleReset = () => {
    setResult(null);
  }

  if (isLoading) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader className="items-center text-center">
                <LifeBuoy className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">First-Aid Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-center min-h-[200px] flex flex-col justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading instructions...</p>
            </CardContent>
        </Card>
    )
  }

  if (result) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader>
                 <Button variant="ghost" size="sm" onClick={handleReset} className="self-start gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Emergencies
                </Button>
                <CardTitle className="text-3xl font-bold text-center">First-Aid Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="font-bold text-lg">Immediate Steps:</h3>
                    <p className="whitespace-pre-wrap">{result.steps}</p>
                    <h3 className="font-bold text-lg mt-4">When to See a Doctor:</h3>
                    <p className="whitespace-pre-wrap">{result.whenToSeeDoctor}</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader className="items-center text-center">
        <LifeBuoy className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">First-Aid Guide</CardTitle>
        <CardDescription>Select a common emergency to get instant AI-powered guidance.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {emergencies.map((emergency) => {
            const Icon = emergency.icon;
            return (
                <Button 
                    key={emergency.value} 
                    variant="outline"
                    className="h-24 flex-col gap-2 text-base"
                    onClick={() => handleSelectEmergency(emergency.value)}
                >
                    <Icon className="h-8 w-8 text-primary" />
                    <span>{emergency.name}</span>
                </Button>
            )
        })}
      </CardContent>
    </Card>
  );
}
