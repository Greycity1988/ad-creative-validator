import React from 'react';
import { Theme } from '../utils/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className={`relative inline-flex items-center justify-between w-[68px] h-[34px] rounded-full p-1 transition-colors duration-300 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A8FF1A] flex-shrink-0 ${
        isDark
          ? 'bg-[#18181B] border border-[#2e3036] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
          : 'bg-[#ECECEC] border border-[#CBD5E1] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]'
      }`}
      title={isDark ? '라이트 모드로 전환 (Light Mode)' : '다크 모드로 전환 (Dark Mode)'}
      aria-label="Toggle Dark and Light theme"
    >
      {/* ── Left Area: Sun Icon with 12 Radial Rays (Visible in Light Mode) ── */}
      <div
        className={`w-[26px] h-[26px] flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'opacity-0 scale-75 pointer-events-none'
            : 'opacity-100 scale-100 text-[#18181B]'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[17px] h-[17px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {/* Central Sun Ring */}
          <circle cx="12" cy="12" r="4.2" strokeWidth="2.2" />
          {/* 12 Precise Radial Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="1.8"
              x2="12"
              y2="4.2"
              transform={`rotate(${deg} 12 12)`}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* ── Right Area: Crescent Moon + 2 Sparkle Stars (Visible in Dark Mode) ── */}
      <div
        className={`w-[26px] h-[26px] flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'opacity-100 scale-100 text-white'
            : 'opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[17px] h-[17px]"
          fill="currentColor"
        >
          {/* Crescent Moon */}
          <path d="M12.2 2.2a9.2 9.2 0 0 0-.2 18.4 9.3 9.3 0 0 0 8.5-5.6.7.7 0 0 0-.8-.9 7.2 7.2 0 1 1-7.7-11.4.7.7 0 0 0 .2-.5z" />
          {/* Upper Sparkle Star (4-point) */}
          <path d="M19 2.5c0 1.2.9 2 2 2-1.1 0-2 .8-2 2 0-1.2-.9-2-2-2 1.1 0 2-.8 2-2z" />
          {/* Lower Sparkle Star (4-point, slightly smaller) */}
          <path d="M21 8c0 .9.7 1.4 1.4 1.4-.7 0-1.4.5-1.4 1.4 0-.9-.7-1.4-1.4-1.4.7 0 1.4-.5 1.4-1.4z" />
        </svg>
      </div>

      {/* ── Sliding Tactile Knob ── */}
      <div
        className={`absolute top-1 left-1 w-[26px] h-[26px] rounded-full transition-all duration-300 ease-in-out pointer-events-none ${
          isDark
            ? 'translate-x-0 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.45),0_0_1px_rgba(255,255,255,0.8)]'
            : 'translate-x-[34px] bg-[#18181B] shadow-[0_2px_5px_rgba(0,0,0,0.25)]'
        }`}
      />
    </button>
  );
};
