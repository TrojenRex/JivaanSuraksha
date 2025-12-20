
'use client';

import { cn } from '@/lib/utils';
import { useTransition } from './transition-provider';

const PageTransition = () => {
  const { loading } = useTransition();

  return (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-[999] flex items-center justify-center transition-opacity duration-300',
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="loading-wave">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
    </div>
  );
};

export default PageTransition;
