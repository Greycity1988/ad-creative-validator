import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Layers,
  Smartphone,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SafeZoneSpec } from '../types';

interface SafeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageInfo?: { width: number; height: number; filename?: string };
  placementName: string;
  platformName: string;
  safeZone: SafeZoneSpec;
}

export const SafeZoneModal: React.FC<SafeZoneModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageInfo,
  placementName,
  platformName,
  safeZone,
}) => {
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showUIElements, setShowUIElements] = useState<boolean>(true);
  const [showPhoneFrame, setShowPhoneFrame] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If vertical aspect ratio (9:16), default phone frame to true
    if (imageInfo && imageInfo.height > imageInfo.width * 1.5) {
      setShowPhoneFrame(true);
    } else {
      setShowPhoneFrame(false);
    }
  }, [imageInfo, isOpen]);

  if (!isOpen) return null;

  const actualWidth = imageInfo?.width || safeZone.base_width || 1200;
  const actualHeight = imageInfo?.height || safeZone.base_height || 600;

  // Calculate scaled margins
  let scaleX = 1;
  let scaleY = 1;
  if (safeZone.base_width && safeZone.base_height) {
    scaleX = actualWidth / safeZone.base_width;
    scaleY = actualHeight / safeZone.base_height;
  }

  const topPx = Math.round((safeZone.top_px || 0) * scaleY);
  const bottomPx = Math.round((safeZone.bottom_px || 0) * scaleY);
  const leftPx = Math.round((safeZone.left_px || 0) * scaleX);
  const rightPx = Math.round((safeZone.right_px || 0) * scaleX);

  const topPercent = (topPx / actualHeight) * 100;
  const bottomPercent = (bottomPx / actualHeight) * 100;
  const leftPercent = (leftPx / actualWidth) * 100;
  const rightPercent = (rightPx / actualWidth) * 100;

  // Export combined canvas preview
  const handleExportAnnotated = async () => {
    try {
      setIsExporting(true);
      const canvas = document.createElement('canvas');
      canvas.width = actualWidth;
      canvas.height = actualHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('이미지 로드 실패'));
      });

      // 1. Draw base image
      ctx.drawImage(img, 0, 0, actualWidth, actualHeight);

      if (showSafeZone) {
        // 2. Draw unsafe margin bands
        ctx.fillStyle = `rgba(239, 68, 68, ${overlayOpacity * 0.4})`;

        // Top band
        if (topPx > 0) ctx.fillRect(0, 0, actualWidth, topPx);
        // Bottom band
        if (bottomPx > 0) ctx.fillRect(0, actualHeight - bottomPx, actualWidth, bottomPx);
        // Left band
        if (leftPx > 0) ctx.fillRect(0, topPx, leftPx, actualHeight - topPx - bottomPx);
        // Right band
        if (rightPx > 0) ctx.fillRect(actualWidth - rightPx, topPx, rightPx, actualHeight - topPx - bottomPx);

        // 3. Draw safe zone border
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = Math.max(3, Math.round(actualWidth / 300));
        ctx.setLineDash([12, 6]);
        ctx.strokeRect(leftPx, topPx, actualWidth - leftPx - rightPx, actualHeight - topPx - bottomPx);

        // 4. Draw label
        ctx.fillStyle = '#10b981';
        ctx.font = `bold ${Math.max(16, Math.round(actualWidth / 40))}px sans-serif`;
        ctx.fillText('✓ SAFE ZONE (안전 영역)', leftPx + 15, topPx + 30);
      }

      // Download canvas
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `safe_zone_${imageInfo?.filename || 'ad_creative'}.png`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Modal Header ── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-base">📐</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  세이프존(Safe Zone) 가이드 인스펙터
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 font-mono">
                  {platformName}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {placementName} 공식 게재 화면 안전 영역 및 UI 차폐 영역 대조
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleExportAnnotated}
              disabled={isExporting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="세이프존 가이드라인이 합성된 이미지 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">대조 미리보기 저장</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Interactive Controls Toolbar ── */}
        <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSafeZone(!showSafeZone)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                showSafeZone
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {showSafeZone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>세이프존 가이드</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUIElements(!showUIElements)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                showUIElements
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>앱 UI 가림 영역 ({safeZone.ui_elements?.length || 1}개)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhoneFrame(!showPhoneFrame)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                showPhoneFrame
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>스마트폰 프레임 목업</span>
            </button>
          </div>

          {/* Opacity Slider */}
          {showSafeZone && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-medium text-slate-600">가이드 투명도:</span>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] font-mono text-slate-500 w-8">
                {Math.round(overlayOpacity * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* ── 3. Visual Canvas Inspector View ── */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/95 flex items-center justify-center min-h-[360px]">
          <div
            ref={containerRef}
            className={`relative transition-all duration-300 ${
              showPhoneFrame
                ? 'p-3 bg-slate-800 rounded-[2.5rem] ring-8 ring-slate-700 shadow-2xl max-w-sm'
                : 'max-w-full'
            }`}
          >
            {/* Phone Notch/Speaker simulation */}
            {showPhoneFrame && (
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30" />
            )}

            {/* Inner Image + SafeZone Overlay Wrapper */}
            <div className="relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Ad Creative Safe Zone Inspection"
                className="max-h-[55vh] max-w-full object-contain block select-none pointer-events-none"
              />

              {/* ── Safe Zone Overlay Layer ── */}
              {showSafeZone && (
                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                  {/* Top Unsafe Margin */}
                  {topPercent > 0 && (
                    <div
                      style={{
                        height: `${topPercent}%`,
                        backgroundColor: `rgba(239, 68, 68, ${overlayOpacity * 0.45})`,
                      }}
                      className="w-full border-b border-red-500/80 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white tracking-wide shadow-inner"
                    >
                      <span className="bg-red-600/90 px-2 py-0.5 rounded shadow">
                        상단 위험 영역 ({topPx}px)
                      </span>
                    </div>
                  )}

                  {/* Middle Band with Left and Right Margins */}
                  <div className="flex-1 w-full flex justify-between relative">
                    {/* Left Unsafe Margin */}
                    {leftPercent > 0 && (
                      <div
                        style={{
                          width: `${leftPercent}%`,
                          backgroundColor: `rgba(239, 68, 68, ${overlayOpacity * 0.45})`,
                        }}
                        className="h-full border-r border-red-500/80 flex items-center justify-center text-[10px] font-bold text-white"
                      >
                        <span className="rotate-90 whitespace-nowrap bg-red-600/90 px-1.5 py-0.5 rounded">
                          좌측 {leftPx}px
                        </span>
                      </div>
                    )}

                    {/* Central Safe Zone Box */}
                    <div className="flex-1 h-full border-2 border-dashed border-emerald-400 relative m-0.5 flex flex-col justify-between p-2">
                      <div className="inline-flex items-center space-x-1 bg-emerald-600/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow self-start">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>안전 영역 (Safe Zone)</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold self-center opacity-80">
                        주요 카피, 로고, 메인 오브젝트 권장 배치 구역
                      </span>
                    </div>

                    {/* Right Unsafe Margin */}
                    {rightPercent > 0 && (
                      <div
                        style={{
                          width: `${rightPercent}%`,
                          backgroundColor: `rgba(239, 68, 68, ${overlayOpacity * 0.45})`,
                        }}
                        className="h-full border-l border-red-500/80 flex items-center justify-center text-[10px] font-bold text-white"
                      >
                        <span className="-rotate-90 whitespace-nowrap bg-red-600/90 px-1.5 py-0.5 rounded">
                          우측 {rightPx}px
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Unsafe Margin */}
                  {bottomPercent > 0 && (
                    <div
                      style={{
                        height: `${bottomPercent}%`,
                        backgroundColor: `rgba(239, 68, 68, ${overlayOpacity * 0.45})`,
                      }}
                      className="w-full border-t border-red-500/80 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white tracking-wide shadow-inner"
                    >
                      <span className="bg-red-600/90 px-2 py-0.5 rounded shadow">
                        하단 위험 영역 ({bottomPx}px)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Simulated Platform UI Elements Overlay ── */}
              {showUIElements && safeZone.ui_elements && safeZone.ui_elements.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {safeZone.ui_elements.map((ui, idx) => {
                    let posClass = 'bottom-2 right-2';
                    if (ui.position === 'top') posClass = 'top-2 inset-x-2';
                    else if (ui.position === 'top-left') posClass = 'top-2 left-2';
                    else if (ui.position === 'top-right') posClass = 'top-2 right-2';
                    else if (ui.position === 'bottom-left') posClass = 'bottom-2 left-2';
                    else if (ui.position === 'bottom-center') posClass = 'bottom-3 inset-x-8 flex justify-center';
                    else if (ui.position === 'right') posClass = 'right-2 bottom-16 flex flex-col items-center';

                    return (
                      <div key={idx} className={`absolute ${posClass}`}>
                        <div className="bg-slate-950/85 text-white border border-amber-400/80 rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>{ui.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Guide Specs & Action Summary Box ── */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 text-xs text-slate-700 space-y-2.5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">
                📌 공식 세이프존 가이드라인
              </span>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                기본 규격 {safeZone.base_width || actualWidth}×{safeZone.base_height || actualHeight}px
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              소재 해상도: <strong>{actualWidth}×{actualHeight}px</strong> (배율:{' '}
              {scaleX.toFixed(2)}배)
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed font-medium">
            {safeZone.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">상단 마진</span>
              <strong className="text-slate-800">{topPx}px</strong>{' '}
              <span className="text-slate-400 text-[10px]">({topPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">하단 마진</span>
              <strong className="text-slate-800">{bottomPx}px</strong>{' '}
              <span className="text-slate-400 text-[10px]">({bottomPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">좌측 마진</span>
              <strong className="text-slate-800">{leftPx}px</strong>{' '}
              <span className="text-slate-400 text-[10px]">({leftPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">우측 마진</span>
              <strong className="text-slate-800">{rightPx}px</strong>{' '}
              <span className="text-slate-400 text-[10px]">({rightPercent.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start space-x-2 text-[11px] text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>디자이너 팁:</strong> 상하좌우 붉은색 테두리 영역(위험 영역)에 배치된 카피나 로고는 디바이스 해상도에 따라 잘리거나 매체사 시스템 UI(AD 마크 등)에 가려질 수 있습니다. 핵심 정보는 반드시 <strong>중앙 녹색 안전 영역(Safe Zone)</strong> 내부에 배치하세요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
