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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface text-ink-primary rounded-3xl shadow-soft-lg border border-line w-full max-w-xl overflow-hidden animate-scaleUp flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-soft-xs">
              <Sparkles className="w-5 h-5 text-accent-mint" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary flex items-center space-x-2">
                <span>ACV 브랜드 아이덴티티 & 엠블럼</span>
                <span className="text-[10px] bg-canvas-subtle text-ink-secondary border border-line px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  Official Identity
                </span>
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Ad Creative Validator — 차세대 광고 규격 자동 검수 시스템
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* High-Resolution Emblem Showcase Box */}
          <div className="relative p-8 rounded-2xl bg-canvas-subtle/70 border border-line flex flex-col items-center justify-center overflow-hidden group">
            <div className="relative z-10 transition-transform duration-300 hover:scale-105">
              <ACVLogo size={160} showText={false} />
            </div>

            <div className="relative z-10 text-center mt-5">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-black font-mono tracking-widest text-ink-primary">
                  ACV
                </span>
                <span className="text-xs font-bold text-accent bg-surface border border-line px-2 py-0.5 rounded-md shadow-2xs">
                  SYSTEM EMBLEM
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1 font-medium">
                광고 규격 정밀 검수와 크리에이티브 품질 보증을 상징하는 공식 테크 엠블럼
              </p>
            </div>
          </div>

          {/* Design Anatomy Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-accent" />
              <span>로고 디자인 디테일 분석 (Design Anatomy)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Feature A */}
              <div className="p-4 bg-canvas-subtle/50 rounded-2xl border border-line space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-ink-primary">
                  <span className="w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center font-mono text-accent text-[11px] shadow-2xs">A</span>
                  <span>Accuracy & Ad</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  삼각형의 정점을 형성하며, 가로바를 <strong>규격 측정 빔</strong> 형태로 변형하여 픽셀 오차 없는 정밀성을 상징합니다.
                </p>
              </div>

              {/* Feature C */}
              <div className="p-4 bg-canvas-subtle/50 rounded-2xl border border-line space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-ink-primary">
                  <span className="w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center font-mono text-accent text-[11px] shadow-2xs">C</span>
                  <span>Creative & Framing</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  좌하단을 감싸는 곡선에 <strong>바운딩 박스 크롭 가이드</strong>를 결합하여 디스플레이 광고 소재의 뷰파인더를 표현했습니다.
                </p>
              </div>

              {/* Feature V */}
              <div className="p-4 bg-canvas-subtle/50 rounded-2xl border border-line space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-ink-primary">
                  <span className="w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center font-mono text-accent-mint text-[11px] shadow-2xs">V</span>
                  <span>Validator & Pass</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  우측 상단으로 뻗어나가는 <strong>승인 체크마크(✔)</strong>와 에메랄드 검증 포인트를 접목하여 단 1초 만의 완벽 판정을 상징합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Download Action */}
          <div className="p-4 bg-canvas-subtle/70 rounded-2xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-ink-primary">고해상도 벡터 SVG 에셋 다운로드</p>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                프레젠테이션, 기획서, 디자인 시스템 등에 자유롭게 활용하실 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-full bg-accent hover:bg-accent-hover text-white font-bold transition-all cursor-pointer shadow-soft-xs flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG 다운로드</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-canvas-subtle/50 flex items-center justify-between text-xs text-ink-muted">
          <span className="font-mono text-[11px]">
            Created in 2026 by Owen O. Magnus
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-secondary hover:text-ink-primary font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
