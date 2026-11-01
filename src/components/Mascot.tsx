import React from 'react';

export type MascotMood = 'happy' | 'thinking' | 'solving' | 'celebrating' | 'waving';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* Soft glowing aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-orange-400/30 to-pink-400/20 rounded-full blur-md animate-pulse" />

      {/* SVG Mascot "Nogi" */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Body Gradient: Warm cheerful Peach/Orange */}
          <linearGradient id="nogiBodyGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA63D" />
            <stop offset="50%" stopColor="#FF7A18" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Cheeks blush */}
          <linearGradient id="blushGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF4F79" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF85A2" stopOpacity="0.2" />
          </linearGradient>

          {/* Eye shine */}
          <radialGradient id="eyeShine" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#1E293B" />
          </radialGradient>
        </defs>

        {/* Mascot Body Shape (Plump, friendly rounded companion with arm) */}
        <path
          d="M 28 26 
             C 32 14, 68 14, 72 26 
             C 76 34, 82 48, 86 64 
             C 89 76, 78 88, 64 88 
             C 56 88, 44 88, 36 88 
             C 22 88, 11 76, 14 64 
             C 18 48, 24 34, 28 26 Z"
          fill="url(#nogiBodyGrad)"
          stroke="#C2410C"
          strokeWidth="1.8"
        />

        {/* Waving / Gesturing Right Arm */}
        {mood === 'waving' || mood === 'celebrating' || mood === 'happy' ? (
          <path
            d="M 76 42 C 86 36, 92 26, 90 20 C 87 15, 80 18, 77 26"
            fill="url(#nogiBodyGrad)"
            stroke="#C2410C"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="animate-bounce"
            style={{ transformOrigin: '76px 42px', animationDuration: '2s' }}
          />
        ) : (
          <path
            d="M 78 52 C 86 54, 88 64, 84 70"
            fill="url(#nogiBodyGrad)"
            stroke="#C2410C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}

        {/* Left Arm (Relaxed or holding book) */}
        <path
          d="M 22 52 C 14 54, 12 64, 16 70"
          fill="url(#nogiBodyGrad)"
          stroke="#C2410C"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Eyes based on Mood */}
        {mood === 'celebrating' ? (
          // Starry Joy Eyes
          <g fill="#1E293B">
            <path d="M 36 42 Q 40 37 44 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 56 42 Q 60 37 64 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : mood === 'thinking' ? (
          // Curious Looking Up
          <g>
            <circle cx="38" cy="40" r="5.5" fill="#1E293B" />
            <circle cx="58" cy="40" r="5.5" fill="#1E293B" />
            <circle cx="40" cy="38" r="2.2" fill="#FFFFFF" />
            <circle cx="60" cy="38" r="2.2" fill="#FFFFFF" />
            {/* Thinking brow */}
            <path d="M 33 33 Q 38 31 43 35" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 57 35 Q 62 31 67 33" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : (
          // Big Friendly Anime-style Tutor Eyes
          <g>
            <circle cx="38" cy="44" r="5.5" fill="#1E293B" />
            <circle cx="62" cy="44" r="5.5" fill="#1E293B" />
            <circle cx="40" cy="42" r="2" fill="#FFFFFF" />
            <circle cx="64" cy="42" r="2" fill="#FFFFFF" />
            <circle cx="37" cy="46" r="1" fill="#FFFFFF" />
            <circle cx="61" cy="46" r="1" fill="#FFFFFF" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="30" cy="52" r="4.5" fill="url(#blushGrad)" />
        <circle cx="70" cy="52" r="4.5" fill="url(#blushGrad)" />

        {/* Mouth */}
        {mood === 'celebrating' || mood === 'happy' || mood === 'waving' ? (
          <path
            d="M 43 53 Q 50 63 57 53"
            fill="#991B1B"
            stroke="#7F1D1D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : mood === 'thinking' ? (
          <ellipse cx="50" cy="55" rx="3.5" ry="2" fill="#7F1D1D" />
        ) : (
          <path d="M 45 54 Q 50 59 55 54" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Spark of Knowledge Antenna on top */}
        <path d="M 50 18 Q 50 8 56 6" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="56" cy="6" r="3.5" fill="#FBBF24" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="56" cy="6" r="2.5" fill="#FEF08A" />

        {/* Mini Glasses when solving */}
        {mood === 'solving' && (
          <g stroke="#3B82F6" strokeWidth="1.5" fill="none">
            <circle cx="38" cy="44" r="7" />
            <circle cx="62" cy="44" r="7" />
            <path d="M 45 44 L 55 44" />
          </g>
        )}
      </svg>

      {/* Graduation Cap / NG Smart Badge */}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow border-2 border-white dark:border-slate-800">
          NG
        </span>
      )}
    </div>
  );
};
