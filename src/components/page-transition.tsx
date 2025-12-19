
'use client';

import { Loader2 } from 'lucide-react';
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
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
};

export default PageTransition;
