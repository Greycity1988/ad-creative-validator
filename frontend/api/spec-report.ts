/**
 * POST /api/spec-report — files a visitor's spec report as a GitHub issue, so reporting
 * needs no GitHub account. The issue gets the `spec-report` label, which starts the
 * checker workflow (.github/workflows/spec-report.yml). Nothing is merged from here.
 *
 * Needs the Vercel environment variable GITHUB_REPORT_TOKEN: a fine-grained token limited to
 * this repository with "Issues: Read and write". Without it the endpoint answers 503 and the
 * form falls back to a prefilled GitHub issue link.
 */
import { issueBody, issueTitle, validateSpecReport } from '../src/utils/specReport';

export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

const REPO = 'Greycity1988/ad-creative-validator';
const LABEL = 'spec-report';
const MAX_BODY_BYTES = 8 * 1024;
const MIN_FILL_MS = 4000; // humans take longer than this to fill the form
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

// Best effort only: each function instance keeps its own counts.
const recent = new Map<string, number[]>();

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function rateLimited(ip: string, now = Date.now()): boolean {
  const list = (recent.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (list.length >= RATE_LIMIT.max) {
    recent.set(ip, list);
    return true;
  }
  list.push(now);
  recent.set(ip, list);
  return false;
}

async function github(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'acv-spec-report',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST만 받습니다.' });

  // Only this site's own pages may post here.
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return json(403, { ok: false, error: '허용되지 않은 요청입니다.' });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: '내용이 너무 깁니다.' });

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: '요청 형식이 올바르지 않습니다.' });
  }
  if (!input || typeof input !== 'object') return json(400, { ok: false, error: '요청 형식이 올바르지 않습니다.' });

  // Honeypot: a field people never see. Pretend success so bots learn nothing.
  if (typeof input.website === 'string' && input.website.trim() !== '') return json(200, { ok: true });
  if (typeof input.elapsedMs !== 'number' || input.elapsedMs < MIN_FILL_MS) {
    return json(400, { ok: false, error: '잠시 후 다시 제출해 주세요.' });
  }

  const checked = validateSpecReport(input);
  if (!checked.ok) return json(400, { ok: false, error: checked.error });
  const report = checked.value;

  const token = process.env.GITHUB_REPORT_TOKEN;
  if (!token) return json(503, { ok: false, fallback: true, error: '지금은 바로 접수할 수 없습니다.' });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { ok: false, error: '제보가 너무 많습니다. 10분 뒤에 다시 시도해 주세요.' });

  const title = issueTitle(report);
  try {
    // Same report already open: add a note instead of a second issue.
    const open = await github(`/repos/${REPO}/issues?labels=${LABEL}&state=open&per_page=100`, token);
    if (open.ok) {
      const issues = (await open.json()) as Array<{ number: number; title: string; html_url: string }>;
      const same = issues.find((i) => i.title === title);
      if (same) {
        await github(`/repos/${REPO}/issues/${same.number}/comments`, token, {
          method: 'POST',
          body: JSON.stringify({ body: `같은 규격이 한 번 더 제보됐습니다. 가이드 주소: ${report.guideUrl}` }),
        });
        return json(200, { ok: true, duplicate: true, issueUrl: same.html_url, issueNumber: same.number });
      }
    }

    const created = await github(`/repos/${REPO}/issues`, token, {
      method: 'POST',
      body: JSON.stringify({ title, body: issueBody(report), labels: [LABEL] }),
    });
    if (!created.ok) {
      return json(502, { ok: false, fallback: true, error: '제보를 등록하지 못했습니다. GitHub로 직접 제보해 주세요.' });
    }
    const issue = (await created.json()) as { number: number; html_url: string };
    return json(201, { ok: true, issueUrl: issue.html_url, issueNumber: issue.number });
  } catch {
    return json(502, { ok: false, fallback: true, error: '제보를 등록하지 못했습니다. GitHub로 직접 제보해 주세요.' });
  }
}
