'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import WaveBackground from '@/components/wave-background';
import InteractiveCards from '@/components/interactive-cards';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useLanguage();
  const [clickCount, setClickCount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (clickCount === 3) {
      setTimer(10);
      setClickCount(0); // Reset for next time
    }
  }, [clickCount]);

  useEffect(() => {
    if (timer === null) return;

    if (timer > 0) {
      const countdownInterval = setInterval(() => {
        setTimer(t => (t !== null ? t - 1 : null));
      }, 1000);
      return () => clearInterval(countdownInterval);
    }

    if (timer === 0) {
      setShowOverlay(true);
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, 500); // Wait for black screen transition

      const resetTimer = setTimeout(() => {
        setShowMessage(false);
        setShowOverlay(false);
        setTimer(null);
      }, 3500); // 0.5s fade in + 3s message

      return () => {
        clearTimeout(messageTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [timer]);


  const handleMainClick = () => {
    if (timer === null) {
      setClickCount(c => c + 1);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <WaveBackground />
      <Header />
      <main 
        className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-28"
        onClick={handleMainClick}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('welcomeMessage')}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('appDescription')}
          </p>
        </div>
        <InteractiveCards />
        {timer !== null && !showOverlay && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-foreground p-4 rounded-lg shadow-2xl z-50">
              <p className="text-2xl font-bold animate-pulse">Countdown: {timer}</p>
            </div>
        )}
      </main>

      {/* Easter Egg Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black z-[100] transition-opacity duration-500 ease-in-out flex items-center justify-center',
          showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <h2
          className={cn(
            'text-4xl md:text-6xl font-bold text-red-600 text-center transition-all duration-500 ease-in-out',
            showMessage
              ? 'opacity-100 scale-100 animate-pulse'
              : 'opacity-0 scale-50'
          )}
          style={{ animationDuration: '0.5s' }}
        >
          2026 me to duniya khatam haiii.. ha!ha!ha!
        </h2>
      </div>
    </div>
  );
}
