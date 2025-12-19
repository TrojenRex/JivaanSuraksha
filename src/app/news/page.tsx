import Header from '@/components/layout/header';
import MedicalNews from '@/components/medical-news';
import WaveBackground from '@/components/wave-background';

export default function NewsPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-24">
        <MedicalNews />
      </main>
    </div>
  );
}
