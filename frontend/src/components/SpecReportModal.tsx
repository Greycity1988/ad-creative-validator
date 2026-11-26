import React, { useEffect, useRef, useState } from 'react';
import { X, FileSearch, ExternalLink, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  REPORT_FORMATS,
  ReportFormat,
  isOfficialUrl,
  officialHosts,
  platformName,
  reportablePlatforms,
  validateSpecReport,
} from '../utils/specReport';
import { specReportUrl } from '../constants/links';

export interface SpecReportPrefill {
  platformId?: string;
  width?: number;
  height?: number;
  format?: string;
}

interface SpecReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: SpecReportPrefill | null;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; issueUrl: string; duplicate: boolean }
  | { kind: 'error'; message: string; fallback: boolean };

const inputCls =
  'w-full px-3 py-2 text-xs rounded-lg border border-line-strong bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent';

export const SpecReportModal: React.FC<SpecReportModalProps> = ({ isOpen, onClose, prefill }) => {
  const platforms = reportablePlatforms();
  const openedAt = useRef(Date.now());
  const [platformId, setPlatformId] = useState('');
  const [placementName, setPlacementName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maxKb, setMaxKb] = useState('');
  const [formats, setFormats] = useState<ReportFormat[]>([]);
  const [transparent, setTransparent] = useState(false);
  const [guideUrl, setGuideUrl] = useState('');
  const [docDate, setDocDate] = useState('');
  const [note, setNote] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // Reset and prefill each time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    openedAt.current = Date.now();
    const f = (prefill?.format || '').toLowerCase().replace('jpeg', 'jpg');
    setPlatformId(prefill?.platformId && platformName(prefill.platformId) ? prefill.platformId : '');
    setWidth(prefill?.width ? String(prefill.width) : '');
    setHeight(prefill?.height ? String(prefill.height) : '');
    setFormats((REPORT_FORMATS as readonly string[]).includes(f) ? [f as ReportFormat] : []);
    setPlacementName('');
    setMaxKb('');
    setTransparent(false);
    setGuideUrl('');
    setDocDate('');
    setNote('');
    setWebsite('');
    setStatus({ kind: 'idle' });
  }, [isOpen, prefill]);

  // An error message describes the old input; drop it as soon as the visitor edits anything.
  useEffect(() => {
    setStatus((s) => (s.kind === 'error' ? { kind: 'idle' } : s));
  }, [platformId, placementName, width, height, maxKb, formats, transparent, guideUrl, docDate]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const payload = {
    platformId,
    placementName,
    width: Number(width),
    height: Number(height),
    maxKb: maxKb === '' ? undefined : Number(maxKb),
    formats,
    transparent,
    guideUrl: guideUrl.trim(),
    docDate: docDate || undefined,
    note: note || undefined,
  };
  const urlTyped = guideUrl.trim().length > 0;
  const urlOfficial = platformId ? isOfficialUrl(platformId, guideUrl.trim()) : false;
  const githubFallbackUrl = specReportUrl({
    platforms: platformId ? [platformName(platformId) || platformId] : [],
    width: Number(width) || 0,
    height: Number(height) || 0,
    format: formats.join(', ').toUpperCase() || '-',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const checked = validateSpecReport(payload);
    if (!checked.ok) {
      setStatus({ kind: 'error', message: checked.error, fallback: false });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/spec-report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, website, elapsedMs: Date.now() - openedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        issueUrl?: string;
        duplicate?: boolean;
        error?: string;
        fallback?: boolean;
      };
      if (res.ok && data.ok) {
        setStatus({ kind: 'done', issueUrl: data.issueUrl || '', duplicate: !!data.duplicate });
      } else {
        setStatus({
          kind: 'error',
          message: data.error || '제보를 보내지 못했습니다.',
          fallback: data.fallback === true || res.status >= 500,
        });
      }
    } catch {
      setStatus({ kind: 'error', message: '네트워크 오류로 제보를 보내지 못했습니다.', fallback: true });
    }
  };

  const toggleFormat = (f: ReportFormat) =>
    setFormats((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spec-report-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-soft-xl border border-line w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-line-subtle flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-[#A8FF1A] text-black rounded-xl shadow-soft-xs">
              <FileSearch className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 id="spec-report-title" className="text-base font-extrabold text-ink-primary">
                공식 규격 제보
              </h2>
              <p className="text-xs text-ink-tertiary mt-0.5 leading-relaxed">
                ACV에 없는 공식 지면을 알려주세요. 공식 가이드와 자동 대조한 뒤, 운영자 확인을 거쳐 사이트에 반영됩니다.
                GitHub 계정이 없어도 됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-line/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status.kind === 'done' ? (
          <div className="p-6 space-y-4 text-sm">
            <div className="flex items-start gap-2.5 text-ink-primary">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold">
                  {status.duplicate ? '이미 접수된 제보에 내용을 더했습니다.' : '제보가 접수됐습니다. 감사합니다.'}
                </p>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  자동 점검이 공식 가이드에서 입력하신 값을 찾아보고 결과를 이슈에 댓글로 남깁니다. 확인되면 운영자가
                  검토해 사이트에 반영합니다. 진행 상황은 아래 이슈나 Feedback의 반영 내역에서 볼 수 있습니다.
                </p>
              </div>
            </div>
            {status.issueUrl && (
              <a
                href={status.issueUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                접수된 제보 보기 <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-extrabold bg-[#A8FF1A] text-black cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3.5 overflow-y-auto text-xs" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">매체 *</span>
                <select value={platformId} onChange={(e) => setPlatformId(e.target.value)} className={inputCls}>
                  <option value="">선택</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">지면 이름 *</span>
                <input
                  value={placementName}
                  onChange={(e) => setPlacementName(e.target.value)}
                  placeholder="예: 스마트채널"
                  maxLength={60}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">가로(px) *</span>
                <input inputMode="numeric" value={width} onChange={(e) => setWidth(e.target.value.replace(/\D/g, ''))} className={inputCls} />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">세로(px) *</span>
                <input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))} className={inputCls} />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">최대 용량(KB)</span>
                <input
                  inputMode="numeric"
                  value={maxKb}
                  onChange={(e) => setMaxKb(e.target.value.replace(/\D/g, ''))}
                  placeholder="가이드에 있으면"
                  className={inputCls}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-bold text-ink-primary">파일 형식 *</span>
              {REPORT_FORMATS.map((f) => (
                <label key={f} className="inline-flex items-center gap-1.5 cursor-pointer text-ink-secondary">
                  <input type="checkbox" checked={formats.includes(f)} onChange={() => toggleFormat(f)} className="accent-emerald-600" />
                  {f.toUpperCase()}
                </label>
              ))}
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-ink-secondary ml-auto">
                <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="accent-emerald-600" />
                투명 배경 필수
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-bold text-ink-primary">공식 가이드 주소 *</span>
              <input
                type="url"
                value={guideUrl}
                onChange={(e) => setGuideUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              {platformId && (
                <span className={`block text-[11px] ${urlTyped && !urlOfficial ? 'text-status-fail' : 'text-ink-muted'}`}>
                  {urlTyped && !urlOfficial ? '공식 주소가 아닙니다. ' : ''}
                  {platformName(platformId)} 공식 주소: {officialHosts(platformId).join(', ')}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">문서 날짜</span>
                <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className={inputCls} />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-ink-primary">메모</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="선택" className={inputCls} />
              </label>
            </div>

            {/* Honeypot: off-screen, skipped by keyboard and screen readers */}
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              name="website"
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />

            <p className="text-[11px] text-ink-muted leading-relaxed">
              제보 내용은 GitHub에 공개 게시됩니다. 매체 담당자에게 받은 비공개 사양서, 집행 전 소재 이름은 적지 마세요.
              목록에 없는 주소의 가이드는{' '}
              <a href={githubFallbackUrl} target="_blank" rel="noreferrer" className="underline">
                GitHub 이슈
              </a>
              로 직접 제보해 주세요.
            </p>

            {status.kind === 'error' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-status-fail/10 border border-status-fail/30 text-status-fail">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{status.message}</p>
                  {status.fallback && (
                    <a href={githubFallbackUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline">
                      GitHub에서 직접 제보하기 <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-bold border border-line text-ink-secondary hover:text-ink-primary cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={status.kind === 'sending'}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-extrabold bg-[#A8FF1A] text-black disabled:opacity-60 cursor-pointer"
              >
                {status.kind === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                제보 보내기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
