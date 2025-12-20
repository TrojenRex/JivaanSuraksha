import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function HealthArticlesPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <Card className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-sm bg-card/80 border-2">
            <CardHeader className="items-center text-center">
                <Newspaper className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">Health Articles</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">This feature is coming soon! You'll be able to read AI-curated articles on wellness and health topics.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
