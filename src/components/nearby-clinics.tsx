'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Hospital, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import Image from 'next/image';

type GeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

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
  const [location, setLocation] = useState<GeolocationPosition['coords'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isApiError, setIsApiError] = useState(false);

  const fetchClinics = async (coords: GeolocationPosition['coords']) => {
    setLoading(true);
    setError(null);
    setIsApiError(false);
    try {
      const response = await fetch(`/api/places?lat=${coords.latitude}&lon=${coords.longitude}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clinics.');
      }
      const data: ApiResponse = await response.json();
      if (data.clinics.length === 0) {
        setError("No clinics or hospitals found within a 3-mile radius. Please try refreshing if you believe this is an error.")
      }
      setApiResponse(data);
    } catch (err: any) {
      if (err.message.includes('API configuration error')) {
        setError('This feature is not configured. The developer needs to provide a Google Maps API Key in an .env file.');
        setIsApiError(true);
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);
    setIsApiError(false);
    setApiResponse(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setLocation(position.coords);
          fetchClinics(position.coords);
        },
        (error) => {
          setError(`Error getting location: ${error.message}`);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const clinics = apiResponse?.clinics || [];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Find Nearby Clinics</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {!location && !loading && clinics.length === 0 && !error && (
          <>
            <p className="text-center text-muted-foreground">
              Click the button to use your current location to find nearby clinics and hospitals.
            </p>
            <Button onClick={getLocation} disabled={loading}>
              <MapPin className="mr-2 h-4 w-4" />
              Use My Location
            </Button>
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Fetching your location and nearby clinics...</p>
          </div>
        )}

        {error && (
          isApiError ? (
             <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-destructive text-sm text-center">{error}</p>
          )
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
             <Button onClick={getLocation} disabled={loading} variant="outline" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Location'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
