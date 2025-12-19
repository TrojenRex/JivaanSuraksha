import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import InteractiveCards from '@/components/interactive-cards';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Jivaan Suraksha</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered guide to understanding symptoms of water-borne diseases and finding help near you.
          </p>
        </div>
        <InteractiveCards />
      </main>
    </div>
  );
}
