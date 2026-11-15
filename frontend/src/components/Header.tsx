import React from 'react';
import { MessageSquare, Coffee, HelpCircle, Menu } from 'lucide-react';
import { ACVLogo } from './ACVLogo';

interface HeaderProps {
  onOpenFeedback: () => void;
  onOpenDonation: () => void;
  onOpenGuide: () => void;
  onOpenLogo?: () => void;
  onOpenSuiteDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFeedback,
  onOpenDonation,
  onOpenGuide,
  onOpenLogo,
  onOpenSuiteDrawer,
}) => {
  return (
    <header
      className="border-b border-[#26272c] sticky top-0 z-40 shadow-xl"
      style={{ backgroundColor: '#141416' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenLogo}
            className="group relative p-1.5 rounded-2xl bg-[#000000] hover:bg-[#1a1b1f] border border-[#26272c] hover:border-[#3a3b42] transition-all cursor-pointer flex-shrink-0 shadow-inner"
            title="클릭하여 ACV 로고 아이덴티티 및 고해상도 엠블럼 크게 보기"
          >
            <ACVLogo size={38} showText={false} className="transition-transform duration-200 group-hover:scale-105" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-black bg-[#A8FF1A] px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(168,255,26,0.25)] flex-shrink-0">
                ACV
              </span>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                광고 소재 검수 시스템
              </h1>
              <span className="text-[10px] font-mono font-semibold text-[#AEAEAE] bg-[#202126] border border-[#2e2f36] px-2 py-0.5 rounded-full flex-shrink-0">
                v2.1 Pro
              </span>
              <span className="hidden xl:inline-flex items-center space-x-1 bg-[#202126] text-[#AEAEAE] text-[10px] px-2.5 py-0.5 rounded-full font-medium border border-[#2e2f36] whitespace-nowrap flex-shrink-0" title="본 검수 시스템은 정밀 픽셀 대조 및 세이프존 시각화를 위해 PC 환경에 최적화되어 있습니다.">
                💻 PC 환경 최적화
              </span>
            </div>
            <p className="text-[11px] text-[#AEAEAE] font-normal mt-0.5 hidden sm:block truncate max-w-xs md:max-w-sm lg:max-w-md">
              Ad Creative Guideline Validator — 32대 국내외 광고 매체 & 430+ 공식 지면 원클릭 규격 검수
            </p>
          </div>
        </div>

        {/* Action Pills & Suite Trigger */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Guide Modal Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-full text-white bg-[#202126] hover:bg-[#2c2d33] border border-[#2e2f36] transition shadow-sm cursor-pointer whitespace-nowrap"
            title="이 도구가 왜 필요한지, 어떨 때 쓰면 좋은지 활용 가이드를 확인합니다."
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-[#A8FF1A] flex-shrink-0" strokeWidth={2} />
            <span>Guide</span>
          </button>

          {/* Feedback Button */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-full text-white bg-[#202126] hover:bg-[#2c2d33] border border-[#2e2f36] transition shadow-sm cursor-pointer whitespace-nowrap"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#AEAEAE] flex-shrink-0" strokeWidth={2} />
            <span>Feedback</span>
          </button>

          {/* Coffee Support Button */}
          <button
            type="button"
            onClick={onOpenDonation}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-full text-white bg-[#202126] hover:bg-[#2c2d33] border border-[#2e2f36] transition shadow-sm cursor-pointer whitespace-nowrap"
            title="개발자에게 커피 한 잔을 선물하여 도구 운영을 응원해주세요!"
          >
            <Coffee className="w-3.5 h-3.5 mr-1.5 text-[#AEAEAE]" strokeWidth={2} />
            <span>Coffee</span>
          </button>

          {/* Security Status Pill */}
          <div className="hidden lg:inline-flex items-center space-x-1.5 h-9 px-3.5 rounded-full bg-[#1a1b1f] border border-[#2e2f36] text-[#AEAEAE] text-xs font-semibold whitespace-nowrap flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8FF1A] animate-pulse flex-shrink-0" />
            <span className="tracking-wide">100% 로컬 메모리 검증</span>
          </div>

          {/* Suite Drawer Trigger Button */}
          {onOpenSuiteDrawer && (
            <button
              type="button"
              onClick={onOpenSuiteDrawer}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-full text-white bg-[#202126] hover:bg-[#2c2d33] border border-[#2e2f36] transition shadow-sm ml-1 cursor-pointer whitespace-nowrap"
              title="마케팅 스위트 전체 서비스 이동"
            >
              <Menu className="w-4 h-4 mr-1.5 text-[#A8FF1A]" />
              <span>Suite</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
