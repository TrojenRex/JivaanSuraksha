
'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={scrollToTop}
        className={cn(
          'scroll-to-top-button',
          'transition-opacity',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{
            pointerEvents: isVisible ? 'auto' : 'none'
        }}
        aria-label="Go to top"
      >
        <ArrowUp className="svgIcon h-6 w-6" />
      </button>
    </div>
  );
}
