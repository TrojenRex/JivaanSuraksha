
'use client';

import { useState, useEffect } from 'react';

const AnimatedAppName = ({ text }: { text: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This component will only render on the client, preventing hydration mismatch.
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render the static text on the server and initial client render
    return (
      <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
        {text}
      </span>
    );
  }

  return (
    <div className="animated-app-name text-lg sm:text-xl md:text-2xl font-bold">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animated-app-name-line"
          style={{
            top: `${20 * i}%`,
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <span className="animated-app-name-text text-foreground">{text}</span>
    </div>
  );
};

export default AnimatedAppName;
