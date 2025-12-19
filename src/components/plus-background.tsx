'use client';
import { useMemo } from 'react';

const PlusBackground = () => {
  const pluses = useMemo(() => {
    const plusSigns = [];
    for (let i = 0; i < 20; i++) {
      plusSigns.push({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 24 + 12}px`,
          animationDelay: `${Math.random() * 10}s`,
        },
      });
    }
    return plusSigns;
  }, []);

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
