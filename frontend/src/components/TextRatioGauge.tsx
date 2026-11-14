import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface TextRatioGaugeProps {
  ratio: number | null | undefined;
}

export const TextRatioGauge: React.FC<TextRatioGaugeProps> = ({ ratio }) => {
  if (ratio === null || ratio === undefined) {
    return (
      <div className="flex items-center space-x-2 text-xs text-ink-muted bg-canvas-subtle p-4 rounded-2xl border border-line">
        <Info className="w-4 h-4 text-ink-muted flex-shrink-0" />
        <span>텍스트 비율 분석이 수행되지 않았습니다.</span>
      </div>
    );
  }

  const percent = Math.min(Math.max(ratio * 100, 0), 100);
  const formattedPercent = percent.toFixed(1);

  let barColor = 'bg-accent-mint';
  let badgeColor = 'bg-accent-mint/10 text-accent-mint border-accent-mint/20';
  let statusText = '안전 (텍스트 15% 이하 권장 만족)';
  let StatusIcon = CheckCircle;

  if (percent > 30) {
    barColor = 'bg-status-fail';
    badgeColor = 'bg-rose-500/10 text-status-fail border-rose-500/20';
    statusText = '주의 (30% 초과 — 메타/구글 도달률 저하 및 네이버 GFA 반려 위험)';
    StatusIcon = AlertTriangle;
  } else if (percent > 20) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    statusText = '경고 (20% 초과 — 네이버 GFA 20% 규격 초과로 집행 불가 위험)';
    StatusIcon = AlertTriangle;
  } else if (percent > 15) {
    barColor = 'bg-amber-400';
    badgeColor = 'bg-amber-400/10 text-amber-800 border-amber-400/20';
    statusText = '적정 (15~20% 구간 — 네이버 20% 이하 허용 기준 충족)';
    StatusIcon = Info;
  }

  return (
    <div className="bg-surface rounded-2xl p-4 border border-line shadow-soft-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-ink-primary">텍스트 면적 비율:</span>
          <span className="text-xs font-bold font-mono text-ink-primary bg-canvas-subtle px-2 py-0.5 rounded-md border border-line">
            {formattedPercent}%
          </span>
        </div>
        <div
          className={`flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{percent <= 20 ? '가이드라인 준수' : '규격 주의'}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-2.5 bg-canvas-subtle rounded-full overflow-hidden border border-line/60">
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-ink-muted/40 z-10"
          style={{ left: '15%' }}
          title="15% 권장 기준선"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500/70 z-10"
          style={{ left: '20%' }}
          title="20% 네이버 상한 기준선"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-status-fail/80 z-10"
          style={{ left: '30%' }}
          title="30% 위험 기준선"
        />

        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* Threshold Guide Labels */}
      <div className="flex justify-between text-[10px] text-ink-muted font-mono">
        <span>0%</span>
        <span>15% (권장)</span>
        <span>20% (네이버)</span>
        <span>30%</span>
        <span>100%</span>
      </div>

      <div className="text-[11px] text-ink-secondary leading-tight pt-1 border-t border-line/60">
        {statusText}
      </div>
    </div>
  );
};
