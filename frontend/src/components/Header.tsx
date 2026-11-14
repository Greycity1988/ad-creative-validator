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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={onOpenLogo}
            className="group relative p-1.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] hover:border-black/15 transition-all cursor-pointer flex-shrink-0 shadow-soft-xs"
            title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
          >
            <ACVLogo size={40} showText={false} className="transition-transform duration-200 group-hover:scale-105" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-white bg-[#0A0A0A] px-2 py-0.5 rounded-md shadow-soft-xs">
                ACV
              </span>
              <h1 className="text-base font-bold tracking-tight text-ink-primary">
                광고 소재 검수 시스템
              </h1>
              <span className="text-[11px] font-semibold text-ink-secondary bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full">
                v2.1 Pro
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 bg-black/[0.03] text-ink-secondary text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-black/[0.05]" title="본 검수 시스템은 정밀 픽셀 대조 및 세이프존 시각화를 위해 PC 환경에 최적화되어 있습니다.">
                💻 PC 환경 최적화
              </span>
            </div>
            <p className="text-[12px] text-ink-muted font-normal mt-0.5 hidden sm:block">
              Ad Creative Guideline Validator — 32대 국내외 광고 매체 & 430+ 공식 지면 원클릭 규격 검수
            </p>
          </div>
        </div>

        {/* Action Buttons: Guide + Feedback + Donation + Privacy */}
        <div className="flex items-center space-x-2">
          {/* Privacy Indicator Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[11px] tracking-wide">100% 로컬 메모리 검증</span>
          </div>

          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 hover:border-black/20 text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-soft-xs"
            title="이 도구가 왜 필요한지, 어떨 때 쓰면 좋은지 활용 가이드를 확인합니다."
          >
            <BookOpen className="w-3.5 h-3.5 text-ink-tertiary" />
            <span className="font-medium">📖 사용 가이드</span>
          </button>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 hover:border-black/20 text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-soft-xs"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 text-ink-tertiary" />
            <span className="font-medium">💡 건의 / 규격 제보</span>
          </button>

          <button
            type="button"
            onClick={onOpenDonation}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-amber-200/70 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold transition-all cursor-pointer shadow-soft-xs"
            title="개발자에게 커피 한 잔을 선물하여 도구 운영을 응원해주세요!"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>☕ 커피 후원하기</span>
          </button>

          {/* OTT Trend Tracker Inter-service Switcher */}
          {SHOW_OTT_LINK && (
          <a
            href={OTT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 border border-black text-xs font-bold transition-all cursor-pointer shadow-soft-xs"
            title="네이버·구글·핀터레스트·메타 4대 채널 통합 키워드 트렌드 추적 도구(OTT)로 이동"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">OTT</span>
            <span className="hidden sm:inline">트렌드 분석</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </a>
          )}
        </div>
      </div>
    </header>
  );
};
