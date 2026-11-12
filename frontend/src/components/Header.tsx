import React from 'react';
import { MessageSquare, Coffee } from 'lucide-react';

interface HeaderProps {
  onOpenFeedback: () => void;
  onOpenDonation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedback, onOpenDonation }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-inner text-white flex items-center justify-center">
            <span className="text-2xl" role="img" aria-label="camera">📸</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                광고 소재 검수 시스템
              </h1>
              <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-700/50">
                v2.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ad Creative Guideline Validator — 11대 주요 광고 매체 & 100+ 공식 지면 원클릭 규격 검수
            </p>
          </div>
        </div>

        {/* Action Buttons: Feedback + Donation */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="새로운 광고 매체/지면 추가 요청이나 의견을 남겨주세요."
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
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
