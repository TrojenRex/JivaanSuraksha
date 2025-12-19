'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Hospital, Phone, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import Image from 'next/image';
import { Input } from './ui/input';
import { useLanguage } from './language-provider';

type Clinic = {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
};

type ApiResponse = {
  clinics: Clinic[];
  mapUrl: string | null;
}

export default function NearbyClinics() {
  const { t } = useLanguage();
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isApiError, setIsApiError] = useState(false);

  const findClinics = async () => {
    if (!locationInput.trim()) {
        setError("Please enter a location, such as a city, address, or zip code.");
        return;
    }
    setLoading(true);
    setError(null);
    setIsApiError(false);
    setApiResponse(null);

    try {
      const response = await fetch(`/api/places?location=${encodeURIComponent(locationInput)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clinics.');
      }
      const data: ApiResponse = await response.json();
       if (data.clinics.length === 0) {
        setError(`No clinics or hospitals found near "${locationInput}". Please try a different or more specific location.`)
      }
      setApiResponse(data);
    } catch (err: any) {
       if (err.message.includes('API configuration error') || err.message.includes('request was denied')) {
        setError('This feature is not configured correctly. The developer needs to ensure the Google Maps API Key is valid and that the "Places API" and "Geocoding API" are enabled in the Google Cloud Console.');
        setIsApiError(true);
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clinics = apiResponse?.clinics || [];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('nearbyClinics')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
        {!loading && clinics.length === 0 && !error && (
          <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
             <p className="text-center text-muted-foreground">
              Enter your location to find nearby hospitals and clinics.
            </p>
             <div className="flex w-full items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="e.g., city, address, or zip code" 
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          findClinics();
                        }
                    }}
                    disabled={loading}
                />
                <Button type="submit" onClick={findClinics} disabled={loading}>
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Searching for clinics...</p>
          </div>
        )}

        {error && (
          <div className="w-full">
            {isApiError ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
             <Button onClick={() => { setError(null); setApiResponse(null); }} variant="outline" className="w-full mt-4">
                Try Again
            </Button>
          </div>
        )}
        
        {apiResponse && clinics.length > 0 && (
          <div className="w-full space-y-4">
            {apiResponse.mapUrl && (
              <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden border">
                <Image src={apiResponse.mapUrl} alt="Map of nearby clinics" layout="fill" objectFit="cover" />
              </div>
            )}
            <h3 className="text-lg font-bold text-center">Clinics and Hospitals Near You</h3>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {clinics.map((clinic, index) => (
                <div key={clinic.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold flex items-center gap-2">
                         <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{index+1}</span>
                        <Hospital className="h-5 w-5 text-primary" />
                        {clinic.name}
                      </h4>
                      <p className="text-sm text-muted-foreground pl-14">{clinic.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">{clinic.distance}</span>
                  </div>
                   {clinic.phone !== 'N/A' && (
                    <div className="flex items-center gap-2 pt-2 pl-14">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${clinic.phone}`} className="text-sm text-primary hover:underline">
                        {clinic.phone}
                        </a>
                    </div>
                   )}
                </div>
              ))}
            </div>
             <Button onClick={() => { setApiResponse(null); setLocationInput(''); }} variant="outline" className="w-full">
              Start New Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}