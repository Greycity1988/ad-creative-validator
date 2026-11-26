/**
 * Spec reports: a visitor tells ACV about an official placement size it does not know.
 * Shared by the report form (browser) and /api/spec-report (Vercel function), so both
 * apply the same rules. scripts/check_spec_report.py re-checks everything on GitHub.
 */
import officialSources from '../data/officialSources.json';

type SourceRule = { host: string; pathPrefix?: string };
const PLATFORMS = (officialSources as { platforms: Record<string, { name: string; sources: SourceRule[] }> }).platforms;

export const REPORT_FORMATS = ['jpg', 'png', 'gif', 'webp'] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export interface SpecReport {
  platformId: string;
  /** Placement name as the guide calls it, e.g. "스마트채널" */
  placementName: string;
  width: number;
  height: number;
  /** Max file size in KB, if the guide states one */
  maxKb?: number;
  formats: ReportFormat[];
  transparent: boolean;
  /** Official guide page or PDF */
  guideUrl: string;
  /** Date printed on the guide, YYYY-MM-DD, if known */
  docDate?: string;
  note?: string;
}

export const REPORT_MARKER = 'acv-spec-report';

export function platformName(id: string): string | undefined {
  return PLATFORMS[id]?.name;
}

export function reportablePlatforms(): Array<{ id: string; name: string }> {
  return Object.entries(PLATFORMS).map(([id, p]) => ({ id, name: p.name }));
}

/** Official hosts (and path prefixes) for a platform, for showing in the form. */
export function officialHosts(platformId: string): string[] {
  return (PLATFORMS[platformId]?.sources || []).map((s) => s.host + (s.pathPrefix || ''));
}

/** True when the URL is https and on one of the platform's official guide hosts. */
export function isOfficialUrl(platformId: string, url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return false;
  const host = u.hostname.toLowerCase();
  return (PLATFORMS[platformId]?.sources || []).some(
    (s) => s.host === host && (!s.pathPrefix || u.pathname.startsWith(s.pathPrefix))
  );
}

const clean = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const int = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN);

export type ValidationResult = { ok: true; value: SpecReport } | { ok: false; error: string };

/** Check and normalise a report. Error messages are shown to the visitor. */
export function validateSpecReport(input: Record<string, unknown>): ValidationResult {
  const platformId = clean(input.platformId, 40);
  if (!PLATFORMS[platformId]) return { ok: false, error: '매체를 선택해 주세요.' };

  const width = int(input.width);
  const height = int(input.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 10 || height < 10 || width > 8000 || height > 8000) {
    return { ok: false, error: '가로·세로는 10~8000 사이의 정수(px)로 입력해 주세요.' };
  }

  let maxKb: number | undefined;
  if (input.maxKb !== undefined && input.maxKb !== null && input.maxKb !== '') {
    maxKb = int(input.maxKb);
    if (!Number.isInteger(maxKb) || maxKb < 1 || maxKb > 512000) {
      return { ok: false, error: '최대 용량은 1~512000 사이의 KB 정수로 입력해 주세요.' };
    }
  }

  const formats = Array.isArray(input.formats)
    ? (input.formats.filter((f) => (REPORT_FORMATS as readonly unknown[]).includes(f)) as ReportFormat[])
    : [];
  if (formats.length === 0) return { ok: false, error: '허용 파일 형식을 하나 이상 골라 주세요.' };

  const guideUrl = clean(input.guideUrl, 500);
  if (!isOfficialUrl(platformId, guideUrl)) {
    return {
      ok: false,
      error: `${PLATFORMS[platformId].name} 공식 가이드 주소가 아닙니다. 허용 주소: ${officialHosts(platformId).join(', ')}`,
    };
  }

  const docDate = clean(input.docDate, 10);
  if (docDate && !/^\d{4}-\d{2}-\d{2}$/.test(docDate)) {
    return { ok: false, error: '문서 날짜는 YYYY-MM-DD 형식으로 입력해 주세요.' };
  }

  const placementName = clean(input.placementName, 60);
  if (placementName.length < 2) return { ok: false, error: '지면 이름을 입력해 주세요 (예: 스마트채널).' };

  return {
    ok: true,
    value: {
      platformId,
      placementName,
      width,
      height,
      maxKb,
      formats: Array.from(new Set(formats)),
      transparent: input.transparent === true,
      guideUrl,
      docDate: docDate || undefined,
      note: clean(input.note, 500) || undefined,
    },
  };
}

export function issueTitle(r: SpecReport): string {
  return `[규격 제보] ${PLATFORMS[r.platformId].name} ${r.placementName} ${r.width}×${r.height}`;
}

/** Issue body: readable summary plus a machine-readable block for the checker. */
export function issueBody(r: SpecReport): string {
  const lines = [
    '사이트의 규격 제보 양식으로 접수된 제보입니다. 자동 점검 결과가 이 이슈에 댓글로 달립니다.',
    '',
    '| 항목 | 내용 |',
    '|---|---|',
    `| 매체 | ${PLATFORMS[r.platformId].name} |`,
    `| 지면 | ${r.placementName} |`,
    `| 크기 | ${r.width}×${r.height}px |`,
    `| 최대 용량 | ${r.maxKb ? `${r.maxKb}KB` : '(미기재)'} |`,
    `| 형식 | ${r.formats.join(', ').toUpperCase()} |`,
    `| 투명 배경 | ${r.transparent ? '필수' : '아님'} |`,
    `| 공식 가이드 | ${r.guideUrl} |`,
    `| 문서 날짜 | ${r.docDate || '(미기재)'} |`,
  ];
  if (r.note) lines.push('', '**메모**', '', r.note);
  lines.push('', `<!-- ${REPORT_MARKER}`, JSON.stringify(r), '-->');
  return lines.join('\n');
}
