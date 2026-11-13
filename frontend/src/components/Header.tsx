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
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={onOpenLogo}
            className="group relative p-1 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer flex-shrink-0"
            title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-md group-hover:bg-blue-500/25 transition-all" />
            <ACVLogo size={52} showText={false} className="relative z-10 transition-transform duration-200 group-hover:scale-105" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                <span className="text-blue-400">ACV</span>
                <span className="text-base font-bold font-sans text-slate-100">광고 소재 검수 시스템</span>
              </h1>
              <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-700/50">
                v2.1 Pro
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 text-[11px] px-2 py-0.5 rounded-full font-medium border border-slate-700/60" title="본 검수 시스템은 정밀 픽셀 대조 및 세이프존 시각화를 위해 PC 환경에 최적화되어 있습니다.">
                💻 PC 환경 최적화
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ad Creative Guideline Validator — 32대 국내외 광고 매체 & 300+ 공식 지면 원클릭 규격 검수
            </p>
          </div>
        </div>

        {/* Action Buttons: Guide + Feedback + Donation */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-blue-700/80 bg-blue-900/40 hover:bg-blue-800/60 text-xs font-semibold text-blue-200 hover:text-white transition-all cursor-pointer shadow-2xs"
            title="이 도구가 왜 필요한지, 어떨 때 쓰면 좋은지 활용 가이드를 확인합니다."
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>📖 사용 가이드</span>
          </button>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
            <span>💡 건의 / 규격 제보</span>
          </button>

          <button
            type="button"
            onClick={onOpenDonation}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-500/60 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 text-amber-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="개발자에게 커피 한 잔을 선물하여 도구 운영을 응원해주세요!"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>☕ 커피 후원하기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
