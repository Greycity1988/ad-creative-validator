import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { PlatformOption, PlatformMetadata } from '../types';

export const PLATFORMS: PlatformOption[] = [
  {
    id: 'kakao',
    name: '카카오 (비즈보드 / DA)',
    englishName: 'Kakao Moment',
    icon: '💬',
    badgeColor: 'border-yellow-200 bg-yellow-50/50 text-amber-800',
    description: '비즈보드, New 비즈보드, 카카오 DA, 포커스보드',
  },
  {
    id: 'naver',
    name: '네이버 (DA / 타임보드 / NOSP)',
    englishName: 'Naver Ads / NOSP',
    icon: '🟩',
    badgeColor: 'border-emerald-200 bg-emerald-50/50 text-emerald-800',
    description: '타임보드(1660×260), 스페셜DA(1250×520), 더블/트리플크라운, 스마트채널, 피드 DA',
  },
  {
    id: 'adison',
    name: '애디슨 오퍼월',
    englishName: 'Adison Offerwall',
    icon: '🎁',
    badgeColor: 'border-pink-200 bg-pink-50/50 text-pink-700',
    description: '목록 배너 A타입(720×360), B타입(144×144), 상세 배너(720×780)',
  },
  {
    id: 'google_ads',
    name: '구글 (Google)',
    englishName: 'Google Ads',
    icon: '🌐',
    badgeColor: 'border-blue-200 bg-blue-50/50 text-blue-700',
    description: 'PMax, Demand Gen (Shorts), GDN 고정 배너 17종',
  },
  {
    id: 'meta',
    name: 'META',
    englishName: 'Meta (FB/IG)',
    icon: '♾️',
    badgeColor: 'border-sky-200 bg-sky-50/50 text-sky-700',
    description: '피드 (1:1, 4:5), 스토리·릴스 (9:16), 캐러셀',
  },
  {
    id: 'tiktok',
    name: '틱톡 (TikTok)',
    englishName: 'TikTok Ads',
    icon: '🎵',
    badgeColor: 'border-rose-200 bg-rose-50/50 text-rose-700',
    description: '인피드 세로형 (9:16), 정방형 (1:1), 가로형 (16:9), Pangle',
  },
  {
    id: 'moloco',
    name: '몰로코 (Moloco)',
    englishName: 'Moloco Ads',
    icon: '🚀',
    badgeColor: 'border-teal-200 bg-teal-50/50 text-teal-700',
    description: '모바일 DSP 네이티브 (1.91:1, 2:1, 1:1, 9:16), 카카오 연동',
  },
  {
    id: 'criteo',
    name: '크리테오 (Criteo)',
    englishName: 'Criteo',
    icon: '🎯',
    badgeColor: 'border-orange-200 bg-orange-50/50 text-orange-800',
    description: '빅배너(플래그십 576×300/200, 쇼케이스, 브랜디드 헤더), 어댑티브, 빅쿠폰, 타이머',
  },
  {
    id: 'rtb_house',
    name: 'RTB House',
    englishName: 'RTB House',
    icon: '⚡',
    badgeColor: 'border-purple-200 bg-purple-50/50 text-purple-800',
    description: '스태틱 배너 (300×250 등), 프로모보드 (1200×628), 인터스티셜',
  },
  {
    id: 'appier',
    name: '애피어 (Appier)',
    englishName: 'Appier',
    icon: '🤖',
    badgeColor: 'border-indigo-200 bg-indigo-50/50 text-indigo-800',
    description: 'AI 쿼드/인터스티셜, 모바일 전면, 표준 배너, 네이티브',
  },
  {
    id: 'twitter',
    name: '엑스 (X / Twitter)',
    englishName: 'X Ads',
    icon: '✖️',
    badgeColor: 'border-neutral-200 bg-neutral-50/50 text-neutral-800',
    description: '단일 이미지 (1:1, 1.91:1), 몰입형 (9:16), 웹사이트 카드',
  },
];

interface MediaSelectorProps {
  selectedPlatforms: string[];
  onChangeSelected: (platforms: string[]) => void;
  platformsMetadata: PlatformMetadata[];
  selectedPlacements: Record<string, string[]>;
  onChangePlacements: (placements: Record<string, string[]>) => void;
  onUpdateSpecs: () => Promise<void>;
  isUpdatingSpecs: boolean;
  specsUpdateMessage: string | null;
  analyzeText: boolean;
  onToggleAnalyzeText: (enabled: boolean) => void;
  autoMatch: boolean;
  onToggleAutoMatch: (enabled: boolean) => void;
  onStartValidation: () => void;
  isLoading: boolean;
  canValidate: boolean;
  fileCount: number;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  selectedPlatforms,
  onChangeSelected,
  platformsMetadata,
  selectedPlacements,
  onChangePlacements,
  onUpdateSpecs,
  isUpdatingSpecs,
  specsUpdateMessage,
  analyzeText,
  onToggleAnalyzeText,
  autoMatch,
  onToggleAutoMatch,
  onStartValidation,
  isLoading,
  canValidate,
  fileCount,
}) => {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const isAllSelected = selectedPlatforms.length === PLATFORMS.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChangeSelected([]);
    } else {
      onChangeSelected(PLATFORMS.map((p) => p.id));
    }
  };

  const handleTogglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      onChangeSelected(selectedPlatforms.filter((p) => p !== id));
      if (expandedPlatform === id) setExpandedPlatform(null);
    } else {
      onChangeSelected([...selectedPlatforms, id]);
    }
  };

  const getPlatformMeta = (pid: string) => {
    return platformsMetadata.find((m) => m.id === pid);
  };

  const handleTogglePlacement = (platformId: string, placementName: string) => {
    const meta = getPlatformMeta(platformId);
    if (!meta) return;

    const currentSelected = selectedPlacements[platformId] !== undefined
      ? selectedPlacements[platformId]
      : meta.placements;

    let updated: string[];
    if (currentSelected.includes(placementName)) {
      updated = currentSelected.filter((p) => p !== placementName);
    } else {
      updated = [...currentSelected, placementName];
    }

    onChangePlacements({
      ...selectedPlacements,
      [platformId]: updated,
    });
  };

  const handleSelectAllPlacements = (platformId: string, selectAll: boolean) => {
    const meta = getPlatformMeta(platformId);
    if (!meta) return;

    onChangePlacements({
      ...selectedPlacements,
      [platformId]: selectAll ? [...meta.placements] : [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            2
          </span>
          <h2 className="text-base font-bold text-slate-800">
            검수 대상 매체 및 세부 지면 선택
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            ({selectedPlatforms.length}/{PLATFORMS.length}개 선택됨)
          </span>
        </div>

        {/* Action Buttons: Sync Specs + Select All */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Update Specs Button */}
          <button
            type="button"
            onClick={onUpdateSpecs}
            disabled={isUpdatingSpecs || isLoading}
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="모든 매체의 최신 광고 가이드라인을 동기화하고 업데이트합니다."
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isUpdatingSpecs ? 'animate-spin' : ''}`} />
            <span>{isUpdatingSpecs ? '가이드 갱신 중...' : '가이드 최신화 / 전체 업데이트'}</span>
          </button>

          {/* Toggle All */}
          <button
            type="button"
            onClick={handleToggleAll}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-slate-500" />
                <span>전체 해제</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>전체 선택</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification for Spec Update */}
      {specsUpdateMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{specsUpdateMessage}</span>
        </div>
      )}

      {/* Helper Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">매체 공식 가이드라인 실시간 대조 시스템:</span> 임의의 날짜가 아닌 각 매체사(카카오, 네이버, 메타, 구글 등)에서 최종 배포한 <strong>실제 공식 개정일자</strong>를 기준으로 작동합니다. 상단의 <strong>[가이드 최신화 / 전체 업데이트]</strong> 버튼을 누르면 각 매체 공식 가이드 센터 문서와 전수 대조 검증을 수행합니다.
        </div>
      </div>

      {/* Platform Selection Grid (11 Platforms) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const meta = getPlatformMeta(platform.id);
          const totalPlacements = meta ? meta.placements.length : 0;
          const currentPlacements = selectedPlacements[platform.id] !== undefined
            ? selectedPlacements[platform.id]
            : (meta ? meta.placements : []);
          const isExpanded = expandedPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={`relative flex flex-col rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Card Header & Checkbox */}
              <div
                onClick={() => !isLoading && handleTogglePlatform(platform.id)}
                className="p-3.5 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl" role="img" aria-label={platform.name}>
                      {platform.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {platform.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {platform.englishName}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer pointer-events-none mt-0.5"
                  />
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                  {platform.description}
                </p>

                {/* Official Revision Date & Source Link */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-bold">
                      <Calendar className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{meta?.official_update_date || '공식 최신 가이드'}</span>
                    </span>

                    {meta?.official_source_url && (
                      <a
                        href={meta.official_source_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-0.5 text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        title={`${meta.official_source_name || '공식 가이드'} 원문 보기`}
                      >
                        <span>공식 원문</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    검증일: {meta?.last_verified_date || '2026-11-12'}
                  </div>
                </div>
              </div>

              {/* Placement count & Expand Button */}
              {isSelected && totalPlacements > 0 && (
                <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500">
                    지면: <strong className="text-blue-600">{currentPlacements.length}</strong>/{totalPlacements}개 선택됨
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPlatform(isExpanded ? null : platform.id);
                    }}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <span>{isExpanded ? '접기' : '지면 선택'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {/* Expanded Placements Drawer */}
              {isSelected && isExpanded && meta && (
                <div className="p-3 bg-white border-t border-slate-200 rounded-b-xl space-y-2 text-xs max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-700 text-[11px]">
                      세부 지면 목록 ({meta.placements_detail.length}개)
                    </span>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllPlacements(platform.id, true);
                        }}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        전체
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllPlacements(platform.id, false);
                        }}
                        className="text-slate-500 hover:underline font-semibold cursor-pointer"
                      >
                        해제
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {meta.placements_detail.map((p) => {
                      const isPlacementChecked = currentPlacements.includes(p.name);
                      return (
                        <label
                          key={p.name}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-start justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isPlacementChecked
                              ? 'bg-blue-50/40 border-blue-200 text-slate-800'
                              : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={isPlacementChecked}
                              onChange={() => handleTogglePlacement(platform.id, p.name)}
                              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                            />
                            <div>
                              <div className="font-semibold text-[11px] leading-tight">
                                {p.name}
                              </div>
                              {p.dimension_str && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {p.dimension_str}
                                </span>
                              )}
                            </div>
                          </div>
                          {p.aspect_ratio_str && (
                            <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 flex-shrink-0">
                              {p.aspect_ratio_str}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Options & Action Row */}
      <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Smart Auto-Matching Toggle (Recommended) */}
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoMatch}
              onChange={(e) => onToggleAutoMatch(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">
                🎯 규격 기반 지면 자동 매칭 (스마트 검수 권장)
              </span>
              <span className="text-[11px] text-slate-400 hidden xl:inline">
                (이미지 비율·사이즈와 호환되는 지면만 선별 검수)
              </span>
            </div>
          </label>

          {/* Analyze Text Toggle */}
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={analyzeText}
              onChange={(e) => onToggleAnalyzeText(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-700">
                AI 텍스트 비율 분석 포함
              </span>
            </div>
          </label>
        </div>

        {/* Big Start Button */}
        <button
          type="button"
          onClick={onStartValidation}
          disabled={!canValidate || isLoading}
          className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 ${
            canValidate && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-500/20 cursor-pointer'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>검수 분석 진행 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>
                {fileCount > 0
                  ? `${fileCount}개 소재 규격 검수 시작`
                  : '검수 시작 (이미지를 추가하세요)'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
