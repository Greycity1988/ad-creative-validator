import React from 'react';
import { MessageSquare, Coffee, BookOpen } from 'lucide-react';
import { ACVLogo } from './ACVLogo';

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
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line/90 shadow-soft-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={onOpenLogo}
            className="group relative p-1.5 rounded-2xl bg-canvas hover:bg-canvas-subtle border border-line transition-all cursor-pointer flex-shrink-0"
            title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
          >
            <ACVLogo size={40} showText={false} className="transition-transform duration-200 group-hover:scale-105" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-accent bg-accent-light px-2 py-0.5 rounded-md border border-accent/15">
                ACV
              </span>
              <h1 className="text-base font-bold tracking-tight text-ink-primary">
                광고 소재 검수 시스템
              </h1>
              <span className="text-[11px] font-semibold text-ink-tertiary bg-canvas-subtle border border-line px-2 py-0.5 rounded-full">
                v2.1 Pro
              </span>
            </div>
            <p className="text-[12px] text-ink-muted font-normal mt-0.5 hidden sm:block">
              Ad Creative Guideline Validator — 15대 주요 광고 매체 & 160+ 공식 지면 정밀 검수
            </p>
          </div>
        </div>

        {/* Action Buttons: Guide + Feedback + Donation + Privacy */}
        <div className="flex items-center space-x-2">
          {/* Privacy Indicator Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-status-pass-bg border border-status-pass-border text-status-pass-text text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-status-pass-dot animate-pulse" />
            <span className="font-semibold text-[11px] tracking-wide">100% 로컬 메모리 검증</span>
          </div>

          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-line bg-surface hover:bg-canvas text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-soft-xs"
            title="이 도구가 왜 필요한지, 어떨 때 쓰면 좋은지 활용 가이드를 확인합니다."
          >
            <BookOpen className="w-3.5 h-3.5 text-ink-tertiary" />
            <span className="font-medium">사용 가이드</span>
          </button>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-line bg-surface hover:bg-canvas text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-soft-xs"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 text-ink-tertiary" />
            <span className="font-medium">규격 제보</span>
          </button>

          <button
            type="button"
            onClick={onOpenDonation}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-amber-200/80 bg-amber-50 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold transition-all cursor-pointer shadow-soft-xs"
            title="개발자에게 커피 한 잔을 선물하여 도구 운영을 응원해주세요!"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>커피 후원</span>
          </button>
        </div>
      </div>
    </header>
  );
};
