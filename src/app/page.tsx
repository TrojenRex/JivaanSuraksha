import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Stethoscope, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Jivaan Suraksha</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered guide to understanding symptoms of water-borne diseases and finding help near you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-2 flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">AI Symptom Checker</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center text-center">
              <p className="text-muted-foreground mb-6">
                Describe your symptoms and get instant AI-powered insights into possible conditions related to water contamination.
              </p>
              <Link href="/symptom-checker" className="btn-uiverse mt-auto">
                Start Checking
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-2xl backdrop-blur-sm bg-card/80 border-2 flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Find Nearby Clinics</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center text-center">
              <p className="text-muted-foreground mb-6">
                Use your location to find the nearest clinics and hospitals for professional medical assistance.
              </p>
              <Button asChild size="lg" className="mt-auto w-full max-w-xs">
                <Link href="/nearby-clinics">Find Clinics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
