
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

const AnimatedAppName = ({ text }: { text: string }) => {
  const [key, setKey] = useState(0);

  const handleClick = useCallback(() => {
    setKey(prevKey => prevKey + 1);
  }, []);

  const lines = useMemo(() => 
    Array.from({ length: 5 }).map((_, i) => {
      const angle = Math.random() * 360;
      return {
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 40 + 60}%`,
          animationDelay: `${i * 0.1 + Math.random() * 0.2}s`,
          '--angle': `${angle}deg`
        } as React.CSSProperties,
      }
    }), 
  [key]); // Depend on key to regenerate lines on click

  // Use a state to prevent hydration mismatch for the animation key
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div 
      key={isMounted ? key : 0}
      className="animated-app-name text-lg sm:text-xl md:text-2xl font-bold"
      onClick={handleClick}
      aria-label={`Rerun animation for ${text}`}
      role="button"
    >
      {lines.map((line) => (
        <div
          key={line.id}
          className="animated-app-name-line"
          style={line.style}
        />
      ))}
      <span className="animated-app-name-text text-foreground">{text}</span>
    </div>
  );
};

export default AnimatedAppName;

    