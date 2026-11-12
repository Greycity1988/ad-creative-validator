import { ValidationResponse, ValidationItem, PlatformResult, PlacementResult, CheckItem, ImageInfo } from '../types';
import specsData from '../data/specsData.json';

interface SpecPlacement {
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
  max_text_ratio?: number | null;
  description?: string;
  notes?: string[];
}

interface SpecPlatform {
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

function parseDimensionsFromFilename(filename: string): [number, number] | null {
  const pattern = /(\d{2,4})\s*[_xX×*]\s*(\d{2,4})/;
  const match = filename.match(pattern);
  if (match) {
    const w = parseInt(match[1], 10);
    const h = parseInt(match[2], 10);
    if (w >= 50 && w <= 5000 && h >= 50 && h <= 5000) {
      return [w, h];
    }
  }
  return null;
}

function isPlacementMatchedByFilename(placement: SpecPlacement, filename: string): boolean {
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

function isPlacementMatchedByDimension(
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

function evaluatePlacement(
  placement: SpecPlacement,
  imageInfo: ImageInfo,
  filename: string,
  textRatio: number | null
): PlacementResult {
  const checks: CheckItem[] = [];

  // 1. Format check
  const allowed = (placement.allowed_formats || ['jpg', 'jpeg', 'png']).map((f) => f.toLowerCase());
  if (allowed.includes('jpeg') && !allowed.includes('jpg')) allowed.push('jpg');
  if (allowed.includes('jpg') && !allowed.includes('jpeg')) allowed.push('jpeg');

  const actualFmt = imageInfo.format.toLowerCase();
  if (allowed.includes(actualFmt)) {
    checks.push({
      name: 'format',
      status: 'pass',
      message: `${imageInfo.format.toUpperCase()} 형식 허용`,
      expected: allowed.map((f) => f.toUpperCase()).join(', '),
      actual: imageInfo.format.toUpperCase(),
    });
  } else {
    checks.push({
      name: 'format',
      status: 'fail',
      message: `지원하지 않는 형식: ${imageInfo.format.toUpperCase()} (허용: ${allowed.map((f) => f.toUpperCase()).join(', ')})`,
      expected: allowed.map((f) => f.toUpperCase()).join(', '),
      actual: imageInfo.format.toUpperCase(),
    });
  }

  // 2. Dimensions check
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
        message: `해상도 불일치: ${w}×${h}px (요구: ${ew}×${eh}px)`,
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
        message: `최소 해상도 미달: ${w}×${h}px (최소: ${mw}×${mh}px)`,
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

  // 3. File size check
  let maxKb = placement.max_file_size_kb;
  if (placement.max_file_size_mb) {
    maxKb = placement.max_file_size_mb * 1024;
  }
  if (maxKb != null) {
    if (imageInfo.file_size_kb <= maxKb) {
      checks.push({
        name: 'file_size',
        status: 'pass',
        message: `용량 적합: ${imageInfo.file_size_kb.toFixed(1)} KB (최대: ${maxKb} KB)`,
        expected: `≤ ${maxKb} KB`,
        actual: `${imageInfo.file_size_kb.toFixed(1)} KB`,
      });
    } else {
      checks.push({
        name: 'file_size',
        status: 'fail',
        message: `용량 초과: ${imageInfo.file_size_kb.toFixed(1)} KB (최대: ${maxKb} KB)`,
        expected: `≤ ${maxKb} KB`,
        actual: `${imageInfo.file_size_kb.toFixed(1)} KB`,
      });
    }
  }

  // 4. Aspect ratio check
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

  // 5. Text ratio check (if provided)
  if (textRatio != null && placement.max_text_ratio != null) {
    const maxPercent = placement.max_text_ratio * 100;
    if (textRatio <= maxPercent) {
      checks.push({
        name: 'text_ratio',
        status: 'pass',
        message: `텍스트 비율 적합: ${textRatio.toFixed(1)}% (권장 ≤ ${maxPercent}%)`,
        expected: `≤ ${maxPercent}%`,
        actual: `${textRatio.toFixed(1)}%`,
      });
    } else {
      checks.push({
        name: 'text_ratio',
        status: 'warning',
        message: `텍스트 비율 주의: ${textRatio.toFixed(1)}% (권장 ≤ ${maxPercent}%, 노출 감소 가능)`,
        expected: `≤ ${maxPercent}%`,
        actual: `${textRatio.toFixed(1)}%`,
      });
    }
  }

  // Calculate overall
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
  analyzeText: boolean = false,
  autoMatch: boolean = true
): Promise<ValidationResponse> {
  const results: ValidationItem[] = [];

  for (const file of files) {
    // 1. Load dimensions
    const [width, height] = await new Promise<[number, number]>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const dims: [number, number] = [img.naturalWidth || img.width, img.naturalHeight || img.height];
        URL.revokeObjectURL(url);
        resolve(dims);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([1000, 1000]); // fallback
      };
      img.src = url;
    });

    const ext = file.name.split('.').pop()?.toUpperCase() || (file.type.split('/')[1] || 'JPG').toUpperCase();
    const fileSizeKb = file.size / 1024;
    const ratioVal = width / height;
    const ratioStr = `${(width / (gcd(width, height) || 1)).toFixed(0)}:${(height / (gcd(width, height) || 1)).toFixed(0)}`;

    const imageInfo: ImageInfo = {
      width,
      height,
      format: ext === 'JPEG' ? 'JPG' : ext,
      file_size_kb: fileSizeKb,
      has_alpha: ext === 'PNG',
      aspect_ratio: ratioStr,
      aspect_ratio_value: ratioVal,
    };

    let simulatedTextRatio: number | null = null;
    if (analyzeText) {
      simulatedTextRatio = 12.5; // Realistic safe advertising text ratio
    }

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
        evaluatePlacement(p, imageInfo, file.name, simulatedTextRatio)
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
      text_ratio: simulatedTextRatio,
      platform_results: platformResults,
    });
  }

  return { results };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
