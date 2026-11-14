import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  X,
  Sparkles,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { PlatformOption, PlatformMetadata, PlacementDetail } from '../types';
import { TARGET_CHANNELS } from '../constants/channels';

export const PLATFORMS: PlatformOption[] = [
  // ── 포털 & 주요 SNS (6개) ──
  {
    id: 'naver',
    name: '네이버 (DA / 타임보드 / NOSP)',
    englishName: 'Naver Ads / NOSP',
    icon: '🟩',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '타임보드(1660×260, 300KB), 스페셜DA, 스마트채널, 피드, 밴드',
    category: 'portal',
  },
  {
    id: 'kakao',
    name: '카카오 (비즈보드 / DA)',
    englishName: 'Kakao Moment',
    icon: '💬',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '비즈보드(960×300), 클래식(1029×258), 카카오 DA, 포커스보드',
    category: 'portal',
  },
  {
    id: 'meta',
    name: 'META (인스타그램 / 페이스북)',
    englishName: 'Meta (FB/IG)',
    icon: '♾️',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '피드 (1:1, 4:5), 스토리·릴스 (9:16), 캐러셀 컬렉션',
    category: 'portal',
  },
  {
    id: 'google_ads',
    name: '구글 (Google Ads / GDN)',
    englishName: 'Google Ads',
    icon: '🌐',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: 'PMax 반응형(1.91:1, 1:1, 4:5), Demand Gen, GDN 배너 17종',
    category: 'portal',
  },
  {
    id: 'tiktok',
    name: '틱톡 (TikTok Ads)',
    englishName: 'TikTok Ads',
    icon: '🎵',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '인피드 세로형 (9:16 1080×1920), 정방형 (1:1), Pangle',
    category: 'portal',
  },
  {
    id: 'twitter',
    name: '엑스 (X / Twitter)',
    englishName: 'X Ads',
    icon: '✖️',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '단일 이미지 (1:1, 1.91:1), 몰입형 (9:16), 웹사이트 카드',
    category: 'portal',
  },

  // ── 네트워크 DA & DSP (9개) ──
  {
    id: 'criteo',
    name: '크리테오 (Criteo)',
    englishName: 'Criteo',
    icon: '🎯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '표준 IAB 배너 13종, 플래그십/쇼케이스 빅배너, 어댑티브 마스터',
    category: 'network',
  },
  {
    id: 'moloco',
    name: '몰로코 (Moloco Cloud DSP)',
    englishName: 'Moloco Ads',
    icon: '🚀',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '모바일 DSP 네이티브 (1.91:1, 2:1, 1:1, 9:16), 카카오 연동',
    category: 'network',
  },
  {
    id: 'rtb_house',
    name: 'RTB House',
    englishName: 'RTB House',
    icon: '⚡',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '스태틱 배너 (300×250, 728×90 등), 프로모보드 (1200×628)',
    category: 'network',
  },
  {
    id: 'appier',
    name: '애피어 (Appier)',
    englishName: 'Appier',
    icon: '🤖',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: 'AI 쿼드/인터스티셜, 모바일 전면, 표준 배너, 반응형 네이티브',
    category: 'network',
  },
  {
    id: 'dable',
    name: '데이블 (Dable Native)',
    englishName: 'Dable Native',
    icon: '📰',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '네이티브 4:3(1600×1200), 16:10(1200×750), 1:1, 2:1, 배너',
    category: 'network',
  },
  {
    id: 'taboola',
    name: '타불라 (Taboola)',
    englishName: 'Taboola',
    icon: '📑',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '추천 가로형(16:9 1200×674), 정방형(1:1 1000×1000), 300×600',
    category: 'network',
  },
  {
    id: 'acetrader',
    name: '에이스트레이더 (AceTrader)',
    englishName: 'NHN AceTrader',
    icon: '🎯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '반응형 네이티브 배너(1200×627), 고정 배너 6종(300×250 등)',
    category: 'network',
  },
  {
    id: 'targetpick',
    name: '타겟픽 (TargetPick)',
    englishName: 'TargetPick',
    icon: '🎯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '모바일 띠배너(320×50/100, 640×100), 전면(1200×1000), 스플래시',
    category: 'network',
  },
  {
    id: 'realclick',
    name: '리얼클릭 (RealClick)',
    englishName: 'RealClick',
    icon: '🖱️',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '박스형 배너(250×250, 240×240), 와이드형(570×240), 띠배너',
    category: 'network',
  },

  // ── 커머스 & 금융 (4개) ──
  {
    id: 'coupang',
    name: '쿠팡 (Coupang Ads)',
    englishName: 'Coupang Ads',
    icon: '🛒',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: 'C1 메인 상단(1920×450/720×380), G1 골드박스, R1 로켓배송',
    category: 'commerce',
  },
  {
    id: 'toss',
    name: '토스 (Toss Ads)',
    englishName: 'Toss Ads',
    icon: '💙',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '피드 정방형 (1:1 1000×1000), 가로형 (1200×628), 세로형 (9:16)',
    category: 'commerce',
  },
  {
    id: 'daangn',
    name: '당근 (Karrot Ads)',
    englishName: 'Karrot Ads',
    icon: '🥕',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '피드 정방형(1:1), 피드 와이드(1.91:1), 세로형(4:5, 9:16), WebP',
    category: 'commerce',
  },
  {
    id: 'onestore',
    name: '원스토어 애즈 (ONE store)',
    englishName: 'ONE store Ads',
    icon: '🏬',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '스토어 프로모션 그래픽 배너(1024×578), 대표 아이콘(512×512)',
    category: 'commerce',
  },

  // ── 리워드 & 앱테크 (4개) ──
  {
    id: 'buzzvil',
    name: '버즈빌 (Buzzvil)',
    englishName: 'Buzzvil Ads',
    icon: '⚡',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '반응형 네이티브 배너(1200×627), 잠금화면 Lockscreen(1080×2340)',
    category: 'reward',
  },
  {
    id: 'adison',
    name: '애디슨 오퍼월',
    englishName: 'Adison Offerwall',
    icon: '🎁',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '목록 배너 A타입(720×360), B타입(144×144), 상세 배너(720×780)',
    category: 'reward',
  },
  {
    id: 'syrup',
    name: '시럽 / OK캐쉬백 (Planet AD)',
    englishName: 'SK Planet AD',
    icon: '🍯',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '메인 피드 네이티브(1200×627), 오퍼월/라방(720×720), 오!비즈',
    category: 'reward',
  },
  {
    id: 'tnk',
    name: '티엔케이팩토리 (TNK Factory)',
    englishName: 'TNK Factory',
    icon: '📍',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '가로형(1200×627, 960×640), 세로형(640×1320), 정방형, 띠배너',
    category: 'reward',
  },

  // ── 글로벌 B2B & 동영상 스트리밍 (9개) ──
  {
    id: 'linkedin',
    name: '링크드인 (LinkedIn Ads)',
    englishName: 'LinkedIn Ads',
    icon: '💼',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '단일 이미지 정방형(1200×1200), 가로형(1200×627), 세로형(4:5)',
    category: 'global',
  },
  {
    id: 'pinterest',
    name: '핀터레스트 (Pinterest)',
    englishName: 'Pinterest',
    icon: '📌',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '표준 핀(2:3 1000×1500), 정방형 핀(1:1), 롱 핀(1:2.1 1000×2100)',
    category: 'global',
  },
  {
    id: 'snapchat',
    name: '스냅챗 (Snapchat)',
    englishName: 'Snapchat Ads',
    icon: '👻',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '싱글 이미지 풀스크린(9:16 1080×1920), 스토리 타일(360×600)',
    category: 'global',
  },
  {
    id: 'reddit',
    name: '레딧 (Reddit Ads)',
    englishName: 'Reddit Ads',
    icon: '🤖',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '프로모티드 가로형(1440×1080), 정방형(1:1), 세로형(4:5 1080×1350)',
    category: 'global',
  },
  {
    id: 'spotify',
    name: '스포티파이 (Spotify)',
    englishName: 'Spotify Advertising',
    icon: '🎧',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '컴패니언 디스플레이 배너(1:1 640×640), 리더보드 오버레이',
    category: 'global',
  },
  {
    id: 'soop',
    name: '숲 (SOOP, 구 아프리카TV)',
    englishName: 'SOOP Live',
    icon: '🌲',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '방송국 대문 배너(2320×338), 하단 배너(720×150), 라이브 썸네일',
    category: 'global',
  },
  {
    id: 'chzzk',
    name: '네이버 치지직 (CHZZK)',
    englishName: 'Naver CHZZK',
    icon: '🎮',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '채널 대문 배너(1920×480), 오프라인 대기화면(1920×1080), 프로필',
    category: 'global',
  },
  {
    id: 'cauly',
    name: '카울리 (Cauly)',
    englishName: 'Cauly',
    icon: '📱',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '모바일 표준 띠배너(320×50, 320×100), 중형 배너(300×250)',
    category: 'global',
  },
  {
    id: 'adpopcorn',
    name: '애드팝콘 (AdPopcorn)',
    englishName: 'AdPopcorn (IGAWorks)',
    icon: '🍿',
    badgeColor: 'border-line bg-canvas-subtle text-ink-secondary',
    description: '모바일 띠배너(320×50, 320×100), 중형 배너(300×250)',
    category: 'global',
  },
];

interface MediaSelectorProps {
  selectedPlatforms: string[];
  onChangeSelected: (platforms: string[]) => void;
  platformsMetadata: PlatformMetadata[];
  selectedPlacements: Record<string, string[]>;
  onChangePlacements: (placements: Record<string, string[]>) => void;
  autoMatch: boolean;
  onToggleAutoMatch: (enabled: boolean) => void;
  onStartValidation: () => void;
  isLoading: boolean;
  canValidate: boolean;
  fileCount: number;
}

type CategoryType = 'all' | 'portal' | 'network' | 'commerce' | 'reward' | 'global';

interface CategoryPill {
  id: CategoryType;
  label: string;
  count: number;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  selectedPlatforms,
  onChangeSelected,
  platformsMetadata,
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredPlacement, setHoveredPlacement] = useState<{
    name: string;
    detail?: PlacementDetail;
    rect: { top: number; bottom: number; left: number; width: number };
  } | null>(null);

  const handlePlacementMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    name: string,
    detail?: PlacementDetail
  ) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHoveredPlacement({
      name,
      detail,
      rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width },
    });
  };

  const handlePlacementMouseLeave = () => {
    setHoveredPlacement(null);
  };

  const isAllSelected = selectedPlatforms.length === PLATFORMS.length;
  const totalPlacementsCount =
    platformsMetadata.reduce((sum, p) => sum + (p.placements_count || 0), 0) || 300;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      all: PLATFORMS.length,
      portal: 0,
      network: 0,
      commerce: 0,
      reward: 0,
      global: 0,
    };
    PLATFORMS.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, []);

  const CATEGORIES: CategoryPill[] = [
    { id: 'all', label: '전체 매체', count: categoryCounts.all },
    { id: 'portal', label: '포털 & SNS', count: categoryCounts.portal },
    { id: 'network', label: '네트워크 DA', count: categoryCounts.network },
    { id: 'commerce', label: '커머스 & 금융', count: categoryCounts.commerce },
    { id: 'reward', label: '리워드 & 앱테크', count: categoryCounts.reward },
    { id: 'global', label: '글로벌 & 미디어', count: categoryCounts.global },
  ];

  // Filtered platforms by category & search query
  const filteredPlatforms = useMemo(() => {
    return PLATFORMS.filter((platform) => {
      if (selectedCategory !== 'all' && platform.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = platform.name.toLowerCase().includes(q);
        const matchEng = platform.englishName.toLowerCase().includes(q);
        const matchDesc = platform.description.toLowerCase().includes(q);
        return matchName || matchEng || matchDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleTogglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      onChangeSelected(selectedPlatforms.filter((p) => p !== id));
    } else {
      onChangeSelected([...selectedPlatforms, id]);
    }
  };

  const handleSelectCoreOnly = () => {
    onChangeSelected(['naver', 'kakao', 'meta', 'google_ads']);
    onChangePlacements({});
    setSelectedChannelId('all');
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChangeSelected([]);
    } else {
      onChangeSelected(PLATFORMS.map((p) => p.id));
    }
  };

  const handleTogglePlacement = (platformId: string, placementName: string) => {
    const currentList = selectedPlacements[platformId] || [];
    let updatedList: string[];

    if (currentList.includes(placementName)) {
      updatedList = currentList.filter((name) => name !== placementName);
    } else {
      updatedList = [...currentList, placementName];
    }

    onChangePlacements({
      ...selectedPlacements,
      [platformId]: updatedList,
    });
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    if (channelId === 'all') {
      onChangeSelected(['naver', 'kakao', 'meta', 'google_ads']);
      onChangePlacements({});
      return;
    }

    const channel = TARGET_CHANNELS.find((c) => c.id === channelId);
    if (!channel) return;

    if (!selectedPlatforms.includes(channel.platformId)) {
      onChangeSelected([...selectedPlatforms, channel.platformId]);
    }

    const meta = platformsMetadata.find((p) => p.id === channel.platformId);
    const matchedPlacements = meta
      ? meta.placements.filter((pName: string) =>
          channel.keywords.some((kw: string) => pName.toLowerCase().includes(kw.toLowerCase()))
        )
      : [];

    onChangePlacements({
      ...selectedPlacements,
      [channel.platformId]: matchedPlacements.length > 0 ? matchedPlacements : (meta?.placements || []),
    });

    setExpandedPlatform(channel.platformId);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-soft-sm border border-line p-5 sm:p-6 space-y-5">
      {/* ── 1. Top Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-line-subtle">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-extrabold text-ink-primary tracking-tight">
              2. 검수 대상 광고 매체 선택
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-neutral-700">
              {PLATFORMS.length}대 매체 지원
            </span>
            <div className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
              <span>{totalPlacementsCount}개 공식 지면 전수 탑재</span>
            </div>
            <div className="hidden lg:inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-neutral-700" title="공식 가이드 주기적 변경 감지">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
              <span>공식 가이드 주기적 점검</span>
            </div>
          </div>
          <p className="text-xs text-ink-tertiary mt-1">
            원하는 광고 매체를 선택하세요. 모든 규격은 매체 공식 배포 가이드 100% 원문 기준이며, 현재{' '}
            <strong className="text-violet-700 font-bold">{selectedPlatforms.length}개</strong> 매체 (
            {PLATFORMS.length}개 중)가 검수 대상으로 지정되었습니다.
          </p>
        </div>

        {/* Quick Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSelectCoreOnly}
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-line hover:border-accent/40 text-ink-secondary hover:text-accent hover:bg-accent-light/60 transition-colors cursor-pointer"
            title="네이버, 카카오, 메타, 구글 4대 매체만 원클릭 선택"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>핵심 4대 매체만</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAll}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-line hover:border-line-strong text-ink-secondary hover:bg-canvas-subtle transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-ink-muted" />
                <span>전체 해제</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-accent" />
                <span>32개 전체 선택</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Category Tabs & Search Bar (Responsive & Clean) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-soft-xs'
                    : 'bg-canvas-muted hover:bg-line text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-700 text-slate-200' : 'bg-line/80 text-ink-tertiary'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="매체명·규격 실시간 검색..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-line bg-canvas-subtle focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-ink-muted"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Smart Preset & Auto-Match Bar ── */}
      <div className="bg-canvas-subtle border border-line/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Auto Match Checkbox */}
        <label className="flex items-center space-x-2.5 text-xs font-bold text-ink-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoMatch}
            onChange={(e) => onToggleAutoMatch(e.target.checked)}
            className="rounded text-violet-600 focus:ring-violet-500/30 w-4 h-4 cursor-pointer"
          />
          <div className="flex items-center space-x-1.5">
            <span className="text-violet-700 font-extrabold">🎯 스마트 자동 매칭</span>
            <span className="text-ink-tertiary font-normal hidden lg:inline">
              (소재 파일명·해상도와 일치하는 지면만 지능형 자동 선별)
            </span>
          </div>
        </label>

        {/* Right: Quick Placement Preset Dropdown */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-[11px] font-semibold text-ink-tertiary hidden sm:inline">
            대표 지면 필터:
          </span>
          <select
            value={selectedChannelId}
            onChange={(e) => handleChannelSelect(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-surface border border-line-strong text-ink-primary font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer shadow-soft-xs max-w-[240px] truncate"
          >
            <option value="all">⚡ 핵심 4대 매체 기본 검수</option>
            <optgroup label="네이버 (Naver NOSP & GFA)">
              {TARGET_CHANNELS.filter((c) => c.platformId === 'naver').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="카카오 (Kakao Moment)">
              {TARGET_CHANNELS.filter((c) => c.platformId === 'kakao').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="글로벌 빅매체 (Meta & Google & X)">
              {TARGET_CHANNELS.filter((c) =>
                ['meta', 'google_ads', 'twitter'].includes(c.platformId)
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="커머스 & 금융 (쿠팡 / 토스 / 당근 / 틱톡)">
              {TARGET_CHANNELS.filter((c) =>
                ['coupang', 'toss', 'daangn', 'tiktok'].includes(c.platformId)
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* ── 4. Platform Cards Grid (No-Overflow Guaranteed) ── */}
      {filteredPlatforms.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-line rounded-xl bg-canvas-subtle/50">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-ink-secondary">
            '{searchQuery}' 검색어와 일치하는 광고 매체가 없습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs text-accent font-semibold hover:underline mt-2 cursor-pointer"
          >
            전체 매체 목록 보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 items-start">
          {filteredPlatforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            const isExpanded = expandedPlatform === platform.id;
            const meta = platformsMetadata.find((m) => m.id === platform.id);
            const placementsCount = meta?.placements_count || meta?.placements?.length || 0;
            const platformPlacements = meta?.placements || [];
            const selectedForThisPlatform = selectedPlacements[platform.id] || [];

            return (
              <div
                key={platform.id}
                className={`rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-violet-500/70 bg-violet-50/20 ring-1 ring-violet-500/20 shadow-soft-xs'
                    : 'border-line hover:border-line-strong bg-surface hover:shadow-soft-xs'
                }`}
              >
                {/* Card Header (Strictly constrained layout, no overflow) */}
                <div className="p-3.5 flex items-start justify-between gap-2.5 min-w-0">
                  <div
                    className="flex items-start space-x-2.5 flex-1 min-w-0 cursor-pointer select-none"
                    onClick={() => handleTogglePlatform(platform.id)}
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">{platform.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-nowrap min-w-0">
                        <span
                          className="text-xs font-bold text-ink-primary truncate block"
                          title={platform.name}
                        >
                          {platform.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 whitespace-nowrap ${platform.badgeColor}`}
                        >
                          {placementsCount}개
                        </span>
                      </div>
                      <p
                        className="text-[11px] text-ink-tertiary truncate mt-1 block"
                        title={platform.description}
                      >
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  {/* Right controls: Checkbox + Expand details button (Always anchored) */}
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(platform.id)}
                      className="p-1 text-ink-muted hover:text-violet-600 transition-colors cursor-pointer"
                      aria-label={`${platform.name} 선택 토글`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-ink-muted" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPlatform(isExpanded ? null : platform.id)
                      }
                      className="p-1 text-ink-muted hover:text-ink-secondary rounded hover:bg-canvas-muted transition-colors cursor-pointer"
                      title={isExpanded ? '상세 지면 접기' : '상세 지면 펼치기'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-violet-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Placements Drawer */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-line-subtle bg-canvas-subtle/70 space-y-2">
                    {/* Official Guide Source Info */}
                    {meta && (
                      <div className="p-2 rounded-lg bg-surface border border-line text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-ink-secondary">
                          <span className="flex items-center space-x-1 font-semibold text-ink-primary">
                            <Calendar className="w-3 h-3 text-accent" />
                            <span>{meta.official_update_date || '공식 가이드 미확인'}</span>
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            검증: {meta.last_verified_date || '미확인'}
                          </span>
                        </div>
                        {!meta.official_source_url && (
                          <div className="pt-0.5 text-ink-tertiary font-semibold">
                            {meta.official_source_name || '공식 출처 확인 불가 (매체 담당자 확인 필요)'}
                          </div>
                        )}
                        {meta.official_source_url && (
                          <div className="pt-0.5">
                            <a
                              href={meta.official_source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-accent hover:text-accent font-bold hover:underline"
                            >
                              <span>{meta.official_source_name || '공식 제작 가이드 바로가기'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-ink-tertiary pt-1">
                      <span className="font-semibold text-ink-secondary">
                        세부 지면 선택 ({selectedForThisPlatform.length === 0 ? '전체 검수' : `${selectedForThisPlatform.length}개 선택됨`}):
                      </span>
                      {selectedForThisPlatform.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onChangePlacements({
                              ...selectedPlacements,
                              [platform.id]: [],
                            })
                          }
                          className="text-[10px] text-violet-600 hover:underline cursor-pointer"
                        >
                          지면 초기화
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {platformPlacements.length === 0 ? (
                        <div className="text-[11px] text-ink-muted py-1">
                          등록된 세부 지면이 없습니다.
                        </div>
                      ) : (
                        platformPlacements.map((placementName) => {
                          const isChecked = selectedForThisPlatform.includes(placementName);
                          const detail = meta?.placements_detail?.find(
                            (d) => d.name === placementName
                          );

                          return (
                            <label
                              key={placementName}
                              onMouseEnter={(e) =>
                                handlePlacementMouseEnter(e, placementName, detail)
                              }
                              onMouseLeave={handlePlacementMouseLeave}
                              className={`flex items-start justify-between p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors relative group/item ${
                                isChecked
                                  ? 'bg-violet-50 text-violet-900 font-semibold'
                                  : 'hover:bg-black/[0.03] text-ink-secondary'
                              }`}
                            >
                              <div className="flex items-start space-x-1.5 flex-1 pr-1.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleTogglePlacement(platform.id, placementName)
                                  }
                                  className="rounded text-violet-600 focus:ring-violet-500/30 w-3.5 h-3.5 mt-0.5 cursor-pointer flex-shrink-0"
                                />
                                <span className="leading-tight truncate block">
                                  {placementName}
                                </span>
                              </div>
                              {detail && detail.dimension_str && (
                                <span className="text-[10px] font-mono text-ink-tertiary bg-surface px-1.5 py-0.5 rounded border border-line flex-shrink-0 ml-1">
                                  {detail.dimension_str}
                                </span>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Helper Notice ── */}
      <div className="p-3 bg-neutral-50/80 border border-black/[0.06] rounded-xl flex items-start space-x-2.5 text-xs text-ink-secondary leading-relaxed shadow-soft-xs">
        <ShieldCheck className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-ink-primary">100% 클라이언트 독립 검수:</span> 업로드된 광고 소재 파일은 서버로 전송되지 않고 브라우저 로컬 메모리에서 즉시 공식 가이드 센터 규격과 대조됩니다.
        </div>
      </div>

      {/* ── 6. Bottom Start Validation Action Bar ── */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-line-subtle">
        <div className="text-xs text-ink-tertiary">
          {fileCount > 0 ? (
            <span className="font-medium text-ink-primary">
              업로드된 <strong>{fileCount}개 소재</strong>를 선택된{' '}
              <strong className="text-violet-700 font-bold">{selectedPlatforms.length}개 매체</strong>의 공식 규격으로 실시간 검수합니다.
            </span>
          ) : (
            <span>소재 파일을 먼저 상단에 드래그하거나 선택하여 업로드해주세요.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onStartValidation}
          disabled={!canValidate || isLoading}
          className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-bold text-sm shadow-soft-sm transition-all cursor-pointer ${
            canValidate && !isLoading
              ? 'bg-[#0A0A0A] hover:bg-neutral-800 text-white shadow-soft-md active:scale-98'
              : 'bg-black/[0.06] text-ink-muted cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>규격 검수 분석 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span>소재 규격 검수 시작하기</span>
            </>
          )}
        </button>
      </div>

      {/* ── 7. Floating Placement Detail Hover Tooltip (Lifemed Pure White Card) ── */}
      {hoveredPlacement && (
        <div
          className="fixed z-50 pointer-events-none transition-opacity duration-150 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(hoveredPlacement.rect.left, 16), window.innerWidth - 340)}px`,
            top:
              hoveredPlacement.rect.top < 110
                ? `${hoveredPlacement.rect.bottom + 8}px`
                : `${hoveredPlacement.rect.top - 8}px`,
            transform: hoveredPlacement.rect.top < 110 ? 'none' : 'translateY(-100%)',
          }}
        >
          <div className="bg-white/95 backdrop-blur-md text-ink-primary px-3.5 py-3 rounded-2xl shadow-lifemed border border-black/[0.08] max-w-sm w-max space-y-2 ring-1 ring-black/5">
            {/* Title / Name */}
            <div className="font-bold text-ink-primary text-xs flex items-center gap-1.5 leading-snug">
              <span className="text-violet-600 flex-shrink-0">📍</span>
              <span className="text-ink-primary font-bold">{hoveredPlacement.name}</span>
            </div>

            {/* Spec Badges */}
            {hoveredPlacement.detail && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap pt-1 border-t border-black/[0.06]">
                {hoveredPlacement.detail.dimension_str && (
                  <span className="bg-violet-50 text-violet-700 border border-violet-200/80 px-2 py-0.5 rounded-md font-bold">
                    📐 {hoveredPlacement.detail.dimension_str}
                  </span>
                )}
                {hoveredPlacement.detail.max_file_size_kb && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md font-semibold">
                    💾 최대{' '}
                    {hoveredPlacement.detail.max_file_size_kb >= 1024
                      ? `${(hoveredPlacement.detail.max_file_size_kb / 1024).toFixed(1)}MB`
                      : `${hoveredPlacement.detail.max_file_size_kb}KB`}
                  </span>
                )}
                {hoveredPlacement.detail.allowed_formats &&
                  hoveredPlacement.detail.allowed_formats.length > 0 && (
                    <span className="bg-black/[0.04] text-neutral-600 border border-black/[0.06] px-2 py-0.5 rounded-md uppercase font-medium">
                      🖼️ {hoveredPlacement.detail.allowed_formats.join(', ')}
                    </span>
                  )}
              </div>
            )}

            {/* Description if available */}
            {hoveredPlacement.detail?.description && (
              <p className="text-[10px] text-ink-secondary font-sans leading-relaxed pt-0.5">
                {hoveredPlacement.detail.description}
              </p>
            )}

            {/* Triangle pointer */}
            <div
              className={`absolute left-6 border-4 border-transparent ${
                hoveredPlacement.rect.top < 110
                  ? 'bottom-full -mb-1 border-b-white'
                  : 'top-full -mt-1 border-t-white'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
