import React from "react";

interface LogoProps {
  size?: number; // controls overall size
}

const JivanSurakshaLogo: React.FC<LogoProps> = ({ size = 90 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22E6D6" />
          <stop offset="100%" stopColor="#4A6CF7" />
        </linearGradient>

        <path
          id="topTextPath"
          d="M 30 130 A 100 100 0 0 1 230 130"
        />
        <path
          id="bottomTextPath"
          d="M 30 130 A 100 100 0 0 0 230 130"
        />
      </defs>

      {/* Transparent background for header usage */}
      <circle
        cx="130"
        cy="130"
        r="110"
        stroke="url(#ringGradient)"
        strokeWidth="6"
        fill="none"
      />
      <circle
        cx="130"
        cy="130"
        r="96"
        stroke="#4A6CF7"
        strokeWidth="2"
        fill="none"
      />

      <text
        fill="#EAF6FF"
        fontSize="15"
        fontWeight="600"
        letterSpacing="1.5"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          JIVAN SURAKSHA
        </textPath>
      </text>

      <text
        fill="#AFC6FF"
        fontSize="11"
        letterSpacing="1.5"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          YOUR AI DOCTOR
        </textPath>
      </text>

      {/* Simplified Caduceus for small size clarity */}
      <g
        transform="translate(130 130)"
        stroke="url(#ringGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        <line x1="0" y1="-36" x2="0" y2="36" />
        <path d="M -26 -26 C -12 -40 -4 -40 0 -26" />
        <path d="M 26 -26 C 12 -40 4 -40 0 -26" />
        <path d="M -7 -8 C -18 4 -18 18 -7 28" />
        <path d="M 7 -8 C 18 4 18 18 7 28" />
        <circle cx="0" cy="-42" r="3.5" fill="url(#ringGradient)" />
      </g>
    </svg>
  );
};

export default JivanSurakshaLogo;
