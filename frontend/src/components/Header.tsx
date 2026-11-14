import React from 'react';
import { MessageSquare, Coffee, BookOpen, TrendingUp, ExternalLink } from 'lucide-react';
import { ACVLogo } from './ACVLogo';
import { OTT_URL, SHOW_OTT_LINK } from '../constants/links';

interface HeaderProps {
  onOpenFeedback: () => void;
  onOpenDonation: () => void;
  onOpenGuide: () => void;
  onOpenLogo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFeedback,
  onOpenDonation,
  onOpenGuide,
  onOpenLogo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* ── Left Column: Brand Logo & Title ── */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenLogo}
            className="group relative p-1.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] hover:border-black/15 transition-all cursor-pointer flex-shrink-0 shadow-soft-xs"
            title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
          >
            <ACVLogo size={42} showText={false} className="transition-transform duration-200 group-hover:scale-105" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-white bg-[#0A0A0A] px-2 py-0.5 rounded-md shadow-soft-xs flex-shrink-0">
                ACV
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-ink-primary whitespace-nowrap">
                광고 소재 검수 시스템
              </h1>
              <span className="text-[10px] font-mono font-semibold text-neutral-600 bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full flex-shrink-0">
                v2.1 Pro
              </span>
              <span className="hidden xl:inline-flex items-center space-x-1 bg-black/[0.03] text-neutral-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium border border-black/[0.05] whitespace-nowrap flex-shrink-0" title="본 검수 시스템은 정밀 픽셀 대조 및 세이프존 시각화를 위해 PC 환경에 최적화되어 있습니다.">
                💻 PC 환경 최적화
              </span>
            </div>
            <p className="text-[11px] text-ink-muted font-normal mt-0.5 hidden sm:block truncate max-w-xs md:max-w-sm lg:max-w-md">
              Ad Creative Guideline Validator — 32대 국내외 광고 매체 & 430+ 공식 지면 원클릭 규격 검수
            </p>
          </div>
        </div>

        {/* ── Center Column: Lifemed Style Nav Links (Image 2 style) ── */}
        <nav className="hidden md:flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1.5 h-9 px-4 rounded-full bg-white hover:bg-neutral-50 border border-black/[0.08] hover:border-black/20 text-xs font-semibold text-neutral-700 hover:text-black shadow-soft-xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            title="이 도구가 왜 필요한지, 어떨 때 쓰면 좋은지 활용 가이드를 확인합니다."
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <span className="whitespace-nowrap">📖 사용 가이드</span>
          </button>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center space-x-1.5 h-9 px-4 rounded-full bg-white hover:bg-neutral-50 border border-black/[0.08] hover:border-black/20 text-xs font-semibold text-neutral-700 hover:text-black shadow-soft-xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="whitespace-nowrap">💡 건의 / 규격 제보</span>
          </button>

          <button
            type="button"
            onClick={onOpenDonation}
            className="inline-flex items-center space-x-1.5 h-9 px-4 rounded-full bg-white hover:bg-neutral-50 border border-black/[0.08] hover:border-black/20 text-xs font-semibold text-neutral-700 hover:text-black shadow-soft-xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            title="개발자에게 커피 한 잔을 선물하여 도구 운영을 응원해주세요!"
          >
            <Coffee className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="whitespace-nowrap">☕ 커피 후원하기</span>
          </button>
        </nav>

        {/* ── Right Column: Security Status + Primary Action (Lifemed 'Get Started' style) ── */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          {/* Lifemed Violet Security Pill */}
          <div className="hidden lg:inline-flex items-center space-x-1.5 h-9 px-3.5 rounded-full bg-violet-50/90 border border-violet-200/90 text-violet-800 text-xs font-semibold whitespace-nowrap flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
            <span className="tracking-wide">100% 로컬 메모리 검증</span>
          </div>

          {/* OTT Trend Tracker Inter-service Switcher (Lifemed Jet Black Pill) */}
          {SHOW_OTT_LINK && (
            <a
              href={OTT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 h-9 px-4.5 rounded-full bg-[#0A0A0A] hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap flex-shrink-0"
              title="키워드 트렌드 도구(OTT)로 이동"
            >
              <TrendingUp className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="font-mono">OTT</span>
              <span className="hidden sm:inline whitespace-nowrap">트렌드 분석</span>
              <ExternalLink className="w-3 h-3 text-white/60 flex-shrink-0" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
