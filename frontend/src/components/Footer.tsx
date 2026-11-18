import React from 'react';
import { ACVLogo } from './ACVLogo';

interface FooterProps {
  onOpenFeedback?: () => void;
  onOpenDonation?: () => void;
  onOpenLogo?: () => void;
  platformsCount?: number;
  placementsCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenFeedback,
  onOpenDonation,
  onOpenLogo,
  platformsCount = 32,
  placementsCount = 428,
}) => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-[#26272c] dark:bg-[#141416] py-10 text-center text-xs text-slate-500 dark:text-[#AEAEAE] space-y-3 flex flex-col items-center justify-center transition-colors">
      {/* ── Brand Emblem ── */}
      {onOpenLogo ? (
        <button
          type="button"
          onClick={onOpenLogo}
          className="group relative p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1a1b1f] transition-all cursor-pointer select-none"
          title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
        >
          <ACVLogo
            size={36}
            showText={false}
            className="opacity-80 group-hover:opacity-100 transition-transform group-hover:scale-105"
          />
        </button>
      ) : (
        <div className="p-2">
          <ACVLogo size={36} showText={false} className="opacity-80" />
        </div>
      )}

      {/* ── Line 1: Creator Statement ── */}
      <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
        Crafted with passion in 2026 by{' '}
        <strong className="text-emerald-700 dark:text-[#A8FF1A] font-extrabold">
          Owen O. Magnus
        </strong>
        .
      </p>

      {/* ── Line 2: Feedback & Coffee Sponsorship Action ── */}
      <p className="text-xs text-slate-500 dark:text-[#AEAEAE] font-medium leading-relaxed max-w-xl px-4">
        {onOpenFeedback ? (
          <button
            type="button"
            onClick={onOpenFeedback}
            className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 transition cursor-pointer"
            title="새로운 기능 제안 및 건의사항 남기기"
          >
            Feedbacks & feature ideas
          </button>
        ) : (
          <span>Feedbacks & feature ideas</span>
        )}{' '}
        are warmly welcomed, and{' '}
        {onOpenDonation ? (
          <button
            type="button"
            onClick={onOpenDonation}
            className="text-emerald-700 hover:text-emerald-800 dark:text-[#A8FF1A] dark:hover:text-[#b8ff33] font-bold underline decoration-emerald-500/30 dark:decoration-[#A8FF1A]/30 underline-offset-2 transition cursor-pointer inline-flex items-center space-x-1"
            title="개발자에게 커피 한 잔 선물하기"
          >
            <span>coffee sponsorships</span>
            <span>☕✨</span>
          </button>
        ) : (
          <span className="font-bold text-emerald-700 dark:text-[#A8FF1A]">
            coffee sponsorships ☕✨
          </span>
        )}{' '}
        keep our servers & AI APIs running!
      </p>

      {/* ── Line 3: Product Metadata & Desktop Optimization ── */}
      <p className="text-[11px] text-slate-400 dark:text-[#6E6E6E] font-medium">
        ACV (Ad Creative Validator) • {platformsCount} Advertising Platforms & {placementsCount} Placements Supported • PC 환경 최적화
      </p>
    </footer>
  );
};
