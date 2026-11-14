import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  Target,
} from 'lucide-react';
import { PlatformResult, PlacementResult, CheckItem, SafeZoneSpec } from '../types';

interface ResultCardProps {
  platformResult: PlatformResult;
  viewMode?: 'target' | 'pass' | 'all';
  imageUrl?: string;
  imageInfo?: { width: number; height: number; filename?: string };
  onOpenSafeZone?: (placementName: string, platformName: string, safeZone: SafeZoneSpec) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  platformResult,
  viewMode = 'target',
  onOpenSafeZone,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedPlacements, setExpandedPlacements] = useState<Record<number, boolean>>({});

  const allPlacements = platformResult.placements || [];
  const targetPlacements = allPlacements.filter((p) => p.is_matched_target);
  const passPlacementsList = allPlacements.filter(
    (p) => p.overall === 'pass' || p.overall === 'success'
  );

  let displayedPlacements = allPlacements;
  if (viewMode === 'target') {
    if (targetPlacements.length > 0) {
      displayedPlacements = targetPlacements;
    } else if (passPlacementsList.length > 0) {
      displayedPlacements = passPlacementsList;
    }
  } else if (viewMode === 'pass') {
    displayedPlacements = passPlacementsList;
  }

  const isPlatformNA =
    platformResult.overall === 'na' ||
    (allPlacements.length > 0 && allPlacements.every((p) => p.overall === 'skip'));

  const activePlacements = allPlacements.filter((p) => p.overall !== 'skip');
  const activePassPlacements = passPlacementsList.filter((p) => p.overall !== 'skip');
  const activeFailPlacements = allPlacements.filter(
    (p) => p.overall === 'fail' || p.overall === 'error'
  );

  let overallBadge: {
    label: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
  };

  if (isPlatformNA || activePlacements.length === 0) {
    overallBadge = {
      label: '해당 규격 없음 (N/A)',
      dotColor: 'bg-ink-muted',
      bgColor: 'bg-canvas-subtle',
      textColor: 'text-ink-muted',
    };
  } else if (activeFailPlacements.length === 0 && activePassPlacements.length > 0) {
    overallBadge = {
      label: '적합 (PASS)',
      dotColor: 'bg-accent-mint',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-700',
    };
  } else if (activePassPlacements.length === 0 && activeFailPlacements.length > 0) {
    overallBadge = {
      label: '부적합 (FAIL)',
      dotColor: 'bg-rose-500',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-700',
    };
  } else {
    overallBadge = {
      label: '주의 (PARTIAL)',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-700',
    };
  }

  const togglePlacement = (index: number) => {
    setExpandedPlacements((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'success':
        return (
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>적합 (PASS)</span>
          </span>
        );
      case 'warning':
      case 'warn':
        return (
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>주의 (WARN)</span>
          </span>
        );
      case 'fail':
      case 'error':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-rose-700 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>부적합 (FAIL)</span>
          </span>
        );
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-accent-mint flex-shrink-0" />;
      case 'warning':
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
      case 'manual':
        return <Info className="w-3.5 h-3.5 text-accent flex-shrink-0" />;
      case 'fail':
      case 'error':
      default:
        return <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />;
    }
  };

  const getCheckNameKorean = (name: string): string => {
    switch (name) {
      case 'format':
        return '파일 포맷';
      case 'dimensions':
      case 'dimension':
      case 'resolution':
        return '해상도 규격';
      case 'file_size':
      case 'size':
        return '파일 용량';
      case 'aspect_ratio':
      case 'ratio':
        return '가로세로 비율';
      case 'transparency':
      case 'alpha':
        return '투명도(Alpha)';
      case 'text_ratio':
        return '텍스트 비율';
      case 'safe_zone':
      case 'safezone':
        return '세이프존(안전영역)';
      default:
        return name;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-line shadow-soft-xs hover:shadow-soft-sm transition-all overflow-hidden">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 sm:p-5 bg-surface hover:bg-canvas-subtle/50 cursor-pointer select-none border-b border-line/60 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-ink-muted">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-ink-primary">
                {platformResult.platform}
              </h4>
              {viewMode === 'target' && targetPlacements.length > 0 && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold text-accent bg-accent/5 border border-accent/20 px-2 py-0.5 rounded-full">
                  <Target className="w-2.5 h-2.5 text-accent" />
                  <span>타겟 {targetPlacements.length}개</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              {isPlatformNA ? (
                <span>현재 업로드된 소재 규격에 해당하는 공식 지면이 없습니다</span>
              ) : (
                <>
                  총 {activePlacements.length}개 지면 중{' '}
                  <span className="font-semibold text-accent-mint font-mono">
                    {activePassPlacements.length}개 통과
                  </span>
                  {activeFailPlacements.length > 0 && (
                    <span className="font-semibold text-status-fail font-mono">
                      {' '}
                      / {activeFailPlacements.length}개 불일치
                    </span>
                  )}
                  {displayedPlacements.length !== activePlacements.length && (
                    <span className="text-ink-secondary font-medium ml-1">
                      ({displayedPlacements.length}개 표시)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-line ${overallBadge.bgColor} ${overallBadge.textColor}`}
        >
          <span className={`w-2 h-2 rounded-full ${overallBadge.dotColor}`} />
          <span>{overallBadge.label}</span>
        </div>
      </div>

      {/* Expandable Placement List */}
      {isExpanded && (
        <div className="divide-y divide-line/60 p-2 sm:p-3 bg-surface space-y-1">
          {displayedPlacements.length === 0 ? (
            <div className="p-5 text-center text-xs text-ink-muted">
              현재 필터 조건에 해당하는 지면 결과가 없습니다.
            </div>
          ) : (
            displayedPlacements.map((placement: PlacementResult, pIdx: number) => {
              const isPlacementOpen = expandedPlacements[pIdx] ?? true;
              return (
                <div key={pIdx} className="pt-2 pb-2 first:pt-1 last:pb-1">
                  <div
                    onClick={() => togglePlacement(pIdx)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-canvas-subtle/70 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                      <div className="text-ink-muted flex-shrink-0">
                        {isPlacementOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 min-w-0">
                        <span className="text-xs font-bold text-ink-primary">
                          {placement.name}
                        </span>
                        {placement.is_matched_target && (
                          <span className="text-[9px] font-mono font-semibold bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.2 rounded-full flex-shrink-0">
                            매칭 지면
                          </span>
                        )}
                        {placement.safe_zone && onOpenSafeZone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSafeZone(placement.name, platformResult.platform, placement.safe_zone!);
                            }}
                            className="inline-flex items-center space-x-1 text-[10px] font-semibold text-accent bg-accent-light hover:bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                            title="공식 세이프존 가이드라인 및 앱 UI 차폐 영역 실시간 시뮬레이터 열기"
                          >
                            <span>📐 세이프존 가이드 대조</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {getStatusBadge(placement.overall)}
                    </div>
                  </div>

                  {/* Placement Sub-Checks Details */}
                  {isPlacementOpen && placement.checks && (
                    <div className="ml-6 sm:ml-7 mt-1.5 space-y-1.5 border-l-2 border-line pl-3 py-1 text-xs">
                      {placement.checks.map((chk: CheckItem, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="flex items-start justify-between gap-2 py-0.5 text-[11px]"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {getCheckIcon(chk.status)}
                            <span className="font-semibold text-ink-secondary flex-shrink-0 whitespace-nowrap">
                              {getCheckNameKorean(chk.name)}:
                            </span>
                            <span className="text-ink-muted truncate">
                              {chk.message}
                            </span>
                          </div>
                          {chk.expected && (
                            <span
                              title={`기준: ${chk.expected}`}
                              className="font-mono text-[10px] text-ink-muted bg-canvas-subtle px-1.5 py-0.5 rounded border border-line max-w-[45%] truncate"
                            >
                              기준: {chk.expected}
                            </span>
                          )}
                          {chk.name === 'safe_zone' && placement.safe_zone && onOpenSafeZone && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenSafeZone(placement.name, platformResult.platform, placement.safe_zone!)
                              }
                              className="text-[10px] font-semibold text-accent hover:underline flex-shrink-0 cursor-pointer"
                            >
                              [인스펙터 열기]
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
