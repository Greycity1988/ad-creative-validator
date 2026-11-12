import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface TextRatioGaugeProps {
  ratio: number | null | undefined;
}

export const TextRatioGauge: React.FC<TextRatioGaugeProps> = ({ ratio }) => {
  if (ratio === null || ratio === undefined) {
    return (
      <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>텍스트 비율 분석이 수행되지 않았습니다.</span>
      </div>
    );
  }

  // ratio is between 0 and 1, e.g. 0.153 -> 15.3%
  const percent = Math.min(Math.max(ratio * 100, 0), 100);
  const formattedPercent = percent.toFixed(1);

  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = '안전 (텍스트 15% 이하 권장 만족)';
  let StatusIcon = CheckCircle;
  let statusColor = 'text-emerald-600';

  if (percent > 30) {
    barColor = 'bg-red-500';
    badgeColor = 'bg-red-50 text-red-700 border-red-200';
    statusText = '주의 (30% 초과 — 메타/구글 도달률 저하 및 네이버 GFA 반려 위험)';
    StatusIcon = AlertTriangle;
    statusColor = 'text-red-600';
  } else if (percent > 20) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = '경고 (20% 초과 — 네이버 GFA 20% 규격 초과로 집행 불가 위험)';
    StatusIcon = AlertTriangle;
    statusColor = 'text-amber-600';
  } else if (percent > 15) {
    barColor = 'bg-yellow-500';
    badgeColor = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    statusText = '적정 (15~20% 구간 — 네이버 20% 이하 허용 기준 충족)';
    StatusIcon = Info;
    statusColor = 'text-yellow-600';
  }

  return (
    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold text-slate-700">텍스트 면적 비율:</span>
          <span className="text-xs font-extrabold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
            {formattedPercent}%
          </span>
        </div>
        <div
          className={`flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}
        >
          <StatusIcon className={`w-3 h-3 ${statusColor}`} />
          <span>{percent <= 20 ? '가이드라인 준수' : '규격 주의'}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        {/* Threshold Markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-70"
          style={{ left: '15%' }}
          title="15% 권장 기준선"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 opacity-70"
          style={{ left: '20%' }}
          title="20% 네이버 상한 기준선"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10 opacity-70"
          style={{ left: '30%' }}
          title="30% 위험 기준선"
        />

        {/* Progress Fill */}
        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* Threshold Guide Labels */}
      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
        <span>0%</span>
        <span className="relative right-4">15% (권장)</span>
        <span className="relative right-2">20% (네이버)</span>
        <span>30%</span>
        <span>100%</span>
      </div>

      {/* Status Warning or Tip */}
      <p className={`text-[11px] font-medium leading-relaxed ${statusColor}`}>
        {statusText}
      </p>
    </div>
  );
};
