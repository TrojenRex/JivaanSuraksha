'use client';

import Header from '@/components/layout/header';
import InteractiveCards from '@/components/interactive-cards';
import { useLanguage } from '@/components/language-provider';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header />
      <main 
        className="flex-1 flex flex-col items-center justify-center p-4 pt-20 md:pt-28"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-outline">{t('welcomeMessage')}</h1>
          <p 
            className="text-lg md:text-xl max-w-3xl mx-auto text-white text-outline"
          >
            {t('appDescription')}
          </p>
        </div>
        <InteractiveCards />
      </main>
    </div>
  );
}
