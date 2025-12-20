import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

export default function FirstAidPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader className="items-center text-center">
                <LifeBuoy className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">First-Aid Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">This feature is coming soon! You'll get instant, step-by-step AI guidance for common emergencies.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
