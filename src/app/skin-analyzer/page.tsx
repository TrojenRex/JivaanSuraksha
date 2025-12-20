import Header from '@/components/layout/header';
import SkinAnalyzer from '@/components/skin-analyzer';
import WaveBackground from '@/components/wave-background';

export default function SkinAnalyzerPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
        <SkinAnalyzer />
      </main>
    </div>
  );
}
