'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Siren, User, Phone, MapPin, AlertTriangle, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from './language-provider';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required.'),
  contactNumber: z.string().min(10, 'A valid contact number is required.'),
  location: z.string().min(5, 'A detailed location or address is required.'),
  emergencyDetails: z.string().min(10, 'Please describe the emergency.'),
});

export default function BookAmbulance() {
  const { t } = useLanguage();
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      contactNumber: '',
      location: '',
      emergencyDetails: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Ambulance booked with details:', values);
    setIsLoading(false);
    setIsBooked(true);
  }
  
  const handleReset = () => {
    form.reset();
    setIsBooked(false);
  }

  if (isBooked) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2" style={{transform: 'translateZ(20px)'}}>
        <CardHeader className="items-center text-center">
          <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-bold">Booking Confirmed!</CardTitle>
          <CardDescription>An ambulance is on its way to your location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <Alert>
                <Siren className="h-4 w-4" />
                <AlertTitle>Estimated Arrival Time</AlertTitle>
                <AlertDescription className="font-bold text-2xl">
                    15 Minutes
                </AlertDescription>
            </Alert>
            <p className="text-muted-foreground text-sm">Please keep your phone line open. The ambulance driver will contact you shortly. Ensure the path is clear for the paramedics.</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
             <Button onClick={handleReset} className="w-full">Book Another Ambulance</Button>
             <p className="text-xs text-muted-foreground">For immediate concerns, call emergency services directly.</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2" style={{transform: 'translateZ(20px)'}}>
      <CardHeader className="items-center text-center">
        <Siren className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="text-3xl font-bold">{t('bookAmbulance')}</CardTitle>
        <CardDescription>Fill out the form below for immediate assistance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This is a Simulation</AlertTitle>
            <AlertDescription>
                This feature is for demonstration only. In a real emergency, always call your local emergency number.
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g., +1 555-123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location / Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide a detailed address, landmark, or GPS coordinates..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="emergencyDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Nature of Emergency</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'Unconscious, difficulty breathing', 'Possible heart attack'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Ambulance Now'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
