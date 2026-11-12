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

    // Placements targeted for this file (ignoring platforms marked 'na')
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
          // Collect specific fail checks
          placement.checks.forEach((chk: CheckItem) => {
            if (chk.status === 'fail' || chk.status === 'error') {
              const reasonStr = `[${placement.name}] ${chk.message}`;
              if (!failureReasons.includes(reasonStr)) {
                failureReasons.push(reasonStr);
              }
            } else if (chk.status === 'warning') {
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

  // Filter files based on user tab selection
  const displayedFiles = fileSummaries.filter((f) => {
    if (statusFilter === 'fail') return f.overallStatus === 'fail';
    if (statusFilter === 'pass') return f.overallStatus === 'pass';
    return true;
  });

  // Collect category counts for why files failed
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">검수 대상 소재</span>
            <span className="text-2xl font-black text-slate-800">{totalFiles}개 파일</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Pass Files */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pass' ? 'all' : 'pass')}
          className={`p-4 rounded-xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'pass'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700 block">✅ 전체 통과 (적합)</span>
            <span className="text-2xl font-black text-emerald-800">{passFiles.length}개 파일</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Fail Files */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'fail' ? 'all' : 'fail')}
          className={`p-4 rounded-xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'fail'
              ? 'bg-red-50 border-red-400 ring-2 ring-red-200'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-red-700 block">❌ 불일치 / 반려 위험</span>
            <span className="text-2xl font-black text-red-800">{failFiles.length}개 파일</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Warning / Caution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block">⚠️ 수정 권장 (주의)</span>
            <span className="text-2xl font-black text-amber-800">{warnFiles.length}개 파일</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Failure Root-Cause Breakdown (Only if failures exist) */}
      {failFiles.length > 0 && (
        <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              🚨 검수 통과 실패 원인 요약 (즉시 수정 필요)
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {dimFailCount > 0 && (
              <span className="bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                📐 해상도 / 비율 불일치: <strong>{dimFailCount}개 파일</strong>
              </span>
            )}
            {sizeFailCount > 0 && (
              <span className="bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                💾 파일 용량 초과: <strong>{sizeFailCount}개 파일</strong>
              </span>
            )}
            {formatFailCount > 0 && (
              <span className="bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                📄 지원하지 않는 확장자/포맷: <strong>{formatFailCount}개 파일</strong>
              </span>
            )}
            {transFailCount > 0 && (
              <span className="bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                🔳 투명 배경(누끼) 미적용: <strong>{transFailCount}개 파일</strong>
              </span>
            )}
            {textRatioFailCount > 0 && (
              <span className="bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                ✍️ 텍스트 비율 기준 초과: <strong>{textRatioFailCount}개 파일</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Consolidated Table of All Files */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">
              전체 소재 검수 현황표
            </span>
            <span className="text-xs text-slate-400">
              ({displayedFiles.length}/{totalFiles}개 표시 중)
            </span>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({totalFiles})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('fail')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'fail'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              ❌ 불일치만 보기 ({failFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pass')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === 'pass'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              ✅ 통과만 보기 ({passFiles.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">소재 파일명 / 사양</th>
                <th className="py-3 px-4 min-w-[140px]">매칭 타겟 지면</th>
                <th className="py-3 px-4 min-w-[110px] text-center">종합 판정</th>
                <th className="py-3 px-4 min-w-[280px]">검수 결과 및 불일치 사유 요약</th>
                <th className="py-3 px-4 w-24 text-center">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
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
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFail ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-semibold">
                        {file.index + 1}
                      </td>

                      {/* File & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.filename}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-white flex-shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate max-w-[220px]" title={file.filename}>
                              {file.filename}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 space-x-1.5">
                              <span>{file.width}×{file.height}px</span>
                              <span>•</span>
                              <span>{file.format}</span>
                              <span>•</span>
                              <span>{file.fileSizeKb.toFixed(1)}KB</span>
                              {file.textRatio !== null && file.textRatio !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className={`font-semibold ${file.textRatio > 0.2 ? 'text-amber-600' : 'text-slate-500'}`}>
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
                                className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded truncate max-w-[200px]"
                                title={tp}
                              >
                                {tp}
                              </div>
                            ))}
                            {file.targetPlacementNames.length > 2 && (
                              <span className="text-[10px] text-slate-400 block">
                                외 {file.targetPlacementNames.length - 2}개 지면
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">일반 검수</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isPass ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>적합 (통과)</span>
                          </span>
                        ) : isFail ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold text-red-700 bg-red-50 border border-red-200">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>반려 위험</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>수정 권장</span>
                          </span>
                        )}
                      </td>

                      {/* Failure / Success Summary Reasons */}
                      <td className="py-3.5 px-4">
                        {isPass ? (
                          <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>해상도, 파일 형식, 용량, 비율 기준을 모두 충족했습니다.</span>
                          </span>
                        ) : (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {file.failureReasons.map((reason, rIdx) => (
                              <div
                                key={rIdx}
                                className="text-[11px] text-red-700 bg-red-100/60 border border-red-200/80 px-2 py-0.5 rounded font-medium leading-tight"
                              >
                                {reason}
                              </div>
                            ))}
                            {file.warningReasons.map((warn, wIdx) => (
                              <div
                                key={wIdx}
                                className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium leading-tight"
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
                          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
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
