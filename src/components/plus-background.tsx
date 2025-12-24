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
    const plusSigns = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 30 + 20}px`,
          animationDelay: `${Math.random() * 12}s`,
          animationDuration: `${Math.random() * 5 + 7}s`,
        },
    }));
    setPluses(plusSigns);
  }, []);

  if (!pluses.length) {
    // Render nothing on the server and initial client render to prevent mismatch
    return null;
  }

  return (
    <div className="plus-background" aria-hidden="true">
      {pluses.map(plus => (
        <div key={plus.id} className="plus" style={plus.style}>
          +
        </div>
      ))}
    </div>
  );
};

export default PlusBackground;

    