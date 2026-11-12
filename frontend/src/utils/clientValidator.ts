import { ValidationResponse, ValidationItem, PlatformResult, PlacementResult, CheckItem, ImageInfo } from '../types';
import specsData from '../data/specsData.json';

export interface SpecPlacement {
  name: string;
  dimension_str: string;
  aspect_ratio_str: string;
  allowed_formats: string[];
  exact_width?: number | null;
  exact_height?: number | null;
  min_width?: number | null;
  min_height?: number | null;
  max_width?: number | null;
  max_height?: number | null;
  max_file_size_kb?: number | null;
  max_file_size_mb?: number | null;
  aspect_ratio?: [number, number] | null;
  aspect_ratio_tolerance?: number;
  require_transparency?: boolean;
  text_ratio_limit?: number | null;
  text_ratio_level?: string;
  description?: string;
  notes?: string[];
}

export interface SpecPlatform {
  id: string;
  name: string;
  description?: string;
  official_update_date?: string;
  official_source_name?: string;
  official_source_url?: string;
  revision_summary?: string;
  last_verified_date?: string;
  placements_count: number;
  placements: string[];
  placements_detail: SpecPlacement[];
}

const typedSpecs = specsData as unknown as SpecPlatform[];

/**
 * Detect actual image format from binary magic bytes rather than just file extension.
 */
export async function detectActualImageFormat(file: File): Promise<string> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return 'PNG';
    }
    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return 'JPG';
    }
    // GIF: 47 49 46 38 ('GIF8')
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return 'GIF';
    }
    // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return 'WEBP';
    }
  } catch {
    // fallback
  }

  // Fallback to extension if magic bytes unreadable
  const ext = file.name.split('.').pop()?.toUpperCase() || (file.type.split('/')[1] || 'JPG').toUpperCase();
  return ext === 'JPEG' ? 'JPG' : ext;
}

/**
 * Detect transparent pixels using Canvas API.
 */
export async function checkImageHasTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Sample down to max 100x100 for fast non-blocking evaluation
        canvas.width = Math.min(img.naturalWidth || img.width, 100);
        canvas.height = Math.min(img.naturalHeight || img.height, 100);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        // Check alpha channel (every 4th byte)
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 250) {
            URL.revokeObjectURL(url);
            resolve(true);
            return;
          }
        }
      } catch {
        // ignore canvas security/CORS
      }
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Parse dimensions safely from filename without falsely matching dates like 2026_1112.
 */
export function parseDimensionsFromFilename(filename: string): [number, number] | null {
  // 1. Strict delimiter: 'x', 'X', '×', '*'
  const pattern = /(\d{2,4})\s*[xX×*]\s*(\d{2,4})/;
  const match = filename.match(pattern);
  if (match) {
    const w = parseInt(match[1], 10);
    const h = parseInt(match[2], 10);
    // Ignore unreasonable dimensions or full year numbers (e.g. 2026x1112)
    if (w >= 50 && w <= 4000 && h >= 50 && h <= 4000 && !(w >= 2020 && w <= 2035 && h >= 1000)) {
      return [w, h];
    }
  }

  // 2. Underscore delimiter e.g. banner_1200_628.png or 960_300.png.
  // Date-like tokens (2026, 1112 right after a year, 0115) are skipped so dates are not read as sizes.
  const underscoreRuns = filename.match(/(?<!\d)\d{3,4}(?:_\d{3,4})+(?!\d)/g) || [];
  for (const run of underscoreRuns) {
    const tokens = run.split('_');
    for (let i = 0; i < tokens.length - 1; i++) {
      if (isDateLikeToken(tokens, i) || isDateLikeToken(tokens, i + 1)) continue;
      const w = parseInt(tokens[i], 10);
      const h = parseInt(tokens[i + 1], 10);
      if (w >= 50 && w <= 4000 && h >= 50 && h <= 4000) {
        return [w, h];
      }
    }
  }

  return null;
}

function isYearToken(token: string): boolean {
  const n = parseInt(token, 10);
  return token.length === 4 && n >= 2020 && n <= 2035;
}

function isDateLikeToken(tokens: string[], index: number): boolean {
  const token = tokens[index];
  if (token.startsWith('0') || isYearToken(token)) return true;
  // MMDD right after a year, e.g. 2026_1112
  if (index > 0 && isYearToken(tokens[index - 1]) && token.length === 4) {
    const month = parseInt(token.slice(0, 2), 10);
    const day = parseInt(token.slice(2), 10);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }
  return false;
}

export function isPlacementMatchedByFilename(placement: SpecPlacement, filename: string): boolean {
  const fnameLower = filename.toLowerCase();
  const pnameLower = placement.name.toLowerCase();

  const dims = parseDimensionsFromFilename(filename);
  if (dims) {
    const [fw, fh] = dims;
    if (placement.exact_width === fw && placement.exact_height === fh) return true;
    if (placement.min_width === fw && placement.min_height === fh) return true;
    if (placement.aspect_ratio && placement.aspect_ratio.length === 2) {
      const targetRatio = placement.aspect_ratio[0] / placement.aspect_ratio[1];
      const fileRatio = fw / fh;
      if (Math.abs(fileRatio - targetRatio) / targetRatio <= 0.03) {
        return true;
      }
    }
    return false;
  }

  // Keywords
  if (fnameLower.includes('비즈보드') || fnameLower.includes('bizboard')) return pnameLower.includes('비즈보드');
  if (fnameLower.includes('스마트채널') || fnameLower.includes('smartchannel')) return pnameLower.includes('스마트채널');
  if (fnameLower.includes('포커스보드') || fnameLower.includes('focusboard')) return pnameLower.includes('포커스보드');
  if (fnameLower.includes('타임보드') || fnameLower.includes('timeboard')) return pnameLower.includes('타임보드');
  if (fnameLower.includes('스페셜da') || fnameLower.includes('specialda')) return pnameLower.includes('스페셜 da');
  if (fnameLower.includes('롤링보드') || fnameLower.includes('rolling')) return pnameLower.includes('롤링보드');
  if (fnameLower.includes('브랜드검색') || fnameLower.includes('브검')) return pnameLower.includes('브랜드');
  if (fnameLower.includes('밴드') || fnameLower.includes('band')) return pnameLower.includes('밴드');
  if (fnameLower.includes('쿠팡') || fnameLower.includes('coupang')) return pnameLower.includes('쿠팡');
  if (fnameLower.includes('토스') || fnameLower.includes('toss')) return pnameLower.includes('토스');
  if (fnameLower.includes('당근') || fnameLower.includes('daangn')) return pnameLower.includes('당근');
  if (fnameLower.includes('버즈빌') || fnameLower.includes('buzzvil')) return pnameLower.includes('버즈빌');
  if (fnameLower.includes('피드') || fnameLower.includes('feed')) return pnameLower.includes('피드') || pnameLower.includes('feed');
  if (fnameLower.includes('스토리') || fnameLower.includes('story') || fnameLower.includes('릴스') || fnameLower.includes('reels')) {
    return pnameLower.includes('stories') || pnameLower.includes('reels') || pnameLower.includes('9:16');
  }

  return false;
}

export function isPlacementMatchedByDimension(
  placement: SpecPlacement,
  width: number,
  height: number,
  aspectRatioValue: number
): boolean {
  if (placement.exact_width === width && placement.exact_height === height) {
    return true;
  }

  if (placement.aspect_ratio && placement.aspect_ratio.length === 2) {
    const targetRatio = placement.aspect_ratio[0] / placement.aspect_ratio[1];
    const tol = placement.aspect_ratio_tolerance || 0.05;
    if (Math.abs(aspectRatioValue - targetRatio) / targetRatio <= tol) {
      if (placement.min_width && placement.min_height) {
        if (width >= placement.min_width * 0.9 && height >= placement.min_height * 0.9) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  return false;
}

export function evaluatePlacement(
  placement: SpecPlacement,
  imageInfo: ImageInfo,
  filename: string
): PlacementResult {
  const checks: CheckItem[] = [];

  // 1. Format check (Evaluated using actual binary format detected)
  const allowed = (placement.allowed_formats || ['jpg', 'jpeg', 'png']).map((f) => f.toLowerCase());
  if (allowed.includes('jpeg') && !allowed.includes('jpg')) allowed.push('jpg');
  if (allowed.includes('jpg') && !allowed.includes('jpeg')) allowed.push('jpeg');

  const actualFmt = imageInfo.format.toLowerCase();
  if (allowed.includes(actualFmt)) {
    checks.push({
      name: 'format',
      status: 'pass',
      message: `${imageInfo.format.toUpperCase()} 바이너리 포맷 규격 일치`,
      expected: allowed.map((f) => f.toUpperCase()).join(', '),
      actual: imageInfo.format.toUpperCase(),
    });
  } else {
    checks.push({
      name: 'format',
      status: 'fail',
      message: `지원하지 않는 포맷: ${imageInfo.format.toUpperCase()} (공식 허용: ${allowed.map((f) => f.toUpperCase()).join(', ')})`,
      expected: allowed.map((f) => f.toUpperCase()).join(', '),
      actual: imageInfo.format.toUpperCase(),
    });
  }

  // 2. Transparency Check (if required by placement, e.g. Kakao Bizboard, Naver Smart Channel)
  if (placement.require_transparency) {
    if (imageInfo.format.toUpperCase() !== 'PNG') {
      checks.push({
        name: 'transparency',
        status: 'fail',
        message: '배경 투명화(누끼) 필수 규격 미달: PNG 파일만 투명 배경을 지원합니다.',
        expected: '투명 배경 PNG',
        actual: `${imageInfo.format.toUpperCase()} (투명 불가)`,
      });
    } else if (imageInfo.has_alpha) {
      checks.push({
        name: 'transparency',
        status: 'pass',
        message: '배경 투명화(누끼) 확인 완료 (알파 채널 감지)',
        expected: '투명 배경 필수',
        actual: '투명 배경 확인됨',
      });
    } else {
      checks.push({
        name: 'transparency',
        status: 'fail',
        message: '배경 투명화(누끼) 필수 규격 미달: 불투명 배경이 감지되었습니다. 배경을 투명하게 처리한 PNG 파일로 제작해주세요.',
        expected: '투명 배경 (Alpha)',
        actual: '불투명 배경 (Opaque)',
      });
    }
  }

  // 3. Dimensions check
  const { exact_width: ew, exact_height: eh, min_width: mw, min_height: mh, max_width: xw, max_height: xh } = placement;
  const w = imageInfo.width;
  const h = imageInfo.height;

  if (ew != null && eh != null) {
    if (w === ew && h === eh) {
      checks.push({
        name: 'dimensions',
        status: 'pass',
        message: `해상도 일치: ${w}×${h}px`,
        expected: `${ew}×${eh}px`,
        actual: `${w}×${h}px`,
      });
    } else {
      checks.push({
        name: 'dimensions',
        status: 'fail',
        message: `해상도 불일치: ${w}×${h}px (요구 규격: ${ew}×${eh}px)`,
        expected: `${ew}×${eh}px`,
        actual: `${w}×${h}px`,
      });
    }
  } else if (mw != null && mh != null) {
    if (w >= mw && h >= mh) {
      let msg = `${w}×${h}px ≥ 최소 ${mw}×${mh}px`;
      if (xw != null && xh != null && (w > xw || h > xh)) {
        checks.push({
          name: 'dimensions',
          status: 'fail',
          message: `최대 해상도 초과: ${w}×${h}px (최대: ${xw}×${xh}px)`,
          expected: `최대 ${xw}×${xh}px`,
          actual: `${w}×${h}px`,
        });
      } else {
        checks.push({
          name: 'dimensions',
          status: 'pass',
          message: msg,
          expected: `최소 ${mw}×${mh}px`,
          actual: `${w}×${h}px`,
        });
      }
    } else {
      checks.push({
        name: 'dimensions',
        status: 'fail',
        message: `최소 해상도 미달: ${w}×${h}px (최소 요구: ${mw}×${mh}px)`,
        expected: `최소 ${mw}×${mh}px`,
        actual: `${w}×${h}px`,
      });
    }
  } else {
    checks.push({
      name: 'dimensions',
      status: 'pass',
      message: `해상도 확인: ${w}×${h}px`,
      expected: '자유',
      actual: `${w}×${h}px`,
    });
  }

  // 4. File size check
  let maxKb = placement.max_file_size_kb;
  if (placement.max_file_size_mb) {
    maxKb = placement.max_file_size_mb * 1024;
  }
  if (maxKb != null) {
    if (imageInfo.file_size_kb <= maxKb) {
      checks.push({
        name: 'file_size',
        status: 'pass',
        message: `용량 적합: ${imageInfo.file_size_kb.toFixed(1)} KB (최대 허용: ${maxKb} KB)`,
        expected: `≤ ${maxKb} KB`,
        actual: `${imageInfo.file_size_kb.toFixed(1)} KB`,
      });
    } else {
      checks.push({
        name: 'file_size',
        status: 'fail',
        message: `용량 초과: ${imageInfo.file_size_kb.toFixed(1)} KB (최대 허용: ${maxKb} KB)`,
        expected: `≤ ${maxKb} KB`,
        actual: `${imageInfo.file_size_kb.toFixed(1)} KB`,
      });
    }
  }

  // 5. Aspect ratio check
  if (placement.aspect_ratio && placement.aspect_ratio.length === 2) {
    const [rw, rh] = placement.aspect_ratio;
    const targetRatio = rw / rh;
    const tol = placement.aspect_ratio_tolerance || 0.05;
    const actualRatio = imageInfo.aspect_ratio_value || w / h;
    const diff = Math.abs(actualRatio - targetRatio) / targetRatio;

    if (diff <= tol) {
      checks.push({
        name: 'aspect_ratio',
        status: 'pass',
        message: `비율 일치: ${rw}:${rh} (오차 ${(diff * 100).toFixed(1)}%)`,
        expected: `${rw}:${rh}`,
        actual: `${(w / h).toFixed(2)}:1`,
      });
    } else {
      checks.push({
        name: 'aspect_ratio',
        status: 'fail',
        message: `비율 불일치: 요구 ${rw}:${rh} (실제 ${(w / h).toFixed(2)}:1)`,
        expected: `${rw}:${rh}`,
        actual: `${(w / h).toFixed(2)}:1`,
      });
    }
  }

  // 6. Text ratio: the browser engine has no OCR, so the limit is shown as a manual check.
  // 'manual' is informational and does not change the placement's overall status.
  if (placement.text_ratio_limit != null) {
    const limitPct = Math.round(placement.text_ratio_limit * 100);
    checks.push({
      name: 'text_ratio',
      status: 'manual',
      message: `자동 측정 미지원: 이 지면은 텍스트 비율 ${limitPct}% 이하 기준이 있습니다. 직접 확인해주세요.`,
      expected: `≤ ${limitPct}%`,
      actual: '미측정',
    });
  }

  // Calculate overall status
  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warning');
  const overall = hasFail ? 'fail' : hasWarning ? 'warning' : 'pass';

  let isMatched = false;
  if (filename) {
    isMatched = isPlacementMatchedByFilename(placement, filename);
  }
  if (!isMatched) {
    isMatched = isPlacementMatchedByDimension(placement, w, h, imageInfo.aspect_ratio_value || w / h);
  }

  return {
    name: placement.name,
    overall,
    checks,
    is_matched_target: isMatched,
  };
}

export async function validateImagesLocally(
  files: File[],
  platformIds: string[],
  selectedPlacementsMap: Record<string, string[]>,
  autoMatch: boolean = true
): Promise<ValidationResponse> {
  const results: ValidationItem[] = [];

  for (const file of files) {
    // 1. Detect actual image format from binary magic bytes
    const detectedFormat = await detectActualImageFormat(file);

    // 2. Load image dimensions and safely detect decoding errors
    let width = 0;
    let height = 0;
    let loadFailed = false;

    await new Promise<void>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        width = img.naturalWidth || img.width;
        height = img.naturalHeight || img.height;
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        loadFailed = true;
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });

    const fileSizeKb = file.size / 1024;

    // Handle corrupted or unreadable images directly without false 1000x1000 fallback
    if (loadFailed || width <= 0 || height <= 0) {
      results.push({
        filename: file.name,
        image_info: {
          width: 0,
          height: 0,
          format: detectedFormat,
          file_size_kb: fileSizeKb,
          has_alpha: false,
          aspect_ratio: '0:0',
          aspect_ratio_value: 0,
        },
        text_ratio: null,
        platform_results: [
          {
            platform: '파일 판독 실패',
            platform_id: 'unknown',
            overall: 'fail',
            placements: [
              {
                name: '이미지 디코딩 불가',
                overall: 'fail',
                checks: [
                  {
                    name: 'load',
                    status: 'fail',
                    message: '손상되었거나 브라우저에서 읽을 수 없는 이미지 파일입니다. 파일 손상 여부를 확인해주세요.',
                  },
                ],
                is_matched_target: false,
              },
            ],
          },
        ],
      });
      continue;
    }

    // 3. Detect alpha transparency if format is PNG
    let hasAlpha = false;
    if (detectedFormat === 'PNG') {
      hasAlpha = await checkImageHasTransparency(file);
    }

    const ratioVal = width / height;
    const divisor = gcd(width, height) || 1;
    const ratioStr = `${(width / divisor).toFixed(0)}:${(height / divisor).toFixed(0)}`;

    const imageInfo: ImageInfo = {
      width,
      height,
      format: detectedFormat,
      file_size_kb: fileSizeKb,
      has_alpha: hasAlpha,
      aspect_ratio: ratioStr,
      aspect_ratio_value: ratioVal,
    };

    const platformResults: PlatformResult[] = [];

    for (const pid of platformIds) {
      const spec = typedSpecs.find((s) => s.id === pid);
      if (!spec) continue;

      let targetPlacements = spec.placements_detail;

      // Filter if user selected specific placements
      const userSelected = selectedPlacementsMap[pid];
      if (userSelected && userSelected.length > 0) {
        const set = new Set(userSelected.map((s) => s.trim().toLowerCase()));
        const filtered = targetPlacements.filter((p) => set.has(p.name.trim().toLowerCase()));
        if (filtered.length > 0) {
          targetPlacements = filtered;
        }
      } else if (autoMatch) {
        // Smart matching
        const matched = targetPlacements.filter(
          (p) =>
            isPlacementMatchedByFilename(p, file.name) ||
            isPlacementMatchedByDimension(p, width, height, ratioVal)
        );

        if (matched.length > 0) {
          const exactMatches = matched.filter((p) => p.exact_width === width && p.exact_height === height);
          targetPlacements = exactMatches.length > 0 ? exactMatches : matched;
        } else {
          // No placement matched
          platformResults.push({
            platform: spec.name,
            platform_id: spec.id,
            overall: 'na',
            placements: [
              {
                name: '해당 매체 일치 규격 없음',
                overall: 'fail',
                checks: [
                  {
                    name: 'match',
                    status: 'warning',
                    message: `업로드된 규격(${width}×${height}px)과 일치하거나 호환되는 ${spec.name} 공식 지면이 없습니다.`,
                  },
                ],
                is_matched_target: false,
              },
            ],
          });
          continue;
        }
      }

      const evalPlacements = targetPlacements.map((p) =>
        evaluatePlacement(p, imageInfo, file.name)
      );

      const hasFail = evalPlacements.some((p) => p.overall === 'fail');
      const hasPass = evalPlacements.some((p) => p.overall === 'pass');
      let platOverall = 'pass';
      if (hasFail && !hasPass) platOverall = 'fail';
      else if (hasFail && hasPass) platOverall = 'partial';

      platformResults.push({
        platform: spec.name,
        platform_id: spec.id,
        overall: platOverall,
        placements: evalPlacements,
      });
    }

    results.push({
      filename: file.name,
      image_info: imageInfo,
      text_ratio: null,
      platform_results: platformResults,
    });
  }

  return { results };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
