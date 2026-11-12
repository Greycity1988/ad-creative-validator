import React from 'react';
import { ShieldCheck, ArrowDown } from 'lucide-react';
import { UploadedFileItem } from '../types';

interface OverviewHeroProps {
  files: UploadedFileItem[];
  selectedPlatformCount: number;
  totalPlacementCount: number;
  onScrollToUpload?: () => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  files,
  selectedPlatformCount,
  totalPlacementCount,
  onScrollToUpload,
}) => {
  const hasFiles = files.length > 0;

  // Calculate unique aspect ratios among uploaded files
  const aspectRatios = Array.from(
    new Set(
      files
        .filter((f) => f.dimensions)
        .map((f) => {
          const w = f.dimensions!.width;
          const h = f.dimensions!.height;
          if (Math.abs(w / h - 1.0) < 0.05) return '1:1 정방형';
          if (Math.abs(w / h - 1.91) < 0.08) return '1.91:1 와이드';
          if (Math.abs(w / h - 0.5625) < 0.05) return '9:16 세로형';
          if (Math.abs(w / h - 0.8) < 0.05) return '4:5 피드형';
          return `${w}×${h}`;
        })
    )
  );

  return (
    <div className="bg-surface rounded-3xl border border-line shadow-soft-sm p-6 sm:p-8 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-canvas-subtle border border-line text-xs font-semibold text-ink-secondary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
            <span>2026년 11월 공식 매체사 규격 전수 감사 완료</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            광고 소재 원클릭 통합 규격 검수
          </h2>
          <p className="text-sm text-ink-secondary mt-1.5 max-w-2xl leading-relaxed">
            이미지를 업로드하면 네이버·카카오·메타·구글 등 15대 매체 160+개 공식 지면의 해상도, 용량, 포맷, 안전영역 적합성을 브라우저에서 100% 즉시 판정합니다.
          </p>
        </div>

        {/* Local Security Badge */}
        <div className="flex-shrink-0 bg-canvas p-4 rounded-2xl border border-line/80 flex items-center space-x-3.5 max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-status-pass-bg border border-status-pass-border flex items-center justify-center flex-shrink-0 text-status-pass-dot">
            <ShieldCheck className="w-5 h-5 text-accent-neon" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-ink-primary">100% 브라우저 메모리 로컬 검증</div>
            <p className="text-ink-muted text-[11px] mt-0.5 leading-snug">
              대외비 소재가 외부 서버로 절대 전송되지 않아 안심하고 검수할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - Northpoint Scandinavian Minimalist Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
        {/* Metric 1: Uploaded Creatives */}
        <div className="bg-canvas-subtle/50 rounded-2xl p-4 border border-line/60 transition-colors hover:bg-canvas-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            업로드된 소재
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{files.length}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">건</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1 truncate">
            {hasFiles ? (
              <span className="text-accent font-medium">
                {aspectRatios.slice(0, 2).join(', ')}
                {aspectRatios.length > 2 ? ` 외 ${aspectRatios.length - 2}종` : ''}
              </span>
            ) : onScrollToUpload ? (
              <button
                type="button"
                onClick={onScrollToUpload}
                className="text-accent hover:underline inline-flex items-center space-x-1 cursor-pointer font-medium"
              >
                <span>소재 추가하기</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            ) : (
              '소재를 추가해 주세요'
            )}
          </div>
        </div>

        {/* Metric 2: Target Platforms */}
        <div className="bg-canvas-subtle/50 rounded-2xl p-4 border border-line/60 transition-colors hover:bg-canvas-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            선택된 광고 매체
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{selectedPlatformCount}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">/ 15 매체</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            주요 매체 사전 선택됨
          </div>
        </div>

        {/* Metric 3: Active Placements */}
        <div className="bg-canvas-subtle/50 rounded-2xl p-4 border border-line/60 transition-colors hover:bg-canvas-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            동시대조 검수 지면
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{totalPlacementCount > 0 ? totalPlacementCount : '160+'}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">개 지면</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            DA·비즈보드·피드·스토리 등
          </div>
        </div>

        {/* Metric 4: Readiness Status */}
        <div className="bg-canvas-subtle/50 rounded-2xl p-4 border border-line/60 transition-colors hover:bg-canvas-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            시스템 준비 상태
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-accent font-mono mt-1 flex items-baseline gap-1.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-mint animate-pulse" />
              <span>Ready</span>
            </span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            {hasFiles ? '검수 시작 가능' : '소재 업로드 대기 중'}
          </div>
        </div>
      </div>
    </div>
  );
};
