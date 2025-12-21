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
    // This avoids hydration errors.
    const plusSigns = [];
    for (let i = 0; i < 40; i++) {
      plusSigns.push({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 30 + 20}px`,
          animationDelay: `${Math.random() * 12}s`,
        },
      });
    }
    setPluses(plusSigns);
  }, []);

  if (!pluses.length) {
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
