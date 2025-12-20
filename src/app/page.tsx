'use client';

import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import InteractiveCards from '@/components/interactive-cards';
import { useLanguage } from '@/components/language-provider';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main 
        className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{t('welcomeMessage')}</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('appDescription')}
          </p>
        </div>
        <InteractiveCards />
      </main>
    </div>
  );
}
