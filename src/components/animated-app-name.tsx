
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

const AnimatedAppName = ({ text }: { text: string }) => {
  const [key, setKey] = useState(0);

  const handleClick = useCallback(() => {
    setKey(prevKey => prevKey + 1);
  }, []);

  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    // Generate lines on the client side to avoid hydration mismatch
    const generateLines = () => Array.from({ length: 5 }).map((_, i) => {
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
    });
    setLines(generateLines());
  }, [key]);

  return (
    <div 
      key={key}
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

    