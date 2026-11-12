import { describe, expect, it } from 'vitest';
import specsData from '../data/specsData.json';
import { ImageInfo } from '../types';
import {
  SpecPlacement,
  SpecPlatform,
  evaluatePlacement,
  isPlacementMatchedByDimension,
  parseDimensionsFromFilename,
} from './clientValidator';

const specs = specsData as unknown as SpecPlatform[];

const image = (overrides: Partial<ImageInfo> = {}): ImageInfo => ({
  width: 1200,
  height: 628,
  format: 'JPG',
  file_size_kb: 100,
  has_alpha: false,
  aspect_ratio: '300:157',
  aspect_ratio_value: 1200 / 628,
  ...overrides,
});

const banner: SpecPlacement = {
  name: '테스트 배너 1200×628',
  dimension_str: '1200×628px',
  aspect_ratio_str: '',
  allowed_formats: ['jpg', 'png'],
  exact_width: 1200,
  exact_height: 628,
  max_file_size_kb: 500,
};

const statusOf = (placement: SpecPlacement, info: ImageInfo, check: string) =>
  evaluatePlacement(placement, info, '').checks.find((c) => c.name === check)?.status;

describe('parseDimensionsFromFilename', () => {
  it('reads WxH written with x or ×', () => {
    expect(parseDimensionsFromFilename('naver_1200x628_v2.jpg')).toEqual([1200, 628]);
    expect(parseDimensionsFromFilename('kakao 960×300.png')).toEqual([960, 300]);
  });

  it('reads W_H written with underscores, also after other words', () => {
    expect(parseDimensionsFromFilename('960_300.png')).toEqual([960, 300]);
    expect(parseDimensionsFromFilename('banner_960_300.png')).toEqual([960, 300]);
    expect(parseDimensionsFromFilename('naver_gfa_1200_628_final.jpg')).toEqual([1200, 628]);
  });

  it('does not read dates as dimensions', () => {
    expect(parseDimensionsFromFilename('kakao_2026_1112.png')).toBeNull();
    expect(parseDimensionsFromFilename('2026_1112_banner.png')).toBeNull();
    expect(parseDimensionsFromFilename('promo_1112_2026.png')).toBeNull();
    expect(parseDimensionsFromFilename('banner_0115_final.png')).toBeNull();
  });

  it('finds the dimensions next to a date', () => {
    expect(parseDimensionsFromFilename('event_20261112_1200_628.jpg')).toEqual([1200, 628]);
    expect(parseDimensionsFromFilename('kakao_2026_1112_960_300.png')).toEqual([960, 300]);
    expect(parseDimensionsFromFilename('banner_0115_1200_628.png')).toEqual([1200, 628]);
    expect(parseDimensionsFromFilename('meta_2026_1080_1080.png')).toEqual([1080, 1080]);
  });

  it('returns null when the name has no dimensions', () => {
    expect(parseDimensionsFromFilename('final_banner.png')).toBeNull();
  });
});

describe('evaluatePlacement', () => {
  it('passes an image that meets every rule', () => {
    const result = evaluatePlacement(banner, image(), '');
    expect(result.overall).toBe('pass');
    expect(result.is_matched_target).toBe(true);
  });

  it('fails on wrong dimensions', () => {
    expect(statusOf(banner, image({ width: 1200, height: 600 }), 'dimensions')).toBe('fail');
  });

  it('fails when the file is over the size limit', () => {
    expect(statusOf(banner, image({ file_size_kb: 500.1 }), 'file_size')).toBe('fail');
    expect(statusOf(banner, image({ file_size_kb: 500 }), 'file_size')).toBe('pass');
  });

  it('fails a format that is not allowed and treats JPG and JPEG as the same', () => {
    expect(statusOf(banner, image({ format: 'GIF' }), 'format')).toBe('fail');
    expect(statusOf({ ...banner, allowed_formats: ['jpeg'] }, image(), 'format')).toBe('pass');
  });

  it('requires an alpha channel when transparency is mandatory', () => {
    const cutout = { ...banner, require_transparency: true };
    expect(statusOf(cutout, image({ format: 'PNG', has_alpha: true }), 'transparency')).toBe('pass');
    expect(statusOf(cutout, image({ format: 'PNG', has_alpha: false }), 'transparency')).toBe('fail');
    expect(statusOf(cutout, image({ format: 'JPG' }), 'transparency')).toBe('fail');
  });

  it('checks minimum and maximum dimensions', () => {
    const flexible: SpecPlacement = {
      ...banner,
      exact_width: null,
      exact_height: null,
      min_width: 600,
      min_height: 314,
      max_width: 2400,
      max_height: 1256,
    };
    expect(statusOf(flexible, image(), 'dimensions')).toBe('pass');
    expect(statusOf(flexible, image({ width: 500, height: 262 }), 'dimensions')).toBe('fail');
    expect(statusOf(flexible, image({ width: 3000, height: 1570 }), 'dimensions')).toBe('fail');
  });

  it('checks aspect ratio within the tolerance', () => {
    const ratio: SpecPlacement = {
      ...banner,
      exact_width: null,
      exact_height: null,
      aspect_ratio: [1, 1],
      aspect_ratio_tolerance: 0.02,
    };
    expect(statusOf(ratio, image({ width: 1000, height: 1000, aspect_ratio_value: 1 }), 'aspect_ratio')).toBe('pass');
    expect(statusOf(ratio, image({ width: 1000, height: 900, aspect_ratio_value: 1000 / 900 }), 'aspect_ratio')).toBe('fail');
  });

  it('lists a text ratio limit as a manual check without changing the verdict', () => {
    const result = evaluatePlacement({ ...banner, text_ratio_limit: 0.2 }, image(), '');
    const textCheck = result.checks.find((c) => c.name === 'text_ratio');
    expect(textCheck?.status).toBe('manual');
    expect(textCheck?.expected).toBe('≤ 20%');
    expect(result.overall).toBe('pass');
  });

  it('adds no text ratio check when the placement has no limit', () => {
    expect(statusOf(banner, image(), 'text_ratio')).toBeUndefined();
  });
});

describe('isPlacementMatchedByDimension', () => {
  it('matches exact pixels and rejects other sizes', () => {
    expect(isPlacementMatchedByDimension(banner, 1200, 628, 1200 / 628)).toBe(true);
    expect(isPlacementMatchedByDimension(banner, 300, 250, 300 / 250)).toBe(false);
  });
});

describe('specsData.json', () => {
  it('keeps the placement count in sync with the detail list', () => {
    for (const platform of specs) {
      expect(platform.placements_detail.length, platform.id).toBe(platform.placements_count);
      expect(platform.placements.length, platform.id).toBe(platform.placements_count);
    }
  });

  it('gives every placement at least one allowed format and a size or ratio rule', () => {
    for (const platform of specs) {
      for (const p of platform.placements_detail) {
        const label = `${platform.id} / ${p.name}`;
        expect(p.allowed_formats.length, label).toBeGreaterThan(0);
        const hasRule =
          (p.exact_width != null && p.exact_height != null) ||
          (p.min_width != null && p.min_height != null) ||
          p.aspect_ratio != null;
        expect(hasRule, label).toBe(true);
      }
    }
  });

  it('passes a correctly sized image on a real placement with a text ratio limit', () => {
    const adison = specs.find((s) => s.id === 'adison')!;
    const placement = adison.placements_detail.find((p) => p.exact_width === 720 && p.exact_height === 360)!;
    const result = evaluatePlacement(
      placement,
      image({ width: 720, height: 360, format: 'PNG', aspect_ratio_value: 2, aspect_ratio: '2:1' }),
      ''
    );
    expect(result.overall).toBe('pass');
    expect(result.checks.some((c) => c.name === 'text_ratio' && c.status === 'manual')).toBe(true);
  });
});
