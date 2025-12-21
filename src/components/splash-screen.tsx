'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Logo from './logo';

const SplashScreen = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
    }, 1200); // Animation duration is now 0.8s + 0.3s delay = 1.1s

    return () => {
      clearTimeout(finishTimer);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("splash-screen", isFinished && "finished")}>
       <div className={cn("absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300", isFinished ? "opacity-0" : "opacity-100 delay-200")}>
          <Logo className="h-40 w-40 text-primary" />
      </div>
      <div className="splash-panel splash-panel-1" />
      <div className="splash-panel splash-panel-2" />
      <div className="splash-panel splash-panel-3" />
      <div className="splash-panel splash-panel-4" />
    </div>
  );
};

export default SplashScreen;
