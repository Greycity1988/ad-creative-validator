import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  Target,
} from 'lucide-react';
import { PlatformOption, PlatformMetadata } from '../types';
import { TARGET_CHANNELS } from '../constants/channels';

export const PLATFORMS: PlatformOption[] = [
  {
    id: 'adison',
    name: '애디슨 오퍼월',
    englishName: 'Adison Offerwall',
    icon: '🎁',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '목록 배너 A타입(720×360), B타입(144×144), 상세 배너(720×780)',
  },
  {
    id: 'appier',
    name: '애피어 (Appier)',
    englishName: 'Appier',
    icon: '🤖',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: 'AI 쿼드/인터스티셜, 모바일 전면, 표준 배너, 네이티브',
  },
  {
    id: 'buzzvil',
    name: '버즈빌 (Buzzvil)',
    englishName: 'Buzzvil Ads',
    icon: '⚡',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '잠금화면 전면 (9:16), 인앱 피드 와이드 배너 (2:1), 리워드 아이콘',
  },
  {
    id: 'coupang',
    name: '쿠팡 (Coupang)',
    englishName: 'Coupang Ads',
    icon: '🛒',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '메인 홈 와이드 배너 (2:1), 골드박스 타임할인, C.Native 상품 피드',
  },
  {
    id: 'criteo',
    name: '크리테오 (Criteo)',
    englishName: 'Criteo',
    icon: '🎯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '표준 IAB 배너 13종, 빅배너(576×300/200, 쇼케이스), 어댑티브',
  },
  {
    id: 'daangn',
    name: '당근 (Karrot)',
    englishName: 'Karrot Ads',
    icon: '🥕',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '피드 정방형 (1:1), 피드 와이드 (1.91:1), 홈 상단 배너, 동네생활 (9:16)',
  },
  {
    id: 'google_ads',
    name: '구글 (Google)',
    englishName: 'Google Ads',
    icon: '🌐',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: 'PMax, Demand Gen (Shorts), GDN 고정 배너 17종',
  },
  {
    id: 'kakao',
    name: '카카오 (비즈보드 / DA)',
    englishName: 'Kakao Moment',
    icon: '💬',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '비즈보드(960×300), 카카오 DA, 포커스보드, 채널 메시지, 웹툰 배너',
  },
  {
    id: 'meta',
    name: 'META',
    englishName: 'Meta (FB/IG)',
    icon: '♾️',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '피드 (1:1, 4:5), 스토리·릴스 (9:16), 캐러셀',
  },
  {
    id: 'moloco',
    name: '몰로코 (Moloco)',
    englishName: 'Moloco Ads',
    icon: '🚀',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '모바일 DSP 네이티브 (1.91:1, 2:1, 1:1, 9:16), 카카오 연동',
  },
  {
    id: 'naver',
    name: '네이버 (DA / 타임보드 / NOSP)',
    englishName: 'Naver Ads / NOSP',
    icon: '🟩',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '타임보드(1660×260), 롤링보드(350×280), 브랜드검색, 스페셜DA, 스마트채널, 밴드',
  },
  {
    id: 'rtb_house',
    name: 'RTB House',
    englishName: 'RTB House',
    icon: '⚡',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '스태틱 배너 (300×250 등), 프로모보드 (1200×628), 인터스티셜',
  },
  {
    id: 'tiktok',
    name: '틱톡 (TikTok)',
    englishName: 'TikTok Ads',
    icon: '🎵',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '인피드 광고(9:16), 스파크 애즈, 톱뷰(TopView) 전면 스크린',
  },
  {
    id: 'toss',
    name: '토스 (Toss)',
    englishName: 'Toss Ads',
    icon: '💙',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '행운퀴즈, 머니워크 배너, 송금완료 배너, 홈 탭 피드 배너, 브랜드 캐시백',
  },
  {
    id: 'tg',
    name: '타겟게이츠 (TG)',
    englishName: 'TargetGates',
    icon: '🎯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '언론사 와이드 배너 (1200×600), 네이티브 썸네일 피드 (3:2, 1:1)',
  },
];

interface MediaSelectorProps {
  selectedPlatforms: string[];
  onChangeSelected: (platforms: string[]) => void;
  platformsMetadata?: PlatformMetadata[];
  selectedPlacements: Record<string, string[]>;
  onChangePlacements: (placements: Record<string, string[]>) => void;
  autoMatch: boolean;
  onToggleAutoMatch: (val: boolean) => void;
  onStartValidation: () => void;
  isLoading: boolean;
  canValidate: boolean;
  fileCount: number;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  selectedPlatforms,
  onChangeSelected,
  platformsMetadata = [],
  selectedPlacements,
  onChangePlacements,
  autoMatch,
  onToggleAutoMatch,
  onStartValidation,
  isLoading,
  canValidate,
  fileCount,
}) => {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');

  const totalPlacementsCount =
    platformsMetadata.reduce(
      (acc, curr) => acc + (curr.placements?.length || 0),
      0
    ) || 160;

  const isAllSelected = selectedPlatforms.length === PLATFORMS.length;

  const handleTogglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      onChangeSelected(selectedPlatforms.filter((p) => p !== id));
      if (expandedPlatform === id) setExpandedPlatform(null);
    } else {
      onChangeSelected([...selectedPlatforms, id]);
    }
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChangeSelected([]);
      setExpandedPlatform(null);
    } else {
      onChangeSelected(PLATFORMS.map((p) => p.id));
    }
  };

  const getPlatformMeta = (pid: string) => {
    if (!platformsMetadata || !Array.isArray(platformsMetadata)) return undefined;
    return platformsMetadata.find((m) => m.id === pid);
  };

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    if (channelId === 'all') {
      onChangeSelected(PLATFORMS.map((p) => p.id));
      onChangePlacements({});
      return;
    }

    const channel = TARGET_CHANNELS.find((c) => c.id === channelId);
    if (!channel) return;

    const meta = getPlatformMeta(channel.platformId);
    if (!meta) {
      onChangeSelected([channel.platformId]);
      return;
    }

    const matchedPlacements = meta.placements.filter((pName) =>
      channel.keywords.some((kw) => pName.toLowerCase().includes(kw.toLowerCase()))
    );

    onChangeSelected([channel.platformId]);
    onChangePlacements({
      [channel.platformId]: matchedPlacements.length > 0 ? matchedPlacements : meta.placements,
    });
  };

  const selectedChannel = TARGET_CHANNELS.find((c) => c.id === selectedChannelId);

  const handleTogglePlacement = (platformId: string, placementName: string) => {
    const meta = getPlatformMeta(platformId);
    if (!meta) return;

    const currentSelected =
      selectedPlacements[platformId] !== undefined
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
    <div className="bg-surface rounded-3xl border border-line shadow-soft-sm p-6 sm:p-8 space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold font-mono tracking-tight shadow-soft-xs">
            02
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink-primary">
                검수 대상 매체 및 세부 지면 선택
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-canvas-subtle border border-line text-ink-secondary">
                {selectedPlatforms.length}/{PLATFORMS.length} 매체
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              국내외 주요 15대 애드 네트워크 및 160여 개 공식 게재 지면
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-line bg-canvas-subtle text-ink-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
            <span>{totalPlacementsCount}개 공식 지면 전수 탑재</span>
          </div>

          <button
            type="button"
            onClick={handleToggleAll}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-line hover:border-line-strong text-ink-secondary hover:text-ink-primary bg-surface hover:bg-canvas-subtle transition-all cursor-pointer shadow-2xs"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-ink-muted" />
                <span>전체 해제</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-accent" />
                <span>전체 선택</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Channel Segmented Selector (Scandinavian Minimalist Banner) */}
      <div className="p-4 sm:p-5 bg-canvas-subtle/70 rounded-2xl border border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-accent shadow-soft-xs flex-shrink-0">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-primary flex items-center space-x-2">
              <span>주요 타겟 지면 원클릭 필터 (17대 핵심 지면)</span>
              <span className="text-[10px] font-mono font-semibold bg-surface text-accent border border-line px-2 py-0.5 rounded-full">
                Quick Preset
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
              특정 캠페인 목적 지면만 단독 검수하여 타 지면 규격 오검출을 방지합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <select
            value={selectedChannelId}
            onChange={(e) => handleSelectChannel(e.target.value)}
            disabled={isLoading}
            className="bg-surface text-ink-primary border border-line hover:border-line-strong rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer shadow-soft-xs w-full md:w-auto transition-all"
          >
            <option value="all">전체 매체 검수 (스마트 자동 매칭 권장)</option>
            <optgroup label="── 17대 주요 세부 지면 ──">
              {TARGET_CHANNELS.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {selectedChannelId === ch.id ? '✓ ' : ''}{ch.label}
                </option>
              ))}
            </optgroup>
          </select>

          {selectedChannelId !== 'all' && (
            <button
              type="button"
              onClick={() => handleSelectChannel('all')}
              className="px-3 py-2 rounded-xl bg-surface hover:bg-canvas-subtle border border-line text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-soft-xs flex-shrink-0"
              title="전체 매체 선택으로 초기화"
            >
              전체 보기
            </button>
          )}
        </div>
      </div>

      {/* Selected Channel Active Notice Banner */}
      {selectedChannel && (
        <div className="p-3.5 bg-accent/5 border border-accent/20 rounded-2xl flex items-center justify-between text-xs text-ink-primary animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-accent">✓ 현재 적용된 타겟 지면:</span>
            <span className="font-extrabold text-ink-primary bg-surface px-2.5 py-1 rounded-lg border border-line shadow-2xs">
              {selectedChannel.label}
            </span>
            <span className="text-ink-secondary hidden sm:inline">
              ({selectedChannel.description})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectChannel('all')}
            className="text-accent hover:text-accent-hover font-bold underline cursor-pointer text-xs"
          >
            모든 매체 보기로 전환
          </button>
        </div>
      )}

      {/* Platform Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const meta = getPlatformMeta(platform.id);
          const totalPlacements = meta ? meta.placements.length : 0;
          const currentPlacements =
            selectedPlacements[platform.id] !== undefined
              ? selectedPlacements[platform.id]
              : (meta ? meta.placements : []);
          const isExpanded = expandedPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'border-accent/40 bg-surface shadow-soft-xs ring-1 ring-accent/15'
                  : 'border-line hover:border-line-strong bg-surface hover:bg-canvas-subtle/40'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Card Header & Checkbox */}
              <div
                onClick={() => !isLoading && handleTogglePlatform(platform.id)}
                className="p-4 cursor-pointer select-none flex-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl" role="img" aria-label={platform.name}>
                      {platform.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink-primary leading-tight">
                        {platform.name}
                      </h3>
                      <p className="text-[11px] text-ink-muted font-medium">
                        {platform.englishName}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 ${
                      isSelected
                        ? 'bg-accent border-accent text-white'
                        : 'border-line-strong bg-canvas-subtle'
                    }`}
                  >
                    {isSelected && <span className="text-xs font-bold leading-none">✓</span>}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-ink-secondary mt-2.5 line-clamp-2 leading-relaxed">
                  {platform.description}
                </p>

                {/* Official Revision Date & Source Link */}
                <div className="mt-3 pt-2.5 border-t border-line/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="inline-flex items-center space-x-1 text-ink-secondary bg-canvas-subtle border border-line px-2 py-0.5 rounded-full font-mono font-medium">
                      <Calendar className="w-2.5 h-2.5 text-accent-mint" />
                      <span>{meta?.official_update_date || '최신 가이드'}</span>
                    </span>

                    {meta?.official_source_url && (
                      <a
                        href={meta.official_source_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-0.5 text-[10px] text-accent hover:text-accent-hover hover:underline font-semibold"
                        title={`${meta.official_source_name || '공식 가이드'} 원문 보기`}
                      >
                        <span>공식 규격</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Placement count & Expand Button */}
              {isSelected && totalPlacements > 0 && (
                <div className="px-4 pb-3 pt-2 border-t border-line/60 flex items-center justify-between text-xs bg-canvas-subtle/30 rounded-b-2xl">
                  <span className="text-[11px] font-medium text-ink-secondary">
                    지면: <strong className="text-ink-primary font-mono">{currentPlacements.length}</strong>/{totalPlacements}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPlatform(isExpanded ? null : platform.id);
                    }}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-accent hover:text-accent-hover bg-surface hover:bg-canvas-subtle border border-line px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
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
                <div className="p-3.5 bg-surface border-t border-line rounded-b-2xl space-y-2.5 text-xs max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1.5 border-b border-line">
                    <span className="font-bold text-ink-primary text-[11px]">
                      세부 지면 목록 ({meta.placements_detail.length}개)
                    </span>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllPlacements(platform.id, true);
                        }}
                        className="text-accent hover:underline font-semibold cursor-pointer"
                      >
                        전체
                      </button>
                      <span className="text-line-strong">|</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllPlacements(platform.id, false);
                        }}
                        className="text-ink-muted hover:underline font-semibold cursor-pointer"
                      >
                        해제
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    {meta.placements_detail.map((p) => {
                      const isPlacementChecked = currentPlacements.includes(p.name);
                      return (
                        <label
                          key={p.name}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-start justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            isPlacementChecked
                              ? 'bg-canvas-subtle/80 border-line text-ink-primary'
                              : 'bg-transparent border-transparent text-ink-muted opacity-50'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={isPlacementChecked}
                              onChange={() => handleTogglePlacement(platform.id, p.name)}
                              className="w-3.5 h-3.5 text-accent rounded border-line-strong focus:ring-accent mt-0.5"
                            />
                            <div>
                              <div className="font-semibold text-[11px] leading-tight">
                                {p.name}
                              </div>
                              {p.dimension_str && (
                                <span className="text-[10px] text-ink-muted font-mono">
                                  {p.dimension_str}
                                </span>
                              )}
                            </div>
                          </div>
                          {p.aspect_ratio_str && (
                            <span className="text-[10px] font-mono font-bold bg-surface px-1.5 py-0.5 rounded-md border border-line text-ink-secondary flex-shrink-0">
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
      <div className="pt-4 border-t border-line/60 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Smart Auto-Matching Toggle */}
          <label className="flex items-center space-x-3 cursor-pointer select-none p-2 rounded-xl hover:bg-canvas-subtle transition-all">
            <input
              type="checkbox"
              checked={autoMatch}
              onChange={(e) => onToggleAutoMatch(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-accent rounded border-line-strong focus:ring-accent cursor-pointer"
            />
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink-primary">
                스마트 지면 자동 매칭 (권장)
              </span>
              <span className="text-[11px] text-ink-muted hidden xl:inline">
                • 업로드된 이미지 비율・해상도와 부합하는 지면만 선별 검수
              </span>
            </div>
          </label>
        </div>

        {/* High-Contrast Northpoint Style CTA Button */}
        <button
          type="button"
          onClick={onStartValidation}
          disabled={!canValidate || isLoading}
          className={`inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-full font-bold text-sm tracking-tight transition-all duration-200 cursor-pointer ${
            canValidate && !isLoading
              ? 'bg-accent hover:bg-accent-hover text-white shadow-soft-md hover:shadow-soft-lg active:scale-[0.99]'
              : 'bg-canvas-subtle text-ink-muted border border-line shadow-none cursor-not-allowed opacity-60'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>규격 정밀 분석 진행 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>
                {fileCount > 0
                  ? `${fileCount}개 소재 정밀 검수 시작`
                  : '검수 시작 (이미지를 추가하세요)'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
