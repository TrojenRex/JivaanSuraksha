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
                    <stop offset="0%" style={{ stopColor: '#00E0FF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4A00E0', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Opaque Background - Set to transparent */}
            <circle cx="50" cy="50" r="50" fill="none" />

            {/* Outer Circle */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="url(#logo-gradient)" strokeWidth="2.5" />
            
            {/* Inner Circle */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logo-gradient)" strokeWidth="1" strokeOpacity="0.7" />

            {/* Caduceus Symbol */}
            <g transform="translate(50, 50) scale(0.45)" stroke="url(#logo-gradient)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Staff */}
                <path d="M 0,-25 V 25" />
                {/* Wings */}
                <path d="M -20, -18 C -15,-28 15,-28 20,-18" />
                {/* Snakes */}
                <path d="M 10,25 C 20,15 20,-15 10,-25" />
                <path d="M -10,25 C -20,15 -20,-15 -10,-25" />
            </g>

            {/* Top Text - JIVAN SURAKSHA */}
            <path id="text-path-top" d="M 15,52 a 35,35 0 1,1 70,0" fill="none" />
            <text fill="url(#logo-gradient)" style={{ fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                <textPath href="#text-path-top" startOffset="50%" textAnchor="middle">
                    JIVAN SURAKSHA
                </textPath>
            </text>

            {/* Decorative Swirls */}
            <g fill="none" stroke="url(#logo-gradient)" strokeWidth="2.5">
                <path d="M 18,50 a 5,5 0 1,0 -10,0 a 5,5 0 1,0 10,0" />
                <path d="M 92,50 a 5,5 0 1,0 -10,0 a 5,5 0 1,0 10,0" />
            </g>

            {/* Bottom Text - YOUR AI DOCTOR */}
            <path id="text-path-bottom" d="M 28,50 a 22,22 0 1,0 44,0" fill="none" />
             <text fill="url(#logo-gradient)" style={{ fontSize: '7px', fontFamily: 'sans-serif', fontWeight: '600', letterSpacing: '0.15em' }}>
                <textPath href="#text-path-bottom" startOffset="50%" textAnchor="middle">
                    YOUR AI DOCTOR
                </textPath>
            </text>
        </svg>
    );
};

export default Logo;