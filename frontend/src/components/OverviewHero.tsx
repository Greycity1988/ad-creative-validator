import React from 'react';
import { ShieldCheck, ArrowDown } from 'lucide-react';
import { UploadedFileItem } from '../types';

interface OverviewHeroProps {
  files: UploadedFileItem[];
  selectedPlatformCount: number;
  totalPlatformCount: number;
  totalPlacementCount: number;
  onScrollToUpload?: () => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  files,
  selectedPlatformCount,
  totalPlatformCount,
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
    <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-black/[0.06] shadow-lifemed p-6 sm:p-8 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-black/[0.05]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs font-semibold text-ink-secondary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>2026년 11월 공식 매체사 규격 전수 감사 완료</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            광고 소재 원클릭 통합 규격 검수
          </h2>
          <p className="text-sm text-ink-secondary mt-1.5 max-w-2xl leading-relaxed">
            이미지를 업로드하면 네이버·카카오·메타·구글 등 32대 매체 430+개 공식 지면의 해상도, 용량, 포맷, 안전영역 적합성을 브라우저에서 100% 즉시 판정합니다.
          </p>
        </div>

        {/* Local Security Badge */}
        <div className="flex-shrink-0 bg-neutral-50/80 p-4 rounded-2xl border border-black/[0.05] flex items-center space-x-3.5 max-w-sm shadow-soft-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-ink-primary">100% 브라우저 메모리 로컬 검증</div>
            <p className="text-ink-muted text-[11px] mt-0.5 leading-snug">
              대외비 소재가 외부 서버로 절대 전송되지 않아 안심하고 검수할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - Lifemed Minimalist Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
        {/* Metric 1: Uploaded Creatives */}
        <div className="bg-neutral-50/70 rounded-2xl p-4 border border-black/[0.04] transition-all hover:bg-white hover:shadow-soft-sm hover:border-black/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            업로드된 소재
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{files.length}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">건</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1 truncate">
            {hasFiles ? (
              <span className="text-ink-primary font-semibold">
                {aspectRatios.slice(0, 2).join(', ')}
                {aspectRatios.length > 2 ? ` 외 ${aspectRatios.length - 2}종` : ''}
              </span>
            ) : onScrollToUpload ? (
              <button
                type="button"
                onClick={onScrollToUpload}
                className="text-ink-secondary hover:text-ink-primary hover:underline inline-flex items-center space-x-1 cursor-pointer font-medium"
              >
                <span>소재 추가하기</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            ) : (
              '소재를 추가해 주세요'
            )}
          </div>
        </div>

        {/* Metric 2: Selected Platforms */}
        <div className="bg-neutral-50/70 rounded-2xl p-4 border border-black/[0.04] transition-all hover:bg-white hover:shadow-soft-sm hover:border-black/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            선택된 매체
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{selectedPlatformCount}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">/ {totalPlatformCount}개</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            주요 포털 & SNS 우선 선택
          </div>
        </div>

        {/* Metric 3: Supported Placements */}
        <div className="bg-neutral-50/70 rounded-2xl p-4 border border-black/[0.04] transition-all hover:bg-white hover:shadow-soft-sm hover:border-black/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            검수 가능 지면 수
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary font-mono mt-1 flex items-baseline gap-1.5">
            <span>{totalPlacementCount}</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">개 지면</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            DA, 피드, 숏폼 전면 지원
          </div>
        </div>

        {/* Metric 4: Safety & Privacy */}
        <div className="bg-neutral-50/70 rounded-2xl p-4 border border-black/[0.04] transition-all hover:bg-white hover:shadow-soft-sm hover:border-black/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            보안 및 데이터 정책
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 font-mono mt-1 flex items-baseline gap-1.5">
            <span>0</span>
            <span className="text-xs font-sans text-ink-tertiary font-normal">Byte 전송</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            로컬 브라우저 100% 검증
          </div>
        </div>
      </div>
    </div>
  );
};
