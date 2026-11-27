/**
 * Spec reports: a visitor tells ACV about an official placement size it does not know.
 * Shared by the report form (browser) and /api/spec-report (Vercel function), so both
 * apply the same rules. scripts/check_spec_report.py re-checks everything on GitHub.
 */
import officialSources from '../data/officialSources.json' with { type: 'json' };

type SourceRule = { host: string; pathPrefix?: string };
const PLATFORMS = (officialSources as { platforms: Record<string, { name: string; sources: SourceRule[] }> }).platforms;

export const REPORT_FORMATS = ['jpg', 'png', 'gif', 'webp'] as const;

/** Guide file attached to a report: kept in a private Blob store, deleted after ATTACHMENT_TTL_DAYS. */
export const ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
export const ATTACHMENT_TTL_DAYS = 90;
export const ATTACHMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

/**
 * What a report keeps about its file. The file name is deliberately absent: names of confidential
 * documents ("ClientX_Audit_Report.pdf") give away who and what, and reports are public issues.
 */
export interface ReportAttachment {
  size: number;
  contentType: AttachmentType;
  /** Private Blob URL: opens only with the store's token */
  url: string;
  pathname: string;
}

/** Real file type from the first bytes (the extension and the browser's type can lie). */
export function sniffAttachmentType(head: Uint8Array): AttachmentType | null {
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return 'application/pdf'; // %PDF
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  return null;
}

export function attachmentKind(type: AttachmentType): string {
  return type === 'application/pdf' ? 'PDF' : type === 'image/png' ? 'PNG' : 'JPG';
}

export function formatBytes(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`;
}
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
  /** Official guide page or PDF; may be empty when a guide file is attached */
  guideUrl: string;
  /** Date printed on the guide, YYYY-MM-DD, if known */
  docDate?: string;
  note?: string;
  attachment?: ReportAttachment;
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
export function validateSpecReport(input: Record<string, unknown>, opts: { hasAttachment?: boolean } = {}): ValidationResult {
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
  if (!guideUrl && !opts.hasAttachment) {
    return { ok: false, error: '공식 가이드 주소를 적거나 가이드 파일을 첨부해 주세요.' };
  }
  if (guideUrl && !isOfficialUrl(platformId, guideUrl)) {
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
    `| 공식 가이드 | ${r.guideUrl || '(주소 없음, 첨부 파일로 제보)'} |`,
    ...(r.attachment
      ? [`| 첨부 | ${attachmentKind(r.attachment.contentType)} 1개 (${formatBytes(r.attachment.size)}) · 비공개 보관, 운영자만 열람 · ${ATTACHMENT_TTL_DAYS}일 뒤 자동 삭제 |`]
      : []),
    `| 문서 날짜 | ${r.docDate || '(미기재)'} |`,
  ];
  if (r.note) lines.push('', '**메모**', '', r.note);
  lines.push('', `<!-- ${REPORT_MARKER}`, JSON.stringify(r), '-->');
  return lines.join('\n');
}
