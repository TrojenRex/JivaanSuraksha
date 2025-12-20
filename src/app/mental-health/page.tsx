
import Header from '@/components/layout/header';
import MentalHealthCompanion from '@/components/mental-health-companion';
import WaveBackground from '@/components/wave-background';

export default function MentalHealthPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header showBackButton />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <MentalHealthCompanion />
      </main>
    </div>
  );
}
