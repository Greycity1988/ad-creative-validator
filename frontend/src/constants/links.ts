// Sister-service address. Local dev points at local ports; builds point at deployed pages.
export const ACV_URL: string =
  import.meta.env.VITE_ACV_URL ??
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://ad-creative-validator.vercel.app');

export const CAL_URL: string =
  import.meta.env.VITE_CAL_URL ??
  (import.meta.env.DEV ? 'http://localhost:5175' : 'https://greycity1988.github.io/competitive-ad-lens/');

export const OTT_URL: string =
  import.meta.env.VITE_OTT_URL ??
  (import.meta.env.DEV ? 'http://localhost:5174' : 'https://omni-trend-tracker.vercel.app');

export const BEP_URL: string =
  import.meta.env.VITE_BEP_URL ??
  (import.meta.env.DEV ? 'http://localhost:5176' : 'https://bep-master.vercel.app');

export const CFR_URL: string =
  import.meta.env.VITE_CFR_URL ??
  (import.meta.env.DEV ? 'http://localhost:5177' : ''); // not deployed yet: shown as in development

export const KO_FI_URL: string = 'https://ko-fi.com/greycity1988';
export const SHOW_OTT_LINK: boolean = import.meta.env.DEV || import.meta.env.VITE_SHOW_OTT === 'true';

export const GITHUB_NEW_ISSUE_URL = 'https://github.com/Greycity1988/ad-creative-validator/issues/new';

/**
 * Prefilled GitHub issue for a size ACV does not know. Only the size and platforms go in:
 * the file name can be confidential (unreleased campaigns), so it is left out.
 */
export function specReportUrl(opts: { platforms: string[]; width: number; height: number; format: string }): string {
  const { platforms, width, height, format } = opts;
  const title = `[규격 제보] ${platforms.join(', ') || '매체'} ${width}×${height}`;
  const body = [
    '### 매체',
    platforms.join(', ') || '(매체 이름)',
    '',
    '### 규격',
    `${width}×${height}px, ${format}`,
    '',
    '### 공식 가이드 주소 (필수)',
    '매체가 직접 올린 가이드 페이지나 PDF 주소를 붙여 주세요. 확인되면 ACV에 반영합니다.',
    '',
    '### 메모',
    '',
    '---',
    '이 게시판은 누구나 볼 수 있습니다. 매체 담당자에게 받은 비공개 사양서나 집행 전 소재 이름은 올리지 마세요.',
  ].join('\n');
  return `${GITHUB_NEW_ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
