import type { FC } from 'react';

const WaveBackground: FC = () => {
  return (
    <div className="waves-container" aria-hidden="true">
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
      <div className="wave wave4"></div>
      <div className="wave wave5"></div>
    </div>
  );
};

export default WaveBackground;
