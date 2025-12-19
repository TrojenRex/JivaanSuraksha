'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Hospital, Phone } from 'lucide-react';

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

// This is mock data. In a real application, this would come from an API.
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Health St, Medville, 12345',
    phone: '(555) 123-4567',
    distance: '1.2 miles',
  },
  {
    id: '2',
    name: 'Community Care Clinic',
    address: '456 Wellness Ave, Medville, 12345',
    phone: '(555) 987-6543',
    distance: '2.5 miles',
  },
  {
    id: '3',
    name: 'Riverdale Urgent Care',
    address: '789 Cure Blvd, Medville, 12345',
    phone: '(555) 555-1212',
    distance: '3.1 miles',
  },
];

export default function NearbyClinics() {
  const [location, setLocation] = useState<GeolocationPosition['coords'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const getLocation = () => {
    setLoading(true);
    setError(null);
    setClinics([]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setLocation(position.coords);
          // In a real app, you would use the location to fetch data from an API.
          // For now, we'll just use the mock data.
          setTimeout(() => {
            setClinics(mockClinics);
            setLoading(false);
          }, 1500); // Simulate network delay
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
        {!location && !loading && (
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

        {error && <p className="text-destructive text-sm">{error}</p>}

        {location && clinics.length > 0 && (
          <div className="w-full space-y-4">
            <h3 className="text-lg font-bold text-center">Clinics and Hospitals Near You</h3>
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-primary" />
                        {clinic.name}
                      </h4>
                      <p className="text-sm text-muted-foreground pl-7">{clinic.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{clinic.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 pl-7">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${clinic.phone}`} className="text-sm text-primary hover:underline">
                      {clinic.phone}
                    </a>
                  </div>
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
