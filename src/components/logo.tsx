import React from 'react';

const JivanSurakshaLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#22E6D6" />
          <stop offset="100%" stopColor="#4A6CF7" />
        </linearGradient>
        <path
          id="topTextPath"
          d="M 50,100 A 50,50 0 1,1 150,100"
          fill="none"
        />
        <path
          id="bottomTextPath"
          d="M 50,100 A 50,50 0 0,0 150,100"
          fill="none"
        />
      </defs>

      {/* Rings */}
      <circle
        cx="100"
        cy="100"
        r="68"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      <circle
        cx="100"
        cy="100"
        r="78"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Text */}
      <text
        fill="url(#logoGradient)"
        fontSize="14"
        fontWeight="bold"
        letterSpacing="1"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          JIVAN SURAKSHA
        </textPath>
      </text>
      <text
        fill="url(#logoGradient)"
        fontSize="9"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          YOUR AI DOCTOR
        </textPath>
      </text>

      {/* Central Caduceus */}
      <g transform="translate(100, 100) scale(0.6)">
        <path
          d="M 0,-45 L 0,45"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Wings */}
        <path
          d="M 0,-30 C 10,-45 25,-45 35,-35"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 0,-30 C -10,-45 -25,-45 -35,-35"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Snakes */}
        <path
          d="M 15,45 C 35,25 35,-15 15,-35 S -15,-55 0,-30 C 15,-5 15,25 0,45 C -15,25 -15,-5 0,-30"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
         <path
          d="M -15,45 C -35,25 -35,-15 -15,-35 S 15,-55 0,-30 C -15,-5 -15,25 0,45 C 15,25 15,-5 0,-30"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Decorative Swirls */}
       <g transform="translate(36, 100) scale(0.25)">
          <path d="M-10,0 C30,-50 30,50 -10,0 Z" fill="url(#logoGradient)"/>
       </g>
        <g transform="translate(164, 100) scale(-0.25, 0.25)">
          <path d="M-10,0 C30,-50 30,50 -10,0 Z" fill="url(#logoGradient)"/>
       </g>
    </svg>
  );
};

export default JivanSurakshaLogo;
