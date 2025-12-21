import type { FC } from 'react';
import PlusBackground from './plus-background';

const WaveBackground: FC = () => {
  return (
    <>
      <div className="ocean" />
      <PlusBackground />
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </>
  );
};

export default WaveBackground;

    