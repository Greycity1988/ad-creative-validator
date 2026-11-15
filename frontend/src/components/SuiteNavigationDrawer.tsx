import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Layers,
  Flame,
  TrendingUp,
  Calculator,
  LayoutGrid,
  Sparkles,
  Coffee,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { ACV_URL, CAL_URL, OTT_URL, BEP_URL, KO_FI_URL } from '../constants/links';

interface SuiteNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentApp: 'acv' | 'cal' | 'ott' | 'bep';
}

interface SuiteAppItem {
  id: 'acv' | 'cal' | 'ott' | 'bep';
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
      tagline: 'EU DSA 공식 API 기반 글로벌 위너 소재 발굴 & AI 한국어 벤치마킹',
      role: '경쟁사 광고 인텔리전스',
      url: CAL_URL,
      icon: Flame,
      iconColor: '#FF6B00',
    },
    {
      id: 'ott',
      name: 'OTT • Omni Trend Tracker',
      tagline: '네이버 데이터랩 • 구글 트렌드 • SNS 다채널 검색량 및 관심도 비교',
      role: '크로스 채널 트렌드',
      url: OTT_URL,
      icon: TrendingUp,
      iconColor: '#38BDF8',
    },
    {
      id: 'bep',
      name: 'BEP Master • Unit Economics',
      tagline: '소비자 판매가·원가·수수료 기반 손익분기 ROAS & 한계 CPC 역산 계산기',
      role: '손익분기 & 한계 CPC',
      url: BEP_URL,
      icon: Calculator,
      iconColor: '#A8FF1A',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-full border-l border-[#26272c] shadow-2xl flex flex-col z-10 overflow-hidden text-white"
        style={{ backgroundColor: '#141416' }}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#26272c] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#202126] border border-[#2e2f36] text-[#A8FF1A] flex items-center justify-center font-bold">
              <LayoutGrid className="w-5 h-5 text-[#A8FF1A]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Marketing Suite
                </h3>
                <span className="text-[10px] font-mono font-semibold bg-[#202126] text-[#AEAEAE] border border-[#2e2f36] px-2 py-0.5 rounded-full">
                  4 Services
                </span>
              </div>
              <p className="text-[11px] text-[#AEAEAE]">
                Antigravity 마케팅 인텔리전스 통합 도구 모음
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1a1b1f] hover:bg-[#26272c] border border-[#2e2f36] flex items-center justify-center text-[#AEAEAE] hover:text-white transition-colors cursor-pointer"
            title="닫기 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-[11px] font-mono text-[#6E6E6E] uppercase tracking-wider font-semibold">
            Select Tool to Jump
          </div>

          {/* 4 App Cards */}
          <div className="space-y-3">
            {suiteApps.map((app) => {
              const isCurrent = app.id === currentApp;
              const IconComp = app.icon;

              const cardContent = (
                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col space-y-2.5 relative ${
                    isCurrent
                      ? 'bg-[#1a1b1f] border-[#A8FF1A]/50 shadow-[0_0_15px_rgba(168,255,26,0.1)]'
                      : 'bg-[#1a1b1f] hover:bg-[#202126] border-[#26272c] hover:border-[#2e2f36] cursor-pointer group'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#202126] border border-[#2e2f36] flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-4 h-4" style={{ color: app.iconColor }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>{app.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#A8FF1A] font-semibold">
                          {app.role}
                        </span>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A8FF1A] text-black font-mono shadow-sm">
                        ● 현재 이용 중
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#AEAEAE] group-hover:text-white transition-colors flex items-center space-x-1 font-mono">
                        <span>이동</span>
                        <ExternalLink className="w-3 h-3 text-[#AEAEAE] group-hover:text-white" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#AEAEAE] leading-relaxed">
                    {app.tagline}
                  </p>
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
                  className="block text-inherit no-underline"
                >
                  {cardContent}
                </a>
              );
            })}
          </div>

          {/* Recommended Marketing Routine Box */}
          <div className="p-4 rounded-2xl bg-[#1a1b1f] border border-[#26272c] space-y-2.5">
            <div className="flex items-center space-x-2 text-white font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#A8FF1A]" />
              <span>4단계 마케팅 연계 권장 루틴</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#AEAEAE] leading-relaxed">
              <div className="flex items-start space-x-1.5">
                <span className="font-mono font-bold text-[#A8FF1A]">01.</span>
                <span><strong>OTT</strong>에서 급상승 검색 키워드와 오디언스 연령·성별 확인</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="font-mono font-bold text-[#A8FF1A]">02.</span>
                <span><strong>CAL</strong>에서 해외 검증된 30일+ 위너 광고 소재 카피 벤치마킹</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="font-mono font-bold text-[#A8FF1A]">03.</span>
                <span><strong>ACV</strong>에서 32대 매체 지면별 세이프존 및 픽셀 규격 원클릭 검수</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="font-mono font-bold text-[#A8FF1A]">04.</span>
                <span><strong>BEP Master</strong>에서 손익분기 ROAS와 최대 허용 CPC를 산출하여 집행</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#26272c] bg-[#141416] flex items-center justify-between text-xs text-[#AEAEAE] flex-shrink-0">
          <a
            href={KO_FI_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-[11px] hover:text-white transition-colors"
          >
            <Coffee className="w-3.5 h-3.5 text-[#FFDD00]" />
            <span>Ko-fi 커피 후원하기</span>
          </a>

          <span className="flex items-center space-x-1 text-[11px] text-[#6E6E6E]">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Owen O. Magnus</span>
          </span>
        </div>
      </div>
    </div>
  );
};
