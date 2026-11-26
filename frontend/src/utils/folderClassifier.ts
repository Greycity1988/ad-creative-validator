/**
 * Guess which ad platform a creative belongs to from its folder path and file name.
 *
 * Designers usually sort exports into folders such as `2026_봄캠페인/카카오/비즈보드/a.png`
 * or name files `meta_feed_1080x1350.png`. The deepest path segment that names a platform wins:
 * the file name first, then its folder, then the parent folders.
 */

export type ClassificationSource = 'filename' | 'folder';

export interface Classification {
  platformIds: string[];
  source: ClassificationSource;
  /** The path segment that matched, e.g. "카카오" */
  matched: string;
}

/**
 * Aliases per platform id (ids as in specsData.json).
 * Latin aliases of 3 letters or fewer must be a whole token (so "x" never matches "300x250").
 * Longer latin aliases must start at a word boundary. Korean aliases must start a word, so "토스" does not
 * match "포토스튜디오" but does match "토스_피드" or "토스광고".
 */
export const PLATFORM_ALIASES: Record<string, string[]> = {
  naver: ['naver', '네이버', 'gfa', 'nosp', '스마트채널', 'smartchannel', '타임보드', 'timeboard', '롤링보드', '브랜드검색', '브검', '스페셜da', '밴드', 'band'],
  kakao: ['kakao', '카카오', '카톡', '비즈보드', 'bizboard', '포커스보드', 'focusboard', 'kakaomoment', '카카오모먼트'],
  meta: ['meta', '메타', 'facebook', '페이스북', '페북', 'fb', 'instagram', 'insta', '인스타', '인스타그램', 'ig', 'reels', '릴스'],
  google_ads: ['google', '구글', 'gdn', 'pmax', 'demandgen', 'youtube', '유튜브', 'adwords'],
  tiktok: ['tiktok', '틱톡', 'pangle', '팽글'],
  twitter: ['twitter', '트위터', 'x', '엑스'],
  criteo: ['criteo', '크리테오'],
  moloco: ['moloco', '몰로코'],
  rtb_house: ['rtbhouse', 'rtb', '알티비하우스'],
  appier: ['appier', '애피어'],
  dable: ['dable', '데이블'],
  taboola: ['taboola', '타불라'],
  acetrader: ['acetrader', '에이스트레이더'],
  targetpick: ['targetpick', '타겟픽'],
  realclick: ['realclick', '리얼클릭'],
  coupang: ['coupang', '쿠팡'],
  toss: ['toss', '토스'],
  daangn: ['daangn', 'karrot', '당근'],
  onestore: ['onestore', '원스토어'],
  buzzvil: ['buzzvil', '버즈빌'],
  adison: ['adison', '애디슨'],
  syrup: ['syrup', '시럽', 'okcashbag', '캐쉬백', '오케이캐쉬백', 'planetad', '플래닛애드'],
  tnk: ['tnk', 'tnkfactory', '티엔케이'],
  linkedin: ['linkedin', '링크드인'],
  pinterest: ['pinterest', '핀터레스트'],
  snapchat: ['snapchat', '스냅챗'],
  reddit: ['reddit', '레딧'],
  spotify: ['spotify', '스포티파이'],
  soop: ['soop', 'afreeca', 'afreecatv', '아프리카티비'],
  chzzk: ['chzzk', '치지직'],
  cauly: ['cauly', '카울리'],
  adpopcorn: ['adpopcorn', '애드팝콘', 'igaworks'],
};

/** When both match one segment, the more specific platform wins ("네이버 치지직" is CHZZK, not Naver). */
const MORE_SPECIFIC: Array<[specific: string, general: string]> = [['chzzk', 'naver']];

const HANGUL = /[가-힣]/;

function normalize(segment: string): string {
  return segment
    .normalize('NFC') // macOS gives decomposed Hangul in file paths
    .toLowerCase()
    .replace(/\.[a-z0-9]{2,5}$/, ''); // drop a file extension
}

function aliasMatches(alias: string, segment: string, tokens: string[]): boolean {
  if (HANGUL.test(alias)) return tokens.some((t) => t.startsWith(alias));
  if (alias.length <= 3) return tokens.includes(alias);
  // Latin alias of 4+ letters: must start a word, e.g. "kakaobizboard" or "2026_kakao"
  const idx = segment.indexOf(alias);
  if (idx < 0) return false;
  return idx === 0 || !/[a-z]/.test(segment[idx - 1]);
}

/** Platform ids named in one path segment (a folder name or a file name). */
export function platformsInSegment(rawSegment: string): string[] {
  const segment = normalize(rawSegment);
  // Split on anything that is not a latin letter, digit or Hangul syllable; also split latin from Hangul.
  const tokens = segment
    .replace(/([a-z])([가-힣])|([가-힣])([a-z])/g, '$1$3 $2$4')
    .split(/[^0-9a-z가-힣]+/)
    .filter(Boolean);

  let found = Object.entries(PLATFORM_ALIASES)
    .filter(([, aliases]) => aliases.some((a) => aliasMatches(a, segment, tokens)))
    .map(([id]) => id);

  for (const [specific, general] of MORE_SPECIFIC) {
    if (found.includes(specific)) found = found.filter((id) => id !== general);
  }
  return found;
}

/**
 * Classify a file by its relative path ("folder/sub/file.png") or bare file name.
 * Returns null when no segment names a platform.
 */
export function classifyCreativePath(relativePath: string): Classification | null {
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  if (parts.length === 0) return null;

  for (let i = parts.length - 1; i >= 0; i--) {
    const ids = platformsInSegment(parts[i]);
    if (ids.length > 0) {
      return {
        platformIds: ids,
        source: i === parts.length - 1 ? 'filename' : 'folder',
        matched: parts[i].normalize('NFC'),
      };
    }
  }
  return null;
}

/** Folder part of a relative path ("a/b/c.png" -> "a/b"), or "" for a bare file name. */
export function folderOf(relativePath: string): string {
  const idx = relativePath.lastIndexOf('/');
  return idx < 0 ? '' : relativePath.slice(0, idx).normalize('NFC');
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const SKIPPED_NAME = /^(\.|__macosx$|thumbs\.db$|desktop\.ini$)/i;

/** True for files ACV can check: image type or image extension, and not an OS junk file. */
export function isCheckableImage(file: File, relativePath = file.name): boolean {
  const parts = relativePath.split('/');
  if (parts.some((p) => SKIPPED_NAME.test(p))) return false;
  return file.type.startsWith('image/') || IMAGE_EXT.test(file.name);
}

/** Short display names for classification chips. */
export const PLATFORM_LABELS: Record<string, string> = {
  naver: '네이버', kakao: '카카오', meta: 'META', google_ads: '구글', tiktok: '틱톡', twitter: '엑스(X)',
  criteo: '크리테오', moloco: '몰로코', rtb_house: 'RTB House', appier: '애피어', dable: '데이블',
  taboola: '타불라', acetrader: '에이스트레이더', targetpick: '타겟픽', realclick: '리얼클릭',
  coupang: '쿠팡', toss: '토스', daangn: '당근', onestore: '원스토어', buzzvil: '버즈빌',
  adison: '애디슨', syrup: '시럽/OK캐쉬백', tnk: 'TNK팩토리', linkedin: '링크드인',
  pinterest: '핀터레스트', snapchat: '스냅챗', reddit: '레딧', spotify: '스포티파이', soop: 'SOOP',
  chzzk: '치지직', cauly: '카울리', adpopcorn: '애드팝콘',
};

export interface UploadEntry {
  file: File;
  /** Path inside the dropped or picked folder; the file name for loose files. */
  relativePath: string;
}

type FsEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file?: (ok: (f: File) => void, fail: (e: unknown) => void) => void;
  createReader?: () => { readEntries: (ok: (e: FsEntry[]) => void, fail: (e: unknown) => void) => void };
};

/**
 * Collect files from a drop. Folders are walked recursively.
 * Call synchronously inside the drop handler: the browser empties `dataTransfer` once the event returns.
 */
export function collectDroppedFiles(dt: DataTransfer): Promise<UploadEntry[]> {
  const entries: FsEntry[] = [];
  const loose: File[] = [];
  for (const item of Array.from(dt.items || [])) {
    if (item.kind !== 'file') continue;
    const entry = (item as DataTransferItem & { webkitGetAsEntry?: () => FsEntry | null }).webkitGetAsEntry?.();
    if (entry) entries.push(entry);
    else {
      const f = item.getAsFile();
      if (f) loose.push(f);
    }
  }
  if (entries.length === 0 && loose.length === 0) {
    loose.push(...Array.from(dt.files || []));
  }
  return (async () => {
    const out: UploadEntry[] = loose.map((f) => ({ file: f, relativePath: f.name }));
    for (const e of entries) await walkEntry(e, out);
    return out;
  })();
}

async function walkEntry(entry: FsEntry, out: UploadEntry[]): Promise<void> {
  if (entry.isFile && entry.file) {
    const file = await new Promise<File | null>((ok) => entry.file!(ok, () => ok(null)));
    if (file) out.push({ file, relativePath: entry.fullPath.replace(/^\/+/, '') || file.name });
    return;
  }
  if (entry.isDirectory && entry.createReader) {
    if (SKIPPED_NAME.test(entry.name)) return;
    const reader = entry.createReader();
    // readEntries returns at most ~100 entries per call; keep reading until it returns none.
    for (;;) {
      const batch = await new Promise<FsEntry[]>((ok) => reader.readEntries(ok, () => ok([])));
      if (batch.length === 0) break;
      for (const child of batch) await walkEntry(child, out);
    }
  }
}

/** Files picked with the folder picker carry `webkitRelativePath`. */
export function entriesFromInput(files: FileList | null): UploadEntry[] {
  return Array.from(files || []).map((f) => ({
    file: f,
    relativePath: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
  }));
}
