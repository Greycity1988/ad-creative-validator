import React, { useState } from 'react';
import {
  Download,
  Filter,
  AlertTriangle,
  Loader2,
  Layers,
  ListFilter,
  LayoutGrid,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { ValidationItem, SafeZoneSpec } from '../types';
import { ImagePreview } from './ImagePreview';
import { TextRatioGauge } from './TextRatioGauge';
import { ResultCard } from './ResultCard';
import { BatchSummaryView } from './BatchSummaryView';
import { SafeZoneModal } from './SafeZoneModal';
import { downloadCsvReport } from '../api/validator';
import { track } from '@vercel/analytics';

interface ResultDashboardProps {
  results: ValidationItem[];
  filePreviews: Record<string, string>; // filename -> blob url
  onReset: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  results,
  filePreviews,
  onReset,
}) => {
  const [mainTab, setMainTab] = useState<'batch' | 'detail'>('batch');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'target' | 'pass' | 'all'>('target');
  const [activeSafeZone, setActiveSafeZone] = useState<{
    placementName: string;
    platformName: string;
    safeZone: SafeZoneSpec;
  } | null>(null);

  if (!results || results.length === 0) {
    return null;
  }

  // Calculate summary metrics across all files and placements
  let totalPlacementsCount = 0;
  let passPlacementsCount = 0;
  let failPlacementsCount = 0;
  let matchedPlacementsCount = 0;

  results.forEach((item) => {
    item.platform_results.forEach((platform) => {
      if (platform.overall === 'na') return;
      platform.placements.forEach((placement) => {
        if (placement.overall === 'skip') return;
        totalPlacementsCount++;
        if (placement.is_matched_target) {
          matchedPlacementsCount++;
        }
        if (placement.overall === 'pass' || placement.overall === 'success') {
          passPlacementsCount++;
        } else {
          failPlacementsCount++;
        }
      });
    });
  });

  const complianceRate =
    totalPlacementsCount > 0
      ? Math.round((passPlacementsCount / totalPlacementsCount) * 100)
      : 0;

  const handleDownloadCsv = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      try {
        track('Excel Report Downloaded', {
          total_files: results.length,
          total_placements: totalPlacementsCount,
        });
      } catch {
        // ignore
      }
      await downloadCsvReport(results, `ad_creative_report_${Date.now()}.csv`);
    } catch (err: unknown) {
      console.error('Failed to export CSV:', err);
      setExportError('CSV 파일 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentItem = results[selectedFileIndex] || results[0];

  // Unique platform IDs for filtering
  const allPlatforms = Array.from(
    new Set(
      results.flatMap((item) =>
        item.platform_results.map((p) => p.platform_id)
      )
    )
  );

  const filteredPlatformResults =
    platformFilter === 'all'
      ? currentItem.platform_results
      : currentItem.platform_results.filter((p) => p.platform_id === platformFilter);

  return (
    <div className="space-y-6">
      {/* Top Summary Banner - Northpoint Scandinavian Card */}
      <div className="bg-surface rounded-3xl border border-line shadow-soft-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line/60">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-canvas-subtle border border-line text-xs font-semibold text-ink-secondary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
              <span>규격 검수 리포트 분석 완료</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
              검수 분석 완료 리포트
            </h2>
            <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
              총 <strong className="text-ink-primary font-mono">{results.length}개</strong> 이미지 파일 검수 완료
            </p>
          </div>

          {/* CSV Download Button */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>다운로드 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>CSV 리포트 다운로드 (엑셀 호환)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas-subtle/50">
            <span className="tracking-wider text-[11px] font-bold text-ink-muted uppercase block">
              지면 규격 통과율
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {complianceRate}%
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas-subtle/50">
            <span className="tracking-wider text-[11px] font-bold text-ink-muted uppercase block">
              타겟 매칭
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-accent">
                {matchedPlacementsCount}
              </span>
              <span className="text-xs text-ink-muted">건</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas-subtle/50">
            <span className="tracking-wider text-[11px] font-bold text-ink-muted uppercase block">
              지면 적합
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-accent-mint">
                {passPlacementsCount}
              </span>
              <span className="text-xs text-accent-mint font-semibold">건</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas-subtle/50">
            <span className="tracking-wider text-[11px] font-bold text-ink-muted uppercase block">
              규격 불일치
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-status-fail">
                {failPlacementsCount}
              </span>
              <span className="text-xs text-status-fail font-semibold">건</span>
            </div>
          </div>
        </div>

        {exportError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{exportError}</span>
          </div>
        )}
      </div>

      {/* Primary Tab Switcher: Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-canvas-subtle p-1 rounded-2xl border border-line inline-flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMainTab('batch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'batch'
                ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>전체 파일 일괄 종합 리포트</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-canvas-subtle border border-line text-ink-muted">
              {results.length}개 파일
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('detail')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'detail'
                ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>파일별 개별 상세 검수</span>
            <span className="text-[11px] text-ink-muted font-normal hidden md:inline truncate max-w-[150px]">
              (현재: {currentItem.filename})
            </span>
          </button>
        </div>

        {mainTab === 'detail' && (
          <button
            type="button"
            onClick={() => setMainTab('batch')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-accent hover:text-accent-hover bg-surface hover:bg-canvas-subtle border border-line px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>전체 일괄 리포트로 돌아가기</span>
          </button>
        )}
      </div>

      {/* Tab Content: Batch Overview */}
      {mainTab === 'batch' ? (
        <BatchSummaryView
          results={results}
          filePreviews={filePreviews}
          onSelectFileDetail={(index) => {
            setSelectedFileIndex(index);
            setMainTab('detail');
          }}
        />
      ) : (
        /* Tab Content: Individual File Detail */
        <div className="space-y-4">
          {/* Multiple Files Navigation Tabs */}
          {results.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-ink-muted flex-shrink-0 mr-1">
                소재 선택:
              </span>
              {results.map((item, idx) => {
                const isSelected = idx === selectedFileIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-accent text-white shadow-soft-xs'
                        : 'bg-surface text-ink-secondary border border-line hover:border-line-strong'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{item.filename}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-canvas-subtle text-ink-muted'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Top: Image Preview & Optional Text Ratio Gauge */}
          {currentItem.text_ratio !== null && currentItem.text_ratio !== undefined ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ImagePreview
                  filename={currentItem.filename}
                  imageInfo={currentItem.image_info}
                  previewUrl={filePreviews[currentItem.filename]}
                />
              </div>
              <div>
                <TextRatioGauge ratio={currentItem.text_ratio} />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <ImagePreview
                filename={currentItem.filename}
                imageInfo={currentItem.image_info}
                previewUrl={filePreviews[currentItem.filename]}
              />
            </div>
          )}

          {/* View Mode & Filter Controls */}
          <div className="bg-surface p-4 rounded-2xl border border-line shadow-soft-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <ListFilter className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink-primary">지면 표시 모드:</span>
              <div className="bg-canvas-subtle p-1 rounded-xl border border-line inline-flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setViewMode('target')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'target'
                      ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  🎯 매칭/타겟 지면만 보기 (권장)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('pass')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'pass'
                      ? 'bg-surface text-accent-mint shadow-soft-xs border border-line'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  ✅ 적합(PASS) 지면만 보기
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  📋 모든 지면 검수 보기
                </button>
              </div>
            </div>

            {/* Platform Filter Buttons */}
            {allPlatforms.length > 1 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                <Filter className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setPlatformFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    platformFilter === 'all'
                      ? 'bg-accent text-white'
                      : 'bg-canvas-subtle text-ink-secondary border border-line hover:border-line-strong'
                  }`}
                >
                  전체 매체
                </button>
                {allPlatforms.map((pid) => {
                  const match = currentItem.platform_results.find(
                    (p) => p.platform_id === pid
                  );
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setPlatformFilter(pid)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        platformFilter === pid
                          ? 'bg-accent text-white'
                          : 'bg-canvas-subtle text-ink-secondary border border-line hover:border-line-strong'
                      }`}
                    >
                      {match ? match.platform : pid}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform Results Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-ink-primary">
                매체별 지면 규격 검수 결과
              </h3>
              <span className="text-xs text-ink-muted font-mono">
                ({filteredPlatformResults.length}개 매체)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlatformResults.map((pResult, index) => (
                <ResultCard
                  key={index}
                  platformResult={pResult}
                  viewMode={viewMode}
                  imageUrl={filePreviews[currentItem.filename] || ''}
                  imageInfo={{
                    width: currentItem.image_info.width,
                    height: currentItem.image_info.height,
                    filename: currentItem.filename,
                  }}
                  onOpenSafeZone={(placementName, platformName, safeZone) => {
                    setActiveSafeZone({
                      placementName,
                      platformName,
                      safeZone,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safe Zone Visual Inspector Modal */}
      {activeSafeZone && (
        <SafeZoneModal
          isOpen={!!activeSafeZone}
          onClose={() => setActiveSafeZone(null)}
          imageUrl={filePreviews[currentItem.filename] || ''}
          imageInfo={{
            width: currentItem.image_info.width,
            height: currentItem.image_info.height,
            filename: currentItem.filename,
          }}
          placementName={activeSafeZone.placementName}
          platformName={activeSafeZone.platformName}
          safeZone={activeSafeZone.safeZone}
        />
      )}

      {/* Bottom Action Footer */}
      <div className="flex justify-end pt-4 border-t border-line/60">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-ink-secondary hover:text-ink-primary font-semibold px-4 py-2 rounded-full border border-line hover:border-line-strong bg-surface hover:bg-canvas-subtle transition-all cursor-pointer shadow-2xs"
        >
          새로운 소재 검수하기
        </button>
      </div>
    </div>
  );
};
