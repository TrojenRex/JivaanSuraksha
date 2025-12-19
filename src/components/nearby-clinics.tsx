'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

type GeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

export default function NearbyClinics() {
  const [location, setLocation] = useState<GeolocationPosition['coords'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setLocation(position.coords);
          setLoading(false);
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Find Nearby Clinics</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <p className="text-center text-muted-foreground">
          Click the button to use your current location to find nearby clinics and hospitals.
        </p>
        <Button onClick={getLocation} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Location...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Use My Location
            </>
          )}
        </Button>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {location && (
          <div className="mt-4 p-4 bg-muted rounded-lg w-full text-center">
            <h3 className="font-bold">Your Location:</h3>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <p className="text-sm text-muted-foreground mt-2">
              (This is a placeholder. A real app would show a map of nearby clinics here.)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
