import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Layers,
  Target,
  ListFilter,
  LayoutGrid,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { ValidationItem } from '../types';
import { ImagePreview } from './ImagePreview';
import { TextRatioGauge } from './TextRatioGauge';
import { ResultCard } from './ResultCard';
import { BatchSummaryView } from './BatchSummaryView';
import { downloadExcelReport } from '../api/validator';

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

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await downloadExcelReport(results, `ad_creative_report_${Date.now()}.xlsx`);
    } catch (err: unknown) {
      console.error('Failed to export excel:', err);
      setExportError('엑셀 파일 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
      {/* Top Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                <FileCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">
                검수 분석 완료 리포트
              </h2>
            </div>
            <p className="text-slate-300 text-sm">
              총 <span className="font-extrabold text-white">{results.length}개</span> 이미지 파일 검수 완료 —{' '}
              지면 규격 통과율:{' '}
              <span className="font-extrabold text-emerald-400">
                {totalPlacementsCount > 0
                  ? ((passPlacementsCount / totalPlacementsCount) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center min-w-[90px]">
              <span className="text-[11px] text-slate-400 block font-medium">검수 파일</span>
              <span className="text-lg font-bold text-white font-mono">{results.length}개</span>
            </div>

            <div className="bg-blue-950/40 border border-blue-800/50 px-3.5 py-2 rounded-xl text-center min-w-[90px]">
              <span className="text-[11px] text-blue-400 block font-medium flex items-center justify-center space-x-1">
                <Target className="w-3 h-3 inline" />
                <span>타겟 매칭</span>
              </span>
              <span className="text-lg font-bold text-blue-300 font-mono">
                {matchedPlacementsCount}건
              </span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-2 rounded-xl text-center min-w-[90px]">
              <span className="text-[11px] text-emerald-400 block font-medium flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3 h-3 inline" />
                <span>지면 적합</span>
              </span>
              <span className="text-lg font-bold text-emerald-300 font-mono">
                {passPlacementsCount}건
              </span>
            </div>

            <div className="bg-red-950/40 border border-red-800/50 px-3.5 py-2 rounded-xl text-center min-w-[90px]">
              <span className="text-[11px] text-red-400 block font-medium flex items-center justify-center space-x-1">
                <XCircle className="w-3 h-3 inline" />
                <span>규격 불일치</span>
              </span>
              <span className="text-lg font-bold text-red-300 font-mono">
                {failPlacementsCount}건
              </span>
            </div>

            {/* Excel Download Button */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>다운로드 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📥 엑셀 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportError && (
          <div className="mt-4 p-2.5 bg-red-900/50 border border-red-700 rounded-lg text-xs text-red-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{exportError}</span>
          </div>
        )}
      </div>

      {/* Primary Tab Switcher: Batch Overview vs Individual File Detail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setMainTab('batch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainTab === 'batch'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>📊 전체 파일 일괄 종합 리포트</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                mainTab === 'batch'
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {results.length}개 파일
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('detail')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainTab === 'detail'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>🖼️ 파일별 개별 상세 검수</span>
            <span className="text-[11px] text-slate-400 font-normal hidden md:inline truncate max-w-[150px]">
              (현재: {currentItem.filename})
            </span>
          </button>
        </div>

        {mainTab === 'detail' && (
          <button
            type="button"
            onClick={() => setMainTab('batch')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
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
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex-shrink-0 mr-1">
                소재 선택:
              </span>
              {results.map((item, idx) => {
                const isSelected = idx === selectedFileIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{item.filename}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Top: Image Preview & Text Ratio */}
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

          {/* View Mode & Filter Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">지면 표시 모드:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode('target')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'target'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎯 매칭/타겟 지면만 보기 (권장)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('pass')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'pass'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ 적합(PASS) 지면만 보기
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 모든 지면 검수 보기
                </button>
              </div>
            </div>

            {/* Platform Filter Buttons */}
            {allPlatforms.length > 1 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setPlatformFilter('all')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    platformFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        platformFilter === pid
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                매체별 지면 규격 검수 결과
              </h3>
              <span className="text-xs text-slate-400">
                ({filteredPlatformResults.length}개 매체)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlatformResults.map((pResult, index) => (
                <ResultCard key={index} platformResult={pResult} viewMode={viewMode} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          새로운 소재 검수하기
        </button>
      </div>
    </div>
  );
};
