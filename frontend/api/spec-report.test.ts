import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './spec-report';
import { isOfficialUrl, issueBody, validateSpecReport } from '../src/utils/specReport';

const good = {
  platformId: 'naver',
  placementName: '스마트채널',
  width: 750,
  height: 160,
  maxKb: 150,
  formats: ['png'],
  transparent: true,
  guideUrl: 'https://displayad.naver.com/guide/smartchannel.pdf',
  docDate: '2026-01-02',
  elapsedMs: 9000,
};

let ipSeq = 0;
function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://ad-creative-validator.vercel.app/api/spec-report', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'ad-creative-validator.vercel.app',
      origin: 'https://ad-creative-validator.vercel.app',
      'x-forwarded-for': `10.0.0.${++ipSeq}`,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('isOfficialUrl', () => {
  it.each([
    ['naver', 'https://displayad.naver.com/x.pdf', true],
    ['naver', 'https://blog.naver.com/someone/123', false], // user pages on the same domain
    ['naver', 'http://displayad.naver.com/x.pdf', false], // https only
    ['naver', 'https://displayad.naver.com.evil.io/x', false],
    ['meta', 'https://www.facebook.com/business/help/123', true],
    ['meta', 'https://www.facebook.com/somebodys.page', false], // path prefix required
    ['kakao', 'https://kakaobusiness.gitbook.io/main/ad/bizboard', true],
    ['kakao', 'https://anyone.gitbook.io/fake-kakao', false],
    ['toss', 'https://displayad.naver.com/x', false], // another platform's host
  ])('%s %s -> %s', (pid, url, expected) => {
    expect(isOfficialUrl(pid, url)).toBe(expected);
  });
});

describe('validateSpecReport', () => {
  it('accepts a complete report and strips markup', () => {
    const r = validateSpecReport({ ...good, placementName: '<b>스마트채널</b>', note: 'see --> here' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.placementName).not.toMatch(/[<>]/);
      expect(issueBody(r.value)).toContain('<!-- acv-spec-report');
      // the note cannot close the hidden JSON comment early
      expect(issueBody(r.value).match(/-->/g)?.length).toBe(1);
    }
  });

  it.each([
    [{ platformId: 'nope' }, '매체'],
    [{ width: 5 }, '가로'],
    [{ formats: [] }, '형식'],
    [{ guideUrl: 'https://blog.naver.com/x' }, '공식 가이드 주소가 아닙니다'],
    [{ docDate: '2026/01/02' }, 'YYYY-MM-DD'],
  ])('rejects %j', (patch, message) => {
    const r = validateSpecReport({ ...good, ...patch });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(message);
  });
});

describe('POST /api/spec-report', () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  beforeEach(() => {
    calls.length = 0;
    process.env.GITHUB_REPORT_TOKEN = 'test-token';
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.includes('/issues?labels=')) {
        return new Response(JSON.stringify([{ number: 7, title: '[규격 제보] 카카오 비즈보드 960×300', html_url: 'https://github.com/x/7' }]));
      }
      if (url.endsWith('/comments')) return new Response('{}', { status: 201 });
      return new Response(JSON.stringify({ number: 42, html_url: 'https://github.com/x/42' }), { status: 201 });
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GITHUB_REPORT_TOKEN;
  });

  it('files an issue with the spec-report label', async () => {
    const res = await handler(post(good));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ ok: true, issueNumber: 42 });
    const create = calls.find((c) => c.url.endsWith('/issues') && c.init?.method === 'POST')!;
    const sent = JSON.parse(String(create.init!.body));
    expect(sent.labels).toEqual(['spec-report']);
    expect(sent.title).toBe('[규격 제보] 네이버 스마트채널 750×160');
    expect((create.init!.headers as Record<string, string>).authorization).toBe('Bearer test-token');
  });

  it('comments on an open duplicate instead of filing a second issue', async () => {
    const res = await handler(post({ ...good, platformId: 'kakao', placementName: '비즈보드', width: 960, height: 300, guideUrl: 'https://kakaobusiness.gitbook.io/main' }));
    expect(await res.json()).toMatchObject({ ok: true, duplicate: true, issueNumber: 7 });
    expect(calls.some((c) => c.url.endsWith('/issues/7/comments'))).toBe(true);
    expect(calls.some((c) => c.url.endsWith('/issues') && c.init?.method === 'POST')).toBe(false);
  });

  it('drops honeypot hits silently and rejects instant submissions', async () => {
    expect((await handler(post({ ...good, website: 'spam' }))).status).toBe(200);
    expect((await handler(post({ ...good, elapsedMs: 500 }))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('refuses other sites, other methods and oversized bodies', async () => {
    expect((await handler(post(good, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await handler(new Request('https://a/api/spec-report'))).status).toBe(405);
    expect((await handler(post({ ...good, note: 'x'.repeat(9000) }))).status).toBe(413);
  });

  it('rate-limits one address', async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await handler(post(good, { 'x-forwarded-for': '9.9.9.9' }))).status);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it('asks the form to fall back to GitHub when no token is configured', async () => {
    delete process.env.GITHUB_REPORT_TOKEN;
    const res = await handler(post(good));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ fallback: true });
  });
});
