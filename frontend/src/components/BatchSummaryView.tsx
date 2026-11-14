import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { ValidationItem, CheckItem, PlacementResult } from '../types';

interface BatchSummaryViewProps {
  results: ValidationItem[];
  filePreviews: Record<string, string>;
  onSelectFileDetail: (index: number) => void;
}

interface FileSummary {
  index: number;
  filename: string;
  previewUrl?: string;
  width: number;
  height: number;
  format: string;
  fileSizeKb: number;
  textRatio?: number | null;
  overallStatus: 'pass' | 'fail' | 'warning';
  targetPlacementNames: string[];
  passedPlacementsCount: number;
  failedPlacementsCount: number;
  totalPlacementsCount: number;
  failureReasons: string[];
  warningReasons: string[];
}

export const BatchSummaryView: React.FC<BatchSummaryViewProps> = ({
  results,
  filePreviews,
  onSelectFileDetail,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'fail' | 'pass'>('all');

  // Process all files into clear summary objects
  const fileSummaries: FileSummary[] = results.map((item, index) => {
    const filename = item.filename;
    const previewUrl = filePreviews[filename];
    const width = item.image_info.width;
    const height = item.image_info.height;
    const format = item.image_info.format;
    const fileSizeKb = item.image_info.file_size_kb;
    const textRatio = item.text_ratio;

    let relevantPlacements: { platformName: string; placement: PlacementResult }[] = [];
    let hasTargetMatches = false;

    item.platform_results.forEach((platform) => {
      if (platform.overall === 'na') return;
      platform.placements.forEach((pl) => {
        if (pl.overall === 'skip') return;
        if (pl.is_matched_target) {
          hasTargetMatches = true;
          relevantPlacements.push({ platformName: platform.platform, placement: pl });
        }
      });
    });

    if (!hasTargetMatches) {
      item.platform_results.forEach((platform) => {
        if (platform.overall === 'na') return;
        platform.placements.forEach((pl) => {
          if (pl.overall === 'skip') return;
          relevantPlacements.push({ platformName: platform.platform, placement: pl });
        });
      });
    }

    let failureReasons: string[] = [];
    let warningReasons: string[] = [];
    let passedCount = 0;
    let failedCount = 0;
    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
    let targetPlacementNames: string[] = [];

    if (relevantPlacements.length === 0) {
      targetPlacementNames = ['호환 규격 지면 없음'];
      failureReasons = [
        `업로드된 소재 규격(${width}×${height}px)에 해당하는 주요 매체 공식 지면이 없습니다.`,
      ];
      overallStatus = 'fail';
      failedCount = 1;
    } else {
      relevantPlacements.forEach(({ placement }) => {
        if (placement.overall === 'pass' || placement.overall === 'success') {
          passedCount++;
        } else {
          failedCount++;
          placement.checks.forEach((chk: CheckItem) => {
            if (chk.status === 'fail' || chk.status === 'error') {
              const reasonStr = `[${placement.name}] ${chk.message}`;
              if (!failureReasons.includes(reasonStr)) {
                failureReasons.push(reasonStr);
              }
            } else if (chk.status === 'warning' || chk.status === 'warn') {
              const warnStr = `[${placement.name}] ${chk.message}`;
              if (!warningReasons.includes(warnStr)) {
                warningReasons.push(warnStr);
              }
            }
          });
        }
      });

      if (failedCount > 0) {
        overallStatus = 'fail';
      } else if (warningReasons.length > 0) {
        overallStatus = 'warning';
      } else {
        overallStatus = 'pass';
      }

      targetPlacementNames = relevantPlacements.map(
        (r) => `${r.platformName} > ${r.placement.name}`
      );
    }

    return {
      index,
      filename,
      previewUrl,
      width,
      height,
      format,
      fileSizeKb,
      textRatio,
      overallStatus,
      targetPlacementNames,
      passedPlacementsCount: passedCount,
      failedPlacementsCount: failedCount,
      totalPlacementsCount: relevantPlacements.length,
      failureReasons,
      warningReasons,
    };
  });

  const totalFiles = fileSummaries.length;
  const failFiles = fileSummaries.filter((f) => f.overallStatus === 'fail');
  const passFiles = fileSummaries.filter((f) => f.overallStatus === 'pass');
  const warnFiles = fileSummaries.filter((f) => f.overallStatus === 'warning');

  const displayedFiles = fileSummaries.filter((f) => {
    if (statusFilter === 'fail') return f.overallStatus === 'fail';
    if (statusFilter === 'pass') return f.overallStatus === 'pass';
    return true;
  });

  let dimFailCount = 0;
  let sizeFailCount = 0;
  let formatFailCount = 0;
  let textRatioFailCount = 0;
  let transFailCount = 0;

  failFiles.forEach((f) => {
    const combined = f.failureReasons.join(' ');
    if (combined.includes('해상도') || combined.includes('규격') || combined.includes('비율')) dimFailCount++;
    if (combined.includes('용량')) sizeFailCount++;
    if (combined.includes('형식') || combined.includes('포맷')) formatFailCount++;
    if (combined.includes('텍스트')) textRatioFailCount++;
    if (combined.includes('투명')) transFailCount++;
  });

  return (
    <div className="space-y-6">
      {/* 1. Batch KPI & Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files */}
        <div className="bg-surface p-5 rounded-2xl border border-line shadow-soft-xs flex items-center justify-between">
          <div>
            <span className="tracking-wider text-[11px] font-bold text-ink-muted uppercase block">
              검수 대상 소재
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-ink-primary">{totalFiles}</span>
              <span className="text-xs text-ink-secondary">개 파일</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-canvas-subtle border border-line flex items-center justify-center text-ink-secondary">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Pass Files */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pass' ? 'all' : 'pass')}
          className={`p-5 rounded-2xl border shadow-soft-xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'pass'
              ? 'bg-accent-mint/10 border-accent-mint ring-2 ring-accent-mint/30'
              : 'bg-surface border-line hover:border-line-strong'
          }`}
        >
          <div>
            <span className="tracking-wider text-[11px] font-bold text-accent-mint uppercase block">
              ✅ 전체 통과 (적합)
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-accent-mint">{passFiles.length}</span>
              <span className="text-xs text-accent-mint font-semibold">개 파일</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center text-accent-mint">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Fail Files */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'fail' ? 'all' : 'fail')}
          className={`p-5 rounded-2xl border shadow-soft-xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'fail'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-surface border-line hover:border-line-strong'
          }`}
        >
          <div>
            <span className="tracking-wider text-[11px] font-bold text-status-fail uppercase block">
              ❌ 불일치 / 반려 위험
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-status-fail">{failFiles.length}</span>
              <span className="text-xs text-status-fail font-semibold">개 파일</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-status-fail">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Warning / Caution */}
        <div className="bg-surface p-5 rounded-2xl border border-line shadow-soft-xs flex items-center justify-between">
          <div>
            <span className="tracking-wider text-[11px] font-bold text-amber-600 uppercase block">
              ⚠️ 수정 권장 (주의)
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-amber-700">{warnFiles.length}</span>
              <span className="text-xs text-amber-600 font-semibold">개 파일</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Failure Root-Cause Breakdown */}
      {failFiles.length > 0 && (
        <div className="bg-rose-500/[0.04] border border-rose-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-rose-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              🚨 검수 통과 실패 원인 요약 (즉시 수정 필요)
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {dimFailCount > 0 && (
              <span className="bg-surface border border-rose-500/20 text-rose-700 px-3 py-1.5 rounded-full font-medium shadow-2xs">
                📐 해상도 / 비율 불일치: <strong className="font-mono">{dimFailCount}개 파일</strong>
              </span>
            )}
            {sizeFailCount > 0 && (
              <span className="bg-surface border border-rose-500/20 text-rose-700 px-3 py-1.5 rounded-full font-medium shadow-2xs">
                💾 파일 용량 초과: <strong className="font-mono">{sizeFailCount}개 파일</strong>
              </span>
            )}
            {formatFailCount > 0 && (
              <span className="bg-surface border border-rose-500/20 text-rose-700 px-3 py-1.5 rounded-full font-medium shadow-2xs">
                📄 지원하지 않는 확장자/포맷: <strong className="font-mono">{formatFailCount}개 파일</strong>
              </span>
            )}
            {transFailCount > 0 && (
              <span className="bg-surface border border-rose-500/20 text-rose-700 px-3 py-1.5 rounded-full font-medium shadow-2xs">
                🔳 투명 배경(누끼) 미적용: <strong className="font-mono">{transFailCount}개 파일</strong>
              </span>
            )}
            {textRatioFailCount > 0 && (
              <span className="bg-surface border border-rose-500/20 text-rose-700 px-3 py-1.5 rounded-full font-medium shadow-2xs">
                ✍️ 텍스트 비율 기준 초과: <strong className="font-mono">{textRatioFailCount}개 파일</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Consolidated Table of All Files */}
      <div className="bg-surface rounded-3xl border border-line shadow-soft-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-5 bg-surface border-b border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-ink-primary">
              전체 소재 검수 현황표
            </span>
            <span className="text-xs font-mono text-ink-muted">
              ({displayedFiles.length}/{totalFiles})
            </span>
          </div>

          <div className="bg-canvas-subtle p-1 rounded-2xl border border-line inline-flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-surface text-ink-primary shadow-soft-xs border border-line'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              전체 ({totalFiles})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('fail')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'fail'
                  ? 'bg-surface text-status-fail shadow-soft-xs border border-line'
                  : 'text-ink-secondary hover:text-status-fail'
              }`}
            >
              불일치 ({failFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pass')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'pass'
                  ? 'bg-surface text-accent-mint shadow-soft-xs border border-line'
                  : 'text-ink-secondary hover:text-accent-mint'
              }`}
            >
              통과 ({passFiles.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-canvas-subtle/60 border-b border-line text-ink-muted font-bold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">소재 파일명 / 사양</th>
                <th className="py-3 px-4 min-w-[140px]">매칭 타겟 지면</th>
                <th className="py-3 px-4 min-w-[110px] text-center">종합 판정</th>
                <th className="py-3 px-4 min-w-[280px]">검수 결과 및 불일치 사유 요약</th>
                <th className="py-3 px-4 w-24 text-center">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {displayedFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-muted">
                    선택한 필터 조건에 해당하는 소재가 없습니다.
                  </td>
                </tr>
              ) : (
                displayedFiles.map((file) => {
                  const isFail = file.overallStatus === 'fail';
                  const isPass = file.overallStatus === 'pass';

                  return (
                    <tr
                      key={file.index}
                      className={`hover:bg-canvas-subtle/50 transition-colors ${
                        isFail ? 'bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center text-ink-muted font-mono font-semibold">
                        {file.index + 1}
                      </td>

                      {/* File & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.filename}
                              className="w-12 h-12 rounded-xl object-cover border border-line bg-surface flex-shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-canvas-subtle flex items-center justify-center text-ink-muted border border-line flex-shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-ink-primary truncate max-w-[220px]" title={file.filename}>
                              {file.filename}
                            </div>
                            <div className="text-[11px] text-ink-muted font-mono mt-0.5 space-x-1.5">
                              <span>{file.width}×{file.height}px</span>
                              <span>•</span>
                              <span>{file.format}</span>
                              <span>•</span>
                              <span>{file.fileSizeKb.toFixed(1)}KB</span>
                              {file.textRatio !== null && file.textRatio !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className={`font-semibold ${file.textRatio > 0.2 ? 'text-amber-600' : 'text-ink-secondary'}`}>
                                    텍스트 {(file.textRatio * 100).toFixed(0)}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Placement */}
                      <td className="py-3.5 px-4">
                        {file.targetPlacementNames.length > 0 ? (
                          <div className="space-y-1">
                            {file.targetPlacementNames.slice(0, 2).map((tp, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] font-semibold text-accent bg-accent/5 border border-accent/20 px-2.5 py-0.5 rounded-full truncate max-w-[200px]"
                                title={tp}
                              >
                                {tp}
                              </div>
                            ))}
                            {file.targetPlacementNames.length > 2 && (
                              <span className="text-[10px] text-ink-muted block pl-1">
                                외 {file.targetPlacementNames.length - 2}개 지면
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted text-xs">일반 검수</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isPass ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-accent-mint bg-accent-mint/10 border border-accent-mint/20 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                            <span>적합 (통과)</span>
                          </span>
                        ) : isFail ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-status-fail bg-rose-500/10 border border-rose-500/20 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-fail" />
                            <span>반려 위험</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-500/10 border border-amber-500/20 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>수정 권장</span>
                          </span>
                        )}
                      </td>

                      {/* Failure / Success Summary Reasons */}
                      <td className="py-3.5 px-4">
                        {isPass ? (
                          <span className="text-accent-mint font-semibold text-xs flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-accent-mint" />
                            <span>해상도, 파일 형식, 용량, 비율 기준을 모두 충족했습니다.</span>
                          </span>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {file.failureReasons.map((reason, rIdx) => (
                              <div
                                key={rIdx}
                                className="text-[11px] text-status-fail bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-lg font-medium leading-tight"
                              >
                                {reason}
                              </div>
                            ))}
                            {file.warningReasons.map((warn, wIdx) => (
                              <div
                                key={wIdx}
                                className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg font-medium leading-tight"
                              >
                                {warn}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Detail Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectFileDetail(file.index)}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-accent hover:text-accent-hover bg-surface hover:bg-canvas-subtle border border-line px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                        >
                          <span>상세</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
