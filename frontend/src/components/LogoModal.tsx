import React from 'react';
import { X, Sparkles, Download, Layers } from 'lucide-react';
import { ACVLogo } from './ACVLogo';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    const link = document.createElement('a');
    link.href = '/favicon.svg';
    link.download = 'acv-logo.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-xl overflow-hidden animate-scaleUp flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>ACV 브랜드 아이덴티티 & 엠블럼</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  NIKE ACG HOMAGE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ad Creative Validator — 차세대 광고 규격 자동 검수 시스템
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* High-Resolution Emblem Showcase Box */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-inner overflow-hidden group">
            {/* Ambient Radial Glow */}
            <div className="absolute w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-500" />
            
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />

            <div className="relative z-10 transition-transform duration-300 hover:scale-105">
              <ACVLogo size={180} showText={false} />
            </div>

            <div className="relative z-10 text-center mt-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-black font-mono tracking-widest text-white">
                  ACV
                </span>
                <span className="text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
                  SYSTEM EMBLEM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                나이키 ACG 아웃도어 기어 감성을 오마주한 퍼포먼스 마케팅 테크 엠블럼
              </p>
            </div>
          </div>

          {/* Design Anatomy Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>로고 디자인 디테일 분석 (Design Anatomy)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Feature A */}
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/40 flex items-center justify-center font-mono">A</span>
                  <span>Accuracy & Ad</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  삼각형의 정점을 형성하며, 가로바를 <strong>레이저 스캐너 규격 측정 빔</strong> 형태로 변형하여 픽셀 오차 없는 정밀성을 상징합니다.
                </p>
              </div>

              {/* Feature C */}
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-500/40 flex items-center justify-center font-mono">C</span>
                  <span>Creative & Framing</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  좌하단을 감싸는 곡선에 <strong>바운딩 박스 크롭 가이드(⌜)</strong>를 결합하여 디스플레이 광고 소재의 뷰파인더 프레이밍을 표현했습니다.
                </p>
              </div>

              {/* Feature V */}
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono">V</span>
                  <span>Validator & Pass</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  우측 상단으로 뻗어나가는 <strong>승인 체크마크(✔)</strong>와 에메랄드 검증 포인트를 접목하여 단 1초 만의 완벽 판정을 상징합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Download Action */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white">고해상도 벡터 SVG 에셋 다운로드</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                프레젠테이션, 기획서, 디자인 시스템 등에 자유롭게 활용하실 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer shadow-sm flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG 다운로드</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px] text-slate-400">
            Created in 2026 by Owen O. Magnus
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
