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

  // Determine which placements to display based on viewMode
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
    bgColor: string;
    textColor: string;
    borderColor: string;
    Icon: React.ElementType;
  };

  if (isPlatformNA || activePlacements.length === 0) {
    overallBadge = {
      label: '해당 규격 없음 (N/A)',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-500',
      borderColor: 'border-slate-200',
      Icon: Info,
    };
  } else if (activeFailPlacements.length === 0 && activePassPlacements.length > 0) {
    overallBadge = {
      label: '적합 (PASS)',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      Icon: CheckCircle,
    };
  } else if (activePassPlacements.length === 0 && activeFailPlacements.length > 0) {
    overallBadge = {
      label: '부적합 (FAIL)',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      Icon: XCircle,
    };
  } else {
    overallBadge = {
      label: '주의 (PARTIAL)',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      Icon: AlertTriangle,
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
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>적합 (PASS)</span>
          </span>
        );
      case 'warning':
      case 'warn':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>주의 (WARN)</span>
          </span>
        );
      case 'fail':
      case 'error':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>부적합 (FAIL)</span>
          </span>
        );
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
      case 'warning':
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
      case 'fail':
      case 'error':
      default:
        return <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-50 cursor-pointer select-none border-b border-slate-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-slate-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-800">
                {platformResult.platform}
              </h4>
              {viewMode === 'target' && targetPlacements.length > 0 && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-1.5 py-0.2 rounded-md">
                  <Target className="w-2.5 h-2.5 text-blue-600" />
                  <span>타겟 {targetPlacements.length}개 지면</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isPlatformNA ? (
                <span>현재 업로드된 소재 규격에 해당하는 공식 지면이 없습니다</span>
              ) : (
                <>
                  총 {activePlacements.length}개 매칭 지면 중{' '}
                  <span className="font-semibold text-emerald-600">
                    {activePassPlacements.length}개 통과
                  </span>
                  {activeFailPlacements.length > 0 && (
                    <span className="font-semibold text-red-600">
                      {' '}
                      / {activeFailPlacements.length}개 불일치
                    </span>
                  )}
                  {displayedPlacements.length !== activePlacements.length && (
                    <span className="text-blue-600 font-semibold ml-1">
                      ({displayedPlacements.length}개 표시됨)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${overallBadge.bgColor} ${overallBadge.textColor} ${overallBadge.borderColor}`}
        >
          <overallBadge.Icon className="w-4 h-4" />
          <span>{overallBadge.label}</span>
        </div>
      </div>

      {/* Expandable Placement List */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 p-2 sm:p-3 bg-white space-y-1">
          {displayedPlacements.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              현재 필터 조건에 해당하는 지면 결과가 없습니다.
            </div>
          ) : (
            displayedPlacements.map((placement: PlacementResult, pIdx: number) => {
              const isPlacementOpen = expandedPlacements[pIdx] ?? true;
              const isPass =
                placement.overall === 'pass' || placement.overall === 'success';

              return (
                <div
                  key={pIdx}
                  className={`rounded-lg border transition-all ${
                    placement.is_matched_target
                      ? isPass
                        ? 'border-blue-200 bg-blue-50/20 ring-1 ring-blue-100'
                        : 'border-red-200 bg-red-50/20 ring-1 ring-red-100'
                      : isPass
                      ? 'border-slate-100 bg-white'
                      : 'border-red-100 bg-red-50/20'
                  }`}
                >
                  {/* Placement Title Bar */}
                  <div
                    onClick={() => togglePlacement(pIdx)}
                    className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer select-none hover:bg-slate-50/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
                      <span className="text-slate-400 flex-shrink-0">
                        {isPlacementOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-800">
                          {placement.name}
                        </span>
                        {placement.is_matched_target && (
                          <span className="inline-flex items-center space-x-0.5 text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 flex-shrink-0">
                            <Target className="w-2.5 h-2.5" />
                            <span>매칭 지면</span>
                          </span>
                        )}
                        {placement.safe_zone && onOpenSafeZone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSafeZone(placement.name, platformResult.platform, placement.safe_zone!);
                            }}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs flex-shrink-0"
                            title="공식 세이프존 가이드라인 및 앱 UI 차폐 영역 실시간 시뮬레이터 열기"
                          >
                            <span>📐 세이프존 가이드 대조</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">{getStatusBadge(placement.overall)}</div>
                  </div>

                  {/* Sub-Checks Detail */}
                  {isPlacementOpen && placement.checks && placement.checks.length > 0 && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100/80 bg-slate-50/40 rounded-b-lg">
                      <div className="space-y-1.5">
                        {placement.checks.map((check: CheckItem, cIdx: number) => (
                          <div
                            key={cIdx}
                            className="flex items-start space-x-2 text-xs py-1 px-2 rounded bg-white border border-slate-100 shadow-2xs"
                          >
                            <div className="mt-0.5">{getCheckIcon(check.status)}</div>
                            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                              <div>
                                <span className="font-semibold text-slate-700 mr-1.5 font-mono text-[11px]">
                                  [{getCheckNameKorean(check.name)}]
                                </span>
                                <span
                                  className={`text-[11px] ${
                                    check.status === 'fail' || check.status === 'error'
                                      ? 'text-red-600 font-medium'
                                      : check.status === 'warning'
                                      ? 'text-amber-700 font-medium'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {check.message}
                                </span>
                              </div>
                              {check.name === 'safe_zone' && placement.safe_zone && onOpenSafeZone && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenSafeZone(
                                      placement.name,
                                      platformResult.platform,
                                      placement.safe_zone!
                                    )
                                  }
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0 cursor-pointer"
                                >
                                  [인스펙터 열기]
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
