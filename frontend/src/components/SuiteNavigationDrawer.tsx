import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Layers,
  Flame,
  TrendingUp,
  Calculator,
  Activity,
  LayoutGrid,
  Sparkles,
  Coffee,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { ACV_URL, CAL_URL, OTT_URL, BEP_URL, CFR_URL, KO_FI_URL } from '../constants/links';

interface SuiteNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentApp: 'acv' | 'cal' | 'ott' | 'bep' | 'cfr';
}

interface SuiteAppItem {
  id: 'acv' | 'cal' | 'ott' | 'bep' | 'cfr';
  name: string;
  tagline: string;
  role: string;
  url: string;
  icon: LucideIcon;
  iconColor: string;
}

export const SuiteNavigationDrawer: React.FC<SuiteNavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentApp,
}) => {
  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const suiteApps: SuiteAppItem[] = [
    {
      id: 'acv',
      name: 'ACV • Ad Creative Validator',
      tagline: '32대 국내외 광고 매체 & 430+ 지면 세이프존 및 픽셀 규격 검수',
      role: '광고 소재 규격 검수',
      url: ACV_URL,
      icon: Layers,
      iconColor: '#A8FF1A',
    },
    {
      id: 'cal',
      name: 'CAL • Competitive Ad Lens',
      tagline: '메타·틱톡·구글 실시간 경쟁사 라이브 광고 소재 염탐 & 레퍼런스 발굴',
      role: '경쟁사 광고 염탐',
      url: CAL_URL,
      icon: Flame,
      iconColor: '#F34238',
    },
    {
      id: 'ott',
      name: 'OTT • Omni Trend Tracker',
      tagline: '네이버·구글·인스타그램 3대 채널 통합 검색 트렌드 & 연관 키워드',
      role: '통합 트렌드 발굴',
      url: OTT_URL,
      icon: TrendingUp,
      iconColor: '#38BDF8',
    },
    {
      id: 'bep',
      name: 'BEP Master • 유닛 이코노믹스',
      tagline: 'ROAS 손익분기점, 제품 마진율 역산, 마케팅 예산 한도 시뮬레이터',
      role: '손익분기점 시뮬레이션',
      url: BEP_URL,
      icon: Calculator,
      iconColor: '#FBBF24',
    },
    {
      id: 'cfr',
      name: 'FatigueRadar & StatWinner',
      tagline: 'A/B 테스트 통계 유의성 판정 & 7일 잔여 소재 수명 골든타임 예측',
      role: '피로도 & 통계 판정',
      url: CFR_URL,
      icon: Activity,
      iconColor: '#A8FF1A',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full border-l shadow-2xl flex flex-col z-10 overflow-hidden bg-white text-slate-900 border-slate-200 dark:bg-[#141416] dark:border-[#26272c] dark:text-white transition-colors">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#26272c] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold dark:bg-[#202126] dark:border-[#2e2f36] dark:text-[#A8FF1A]">
              <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-[#A8FF1A]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  Marketing Suite
                </h3>
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-[#202126] dark:text-[#A8FF1A] dark:border-[#2e2f36]">
                  5 Services
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#AEAEAE]">
                Antigravity 마케팅 인텔리전스 통합 도구 모음
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer dark:bg-[#1a1b1f] dark:hover:bg-[#26272c] dark:border-[#2e2f36] dark:text-[#AEAEAE] dark:hover:text-white"
            title="닫기 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-[11px] font-mono text-slate-400 dark:text-[#6E6E6E] uppercase tracking-wider font-semibold">
            Select Tool to Jump
          </div>

          {/* 5 App Cards */}
          <div className="space-y-3">
            {suiteApps.map((app) => {
              const isCurrent = app.id === currentApp;
              const IconComp = app.icon;

              const cardContent = (
                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col space-y-2.5 relative ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 dark:bg-[#1a1b1f] dark:border-[#A8FF1A]/50 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 dark:bg-[#1a1b1f] dark:hover:bg-[#202126] dark:border-[#26272c] dark:hover:border-[#2e2f36] cursor-pointer group'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 dark:bg-[#202126] dark:border-[#2e2f36]">
                        <IconComp className="w-4 h-4" style={{ color: app.iconColor }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{app.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-[#A8FF1A] font-semibold">
                          {app.role}
                        </span>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-[#A8FF1A] dark:text-black font-mono shadow-sm">
                        ● 현재 이용 중
                      </span>
                    ) : (
                      <div className="flex items-center text-[10px] text-slate-400 dark:text-[#AEAEAE] group-hover:text-slate-900 dark:group-hover:text-white font-mono transition-colors">
                        <span>이동</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-[#AEAEAE] leading-relaxed">
                    {app.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-[#26272c]/80 text-[10px] font-mono text-slate-400 dark:text-[#6E6E6E]">
                    <span>Local URL: {app.url.replace('http://', '')}</span>
                    <span className="text-emerald-700 dark:text-[#A8FF1A]">100% 로컬 무료</span>
                  </div>
                </div>
              );

              if (isCurrent) {
                return <div key={app.id}>{cardContent}</div>;
              }

              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block focus:outline-none"
                  onClick={onClose}
                >
                  {cardContent}
                </a>
              );
            })}
          </div>

          {/* Ko-fi Support Banner inside Drawer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-[#1a1b1f] dark:border-[#26272c] space-y-2 mt-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <Coffee className="w-4 h-4 text-amber-500" />
              <span>독립 개발자 후원 & 커피 선물</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#AEAEAE] leading-relaxed">
              본 스위트는 마케터의 칼퇴와 안심 검수를 위해 100% 무료로 개발 및 유지되고 있습니다.
            </p>
            <a
              href={KO_FI_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Ko-fi에서 따뜻한 커피 한 잔 응원하기 ↗</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0 dark:border-[#26272c] dark:bg-[#141416] dark:text-[#AEAEAE]">
          <span className="font-mono text-[10px]">Antigravity Suite v2.0</span>
          <span className="text-[11px] flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-[#A8FF1A]" />
            <span>Built for Modern Marketers</span>
          </span>
        </div>
      </div>
    </div>
  );
};
