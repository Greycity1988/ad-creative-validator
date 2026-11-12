import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ad Creative Guideline Validator — 7대 주요 광고 매체 규격 자동 검수
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>7개 매체 규격 지원</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI 텍스트 비율 분석</span>
          </div>
        </div>
      </div>
    </header>
  );
};
