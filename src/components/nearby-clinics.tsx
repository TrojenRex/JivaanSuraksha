'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Hospital, Search, LocateFixed, Map } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { Input } from './ui/input';
import { useLanguage } from './language-provider';
import Link from 'next/link';

type Clinic = {
  id: string;
  name: string;
  address: string;
  distance: string;
  location: {
    lat: number;
    lon: number;
  }
};

type ApiResponse = {
  clinics: Clinic[];
}

type AutocompletePrediction = {
  description: string;
  place_id: string;
};

export default function NearbyClinics() {
  const { t } = useLanguage();
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isApiError, setIsApiError] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (locationInput.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(`/api/autocomplete?input=${encodeURIComponent(locationInput)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions', error);
          setSuggestions([]);
        }
      };

      const handler = setTimeout(() => {
        fetchSuggestions();
      }, 300); // Debounce API calls

      return () => {
        clearTimeout(handler);
      };
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [locationInput]);


  const findClinics = async (query?: string) => {
    const finalQuery = query || locationInput;
    if (!finalQuery.trim()) {
        setError("Please enter a location, such as a city, address, or zip code.");
        return;
    }
    setLoading(true);
    setError(null);
    setIsApiError(false);
    setApiResponse(null);
    setShowSuggestions(false);
    setLocationInput(finalQuery);

    try {
      const response = await fetch(`/api/places?location=${encodeURIComponent(finalQuery)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          // Check if the error is JSON, if so, use its message
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          // Not JSON, use the raw text, which is fine
        }
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse = await response.json();

       if (data.clinics.length === 0) {
        setError(`No clinics or hospitals found near "${finalQuery}". Please try a different or more specific location.`)
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
  
  const handleSuggestionClick = (suggestion: AutocompletePrediction) => {
    findClinics(suggestion.description);
  };
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      setApiResponse(null);
      setLocationInput(''); // Clear previous input
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          findClinics(`${latitude},${longitude}`);
        },
        (error) => {
          setLoading(false);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setError("You denied the request for Geolocation. Please enable location services in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setError("The request to get user location timed out.");
              break;
            default:
              setError("An unknown error occurred while getting your location.");
              break;
          }
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
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
            <Button onClick={handleUseMyLocation} className="w-full" disabled={loading}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {t('useMyLocation')}
            </Button>
            <div className="flex items-center w-full">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
             <p className="text-center text-muted-foreground">
              {t('enterLocationPrompt')}
            </p>
             <div className="relative w-full" ref={wrapperRef}>
                <div className="flex w-full items-center space-x-2">
                    <Input 
                        type="text" 
                        placeholder={t('locationPlaceholder')}
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              findClinics();
                            }
                        }}
                        onFocus={() => setShowSuggestions(locationInput.length > 2)}
                        disabled={loading}
                    />
                    <Button type="submit" onClick={() => findClinics()} disabled={loading}>
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                className="p-2 hover:bg-accent cursor-pointer"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.description}
                            </div>
                        ))}
                    </div>
                )}
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
             <Button onClick={() => { setError(null); setApiResponse(null); setLocationInput(''); }} variant="outline" className="w-full mt-4">
                Try Again
            </Button>
          </div>
        )}
        
        {apiResponse && clinics.length > 0 && (
          <div className="w-full space-y-4">
            <h3 className="text-lg font-bold text-center">Clinics and Hospitals Near You</h3>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-bold flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-primary flex-shrink-0" />
                        {clinic.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{clinic.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">{clinic.distance}</span>
                      <Button asChild variant="secondary" size="sm">
                          <Link href={`https://www.openstreetmap.org/?mlat=${clinic.location.lat}&mlon=${clinic.location.lon}#map=16/${clinic.location.lat}/${clinic.location.lon}`} target="_blank" rel="noopener noreferrer">
                              <Map className="mr-2 h-4 w-4" />
                              View Map
                          </Link>
                      </Button>
                    </div>
                  </div>
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
