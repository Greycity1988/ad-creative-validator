import React from 'react';
import { Sun, Moon } from 'lucide-react';
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
      onClick={onToggle}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap shadow-sm ${
        isDark
          ? 'bg-[#202126] hover:bg-[#2c2d33] text-white border-[#2e2f36]'
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-soft-xs'
      }`}
      title={isDark ? '라이트 모드로 전환 (Light Mode)' : '다크 모드로 전환 (Dark Mode)'}
      aria-label="Toggle Dark and Light theme"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[#A8FF1A]" strokeWidth={2.2} />
          <span className="font-mono text-[11px] font-bold">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.2} />
          <span className="font-mono text-[11px] font-bold">Dark</span>
        </>
      )}
    </button>
  );
};
