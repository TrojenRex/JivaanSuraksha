'use client';

import { useState, useEffect, useRef }from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Hospital, Search, LocateFixed, Map } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
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

type Suggestion = {
    description: string;
    place_id: string;
};

export default function NearbyClinics() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isApiError, setIsApiError] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2 && searchQuery !== 'My Current Location') {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(`/api/autocomplete?input=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Failed to fetch autocomplete suggestions:", error);
          setSuggestions([]);
        }
      };

      const debounce = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);


  const findClinics = async (location: string | {latitude: number, longitude: number}) => {
    setLoading(true);
    setError(null);
    setIsApiError(false);
    setApiResponse(null);
    
    if (typeof location === 'string') {
        setShowSuggestions(false);
        setSearchQuery(location);
    }

    const query = typeof location === 'string' ? location : `${location.latitude},${location.longitude}`;

    try {
      const response = await fetch(`/api/places?location=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
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
        setError(`No clinics or hospitals found near your location. Please try a different search.`)
      }
      setApiResponse(data);
    } catch (err: any) {
       if (err.message.includes('API configuration error') || err.message.includes('request was denied')) {
        setError('This feature is not configured correctly. The developer needs to ensure the API Key is valid and that the necessary APIs are enabled in the Cloud Console.');
        setIsApiError(true);
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      setApiResponse(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchQuery('My Current Location');
          findClinics({latitude, longitude});
        },
        (error) => {
          setLoading(false);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setError("You denied the request for Geolocation. Please enable location services in your browser settings to use this feature.");
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

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery === 'My Current Location') {
        setError("Please enter a location to search.");
        return;
    }
    findClinics(searchQuery);
  };
  
  const handleSuggestionClick = (suggestion: Suggestion) => {
    findClinics(suggestion.description);
  };

  const clinics = apiResponse?.clinics || [];
  
  const resetSearch = () => {
    setApiResponse(null); 
    setError(null); 
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('nearbyClinics')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
        <div className="w-full max-w-md mx-auto space-y-4" ref={searchContainerRef}>
            <form onSubmit={handleManualSearch} className="w-full space-y-2">
                <div className='relative w-full'>
                    <div className="flex w-full gap-2">
                         <Input 
                            type="text"
                            placeholder={t('locationPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={loading}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        <Button type="submit" disabled={loading || !searchQuery || searchQuery === 'My Current Location'}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
                            <CardContent className="p-2">
                                <ul className="space-y-1">
                                    {suggestions.map((suggestion) => (
                                        <li key={suggestion.place_id}>
                                            <Button 
                                                variant="ghost" 
                                                className="w-full justify-start h-auto py-2 text-left"
                                                onClick={() => handleSuggestionClick(suggestion)}>
                                                {suggestion.description}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </form>
             <div className="relative flex items-center justify-center">
                <span className="absolute left-0 w-full h-px bg-border"></span>
                <span className="relative bg-card px-2 text-sm text-muted-foreground">OR</span>
            </div>
            <Button 
                onClick={handleUseMyLocation} 
                disabled={loading}
                variant="outline"
                className="w-full"
            >
                <LocateFixed className="mr-2 h-4 w-4" />
                {t('useMyLocation')}
            </Button>
        </div>

        {loading && (
          <div className="flex flex-col items-center space-y-2 pt-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Searching for clinics...</p>
          </div>
        )}

        {error && (
          <div className="w-full pt-4">
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
             <Button onClick={resetSearch} variant="outline" className="w-full mt-4">
                Try Again
            </Button>
          </div>
        )}
        
        {apiResponse && clinics.length > 0 && (
          <div className="w-full space-y-4 pt-4">
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
             <Button onClick={resetSearch} variant="outline" className="w-full">
              Start New Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
