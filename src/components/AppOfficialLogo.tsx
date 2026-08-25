import React from 'react';

interface AppOfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
}

export default function AppOfficialLogo({
  className = '',
  size = 'md',
  showText = false
}: AppOfficialLogoProps) {
  // Dimensions based on size
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
    '2xl': 'w-28 h-28 rounded-3xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Al-Captain Green Football App Emblem */}
      <div
        className={`relative ${sizeClasses[size]} bg-gradient-to-b from-[#1b6833] via-[#0d4520] to-[#082a13] border-2 border-[#3cd070] shadow-lg shadow-emerald-900/40 overflow-hidden flex items-center justify-center shrink-0 p-1`}
        style={{ boxShadow: '0 0 15px rgba(46, 204, 113, 0.35)' }}
      >
        {/* Tactical Pitch Lines Background */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="w-full h-full border border-emerald-300/40 grid grid-cols-2 grid-rows-2"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8/12 h-8/12 rounded-full border border-emerald-300/40"></div>
          </div>
        </div>

        {/* Central Official High-Detail Football Vector */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ball Outer Circle */}
          <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#123d20" strokeWidth="4" />

          {/* Central Pentagon (Dark Forest Green) */}
          <polygon
            points="50,28 69,42 62,64 38,64 31,42"
            fill="#123d20"
            stroke="#2ebd64"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Radiating Seams & Surrounding Panels */}
          {/* Top Panel */}
          <path
            d="M50 28 L50 7 M31 42 L13 29 M69 42 L87 29 M62 64 L79 81 M38 64 L21 81"
            stroke="#123d20"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Top connecting patch */}
          <polygon
            points="42,7 58,7 63,18 37,18"
            fill="#1b4d29"
            stroke="#123d20"
            strokeWidth="2.5"
          />
          {/* Left patch */}
          <polygon
            points="7,44 13,29 23,35 15,57"
            fill="#1b4d29"
            stroke="#123d20"
            strokeWidth="2.5"
          />
          {/* Right patch */}
          <polygon
            points="93,44 87,29 77,35 85,57"
            fill="#1b4d29"
            stroke="#123d20"
            strokeWidth="2.5"
          />
          {/* Bottom Left patch */}
          <polygon
            points="21,81 33,90 41,80 28,70"
            fill="#1b4d29"
            stroke="#123d20"
            strokeWidth="2.5"
          />
          {/* Bottom Right patch */}
          <polygon
            points="79,81 67,90 59,80 72,70"
            fill="#1b4d29"
            stroke="#123d20"
            strokeWidth="2.5"
          />

          {/* Inner Gloss / Highlight Curve */}
          <path
            d="M20 25 Q35 14 55 14"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>

        {/* Small Bottom Label */}
        {size === 'xl' || size === '2xl' ? (
          <div className="absolute bottom-1 inset-x-0 text-center z-20">
            <span className="text-[7px] font-black text-white tracking-wider uppercase drop-shadow block leading-none font-sans">
              AL-CAPTAIN
            </span>
            <span className="text-[9px] font-black text-emerald-300 drop-shadow block leading-none font-['Cairo']">
              الكابتن
            </span>
          </div>
        ) : null}
      </div>

      {/* Optional Brand Text Beside Logo */}
      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white text-lg tracking-tight font-['Cairo']">
              الكابتن
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AL-CAPTAIN
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            منصة حجز الملاعب والبطولات في سوريا
          </span>
        </div>
      )}
    </div>
  );
}
