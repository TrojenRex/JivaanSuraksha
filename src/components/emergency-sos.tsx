'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Siren, Loader2, Copy, MessageSquare, AlertTriangle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getEmergencySOSMessage } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { AIEmergencySOSOutput } from '@/ai/flows/ai-emergency-sos';

export default function EmergencySOS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sosResult, setSosResult] = useState<AIEmergencySOSOutput | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleSOS = () => {
    setIsLoading(true);
    setError(null);
    setSosResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please share your location manually.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        const result = await getEmergencySOSMessage({ location: locationLink });

        if (result.success && result.data) {
          setSosResult(result.data);
        } else {
          setError(result.error || "Failed to generate SOS message.");
        }
        setIsLoading(false);
      },
      (geoError) => {
        let errorMessage = "An unknown error occurred while getting your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMessage = "Location access was denied. Please enable location permissions in your browser settings to use this feature.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            errorMessage = "Your location information is currently unavailable."
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  };
  
  const handleCopy = () => {
    if (sosResult?.message) {
      navigator.clipboard.writeText(sosResult.message).then(() => {
        setIsCopied(true);
        toast({ title: 'Message Copied!' });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const handleSms = () => {
    if (sosResult?.message) {
        // The `body` parameter pre-fills the SMS message
        window.location.href = `sms:?body=${encodeURIComponent(sosResult.message)}`;
    }
  }
  
  const handleReset = () => {
      setSosResult(null);
      setError(null);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2 text-center">
      <CardHeader>
        <div className="flex justify-center">
            <Siren className="h-12 w-12 text-primary mb-4" />
        </div>
        <CardTitle className="text-3xl font-bold">Emergency SOS</CardTitle>
        {!sosResult && (
          <CardDescription>
            In a critical situation? Press the button below to generate an emergency message with your current location.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!sosResult ? (
          <div className="flex flex-col items-center space-y-4">
            <Button
              size="lg"
              variant="destructive"
              onClick={handleSOS}
              disabled={isLoading}
              className="w-48 h-16 rounded-full text-lg font-bold shadow-lg animate-pulse"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Siren className="mr-3 h-6 w-6" />
                  SOS
                </>
              )}
            </Button>
            {isLoading && <p className="text-muted-foreground">Getting your location and drafting message...</p>}
            {error && (
                <Alert variant="destructive" className="text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <h3 className="text-lg font-semibold text-center">Your Emergency Message is Ready</h3>
            <div className="p-4 bg-muted rounded-lg border">
                <p className="text-muted-foreground">{sosResult.message}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleCopy} variant="outline">
                    {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {isCopied ? 'Copied!' : 'Copy Message'}
                </Button>
                 <Button onClick={handleSms}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send via SMS
                </Button>
            </div>
          </div>
        )}
      </CardContent>
      {sosResult && (
        <CardFooter className="justify-center">
            <Button onClick={handleReset} variant="ghost">Start Over</Button>
        </CardFooter>
      )}
    </Card>
  );
}
