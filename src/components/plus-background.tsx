'use client';
import { useState, useEffect } from 'react';

type PlusSign = {
  id: number;
  style: React.CSSProperties;
};

const PlusBackground = () => {
  const [pluses, setPluses] = useState<PlusSign[]>([]);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    // This avoids hydration errors that can break animations.
    const plusSigns = Array.from({ length: 37 }).map((_, i) => {
        const size = Math.random() * 30 + 20;
        const rotateX = `${(Math.random() - 0.5) * 720}deg`;
        const rotateY = `${(Math.random() - 0.5) * 720}deg`;
        return {
            id: i,
            style: {
              '--size': `${size}px`,
              '--rotate-x': rotateX,
              '--rotate-y': rotateY,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${Math.random() * 5 + 7}s`,
            } as React.CSSProperties,
        }
    });
    setPluses(plusSigns);
  }, []);

  if (!pluses.length) {
    // Render nothing on the server and initial client render to prevent mismatch
    return null;
  }

  return (
    <div className="plus-background" aria-hidden="true">
      {pluses.map(plus => (
        <div key={plus.id} className="plus" style={plus.style} />
      ))}
    </div>
  );
};

export default PlusBackground;
