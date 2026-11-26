import { describe, expect, it } from 'vitest';
import { classifyCreativePath, folderOf, isCheckableImage, platformsInSegment } from './folderClassifier';

describe('platformsInSegment', () => {
  it.each([
    ['카카오', ['kakao']],
    ['kakao_bizboard', ['kakao']],
    ['KakaoBizboard', ['kakao']],
    ['02_비즈보드', ['kakao']],
    ['META', ['meta']],
    ['instagram-feed', ['meta']],
    ['IG', ['meta']],
    ['네이버 GFA', ['naver']],
    ['네이버 치지직', ['chzzk']],
    ['토스광고', ['toss']],
    ['X', ['twitter']],
    ['rtb_house', ['rtb_house']],
    ['OK캐쉬백', ['syrup']],
    ['에피어_(320x250)_1_copy1', ['appier']],
  ])('%s -> %j', (segment, expected) => {
    expect(platformsInSegment(segment)).toEqual(expected);
  });

  it.each(['포토스튜디오', '300x250', '2026_봄캠페인', 'final', 'banner', '숲속캠페인', 'v2x'])(
    'does not see a platform in %s',
    (segment) => {
      expect(platformsInSegment(segment)).toEqual([]);
    }
  );

  it('matches latin names at the start of a word (known limit: "metadata" reads as META)', () => {
    expect(platformsInSegment('kakaobizboard')).toEqual(['kakao']);
    expect(platformsInSegment('metadata')).toEqual(['meta']);
  });

  it('lists every platform a shared folder names', () => {
    expect(platformsInSegment('카카오_네이버_공통').sort()).toEqual(['kakao', 'naver']);
  });

  it('reads decomposed Hangul from macOS paths', () => {
    expect(platformsInSegment('카카오'.normalize('NFD'))).toEqual(['kakao']);
  });
});

describe('classifyCreativePath', () => {
  it('uses the nearest folder that names a platform', () => {
    expect(classifyCreativePath('2026_봄캠페인/카카오/비즈보드_A/a.png')).toEqual({
      platformIds: ['kakao'],
      source: 'folder',
      matched: '비즈보드_A',
    });
  });

  it('prefers the file name over its folders', () => {
    expect(classifyCreativePath('카카오/meta_feed_1080x1350.png')?.platformIds).toEqual(['meta']);
    expect(classifyCreativePath('카카오/meta_feed_1080x1350.png')?.source).toBe('filename');
  });

  it('returns null when nothing names a platform', () => {
    expect(classifyCreativePath('campaign/final/banner_300x250.png')).toBeNull();
  });
});

describe('folderOf / isCheckableImage', () => {
  it('splits the folder from the file name', () => {
    expect(folderOf('a/b/c.png')).toBe('a/b');
    expect(folderOf('c.png')).toBe('');
  });

  it('skips OS junk and non-images', () => {
    const png = new File([''], 'a.png', { type: 'image/png' });
    expect(isCheckableImage(png, 'kakao/a.png')).toBe(true);
    expect(isCheckableImage(png, '__MACOSX/kakao/a.png')).toBe(false);
    expect(isCheckableImage(new File([''], '.DS_Store'), 'kakao/.DS_Store')).toBe(false);
    expect(isCheckableImage(new File([''], 'brief.pdf', { type: 'application/pdf' }))).toBe(false);
    expect(isCheckableImage(new File([''], 'a.webp'))).toBe(true); // some OSes give no type
  });
});

// ── folder drop walking, with a fake FileSystemEntry tree ──
import { collectDroppedFiles } from './folderClassifier';

type Node = { name: string; children?: Node[] };

function fakeEntry(node: Node, parent = ''): unknown {
  const fullPath = `${parent}/${node.name}`;
  if (!node.children) {
    return {
      isFile: true,
      isDirectory: false,
      name: node.name,
      fullPath,
      file: (ok: (f: File) => void) => ok(new File(['x'], node.name, { type: 'image/png' })),
    };
  }
  const kids = node.children.map((c) => fakeEntry(c, fullPath));
  return {
    isFile: false,
    isDirectory: true,
    name: node.name,
    fullPath,
    createReader: () => {
      // Hand out children in batches of 2, like browsers that cap readEntries.
      let i = 0;
      return {
        readEntries: (ok: (e: unknown[]) => void) => {
          const batch = kids.slice(i, i + 2);
          i += 2;
          ok(batch);
        },
      };
    },
  };
}

function fakeDrop(roots: Node[]): DataTransfer {
  return {
    items: roots.map((r) => ({ kind: 'file', webkitGetAsEntry: () => fakeEntry(r), getAsFile: () => null })),
    files: [],
  } as unknown as DataTransfer;
}

describe('collectDroppedFiles', () => {
  it('walks nested folders, reads every batch and keeps relative paths', async () => {
    const out = await collectDroppedFiles(
      fakeDrop([
        {
          name: '봄캠페인',
          children: [
            { name: '카카오', children: [{ name: 'a.png' }, { name: 'b.png' }, { name: 'c.png' }] },
            { name: 'META', children: [{ name: 'a.png' }] },
            { name: '__MACOSX', children: [{ name: '._a.png' }] },
          ],
        },
        { name: 'loose.png' },
      ])
    );
    expect(out.map((e) => e.relativePath).sort()).toEqual([
      'loose.png',
      '봄캠페인/META/a.png',
      '봄캠페인/카카오/a.png',
      '봄캠페인/카카오/b.png',
      '봄캠페인/카카오/c.png',
    ]);
  });
});
