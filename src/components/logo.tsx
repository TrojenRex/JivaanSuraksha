import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(className)}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3B7BFF', stopOpacity: 1 }} />
                </linearGradient>
                <style>
                    {`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
                    .logo-text-top { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 11px; fill: url(#logo-gradient); text-anchor: middle; }
                    .logo-text-bottom { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 7px; fill: url(#logo-gradient); text-anchor: middle; letter-spacing: 0.1em; }
                    `}
                </style>
            </defs>

            {/* Outer Circle */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="url(#logo-gradient)" strokeWidth="2" />
            
            {/* Inner Circle */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Text Paths */}
            <path id="text-path-top" d="M 15,50 a 35,35 0 1,1 70,0" fill="none" />
            <path id="text-path-bottom" d="M 25,50 a 25,25 0 1,0 50,0" fill="none" />

            {/* Top Text */}
            <text className="logo-text-top">
                <textPath href="#text-path-top" startOffset="50%">JIVAN SURAKSHA</textPath>
            </text>

            {/* Bottom Text */}
            <text className="logo-text-bottom" dy="1">
                <textPath href="#text-path-bottom" startOffset="50%">YOUR AI DOCTOR</textPath>
            </text>

            {/* Caduceus Symbol */}
            <g transform="translate(50, 50) scale(0.4)" stroke="url(#logo-gradient)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Staff */}
                <path d="M 0,-25 V 25" />
                {/* Wings */}
                <path d="M -20, -18 C -15,-28 15,-28 20,-18" />
                <path d="M -18, -13 C -13,-23 13,-23 18,-13" />
                {/* Snakes */}
                <path d="M 10,25 C 20,15 20,-15 10,-25" />
                <path d="M -10,25 C -20,15 -20,-15 -10,-25" />
                {/* Snake Heads */}
                <circle cx="10" cy="-25" r="3" fill="none" strokeWidth="2.5" />
                <circle cx="-10" cy="-25" r="3" fill="none" strokeWidth="2.5" />
            </g>

            {/* Decorative Swirls */}
            <g fill="none" stroke="url(#logo-gradient)" strokeWidth="2">
                <path d="M12,50 a5,5 0 1,0 -10,0 a5,5 0 1,0 10,0z" transform="rotate(-90 7 50)" />
                <path d="M88,50 a5,5 0 1,1 10,0 a5,5 0 1,1 -10,0z" transform="rotate(90 93 50)" />
            </g>
        </svg>
    );
};

export default Logo;
