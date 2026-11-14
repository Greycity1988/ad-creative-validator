import {
  ValidationResponse,
  ValidationItem,
  PlatformMetadata,
  FeedbackItem,
  FeedbackCreateRequest,
} from '../types';
import specsData from '../data/specsData.json';
import { validateImagesLocally } from '../utils/clientValidator';

const DEFAULT_METADATA = specsData as unknown as PlatformMetadata[];

export const fetchPlatformsMetadata = async (): Promise<PlatformMetadata[]> => DEFAULT_METADATA;

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  user: { login: string; avatar_url?: string };
  state: 'open' | 'closed';
  created_at: string;
  body: string | null;
  html_url: string;
  comments: number;
  labels?: Array<{ name: string; color: string }>;
}

export const fetchFeedbacks = async (): Promise<FeedbackItem[]> => {
  const items: FeedbackItem[] = [];

  // 1. Fetch real public issues from GitHub Issues API
  try {
    const res = await fetch(
      'https://api.github.com/repos/Greycity1988/ad-creative-validator/issues?state=all&per_page=50',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (res.ok) {
      const githubIssues: GitHubIssue[] = await res.json();
      if (Array.isArray(githubIssues)) {
        githubIssues.forEach((issue) => {
          let category = '신규 규격 제보';
          let title = issue.title;

          const catMatch = issue.title.match(/^\[(.*?)\]\s*(.*)$/);
          if (catMatch) {
            category = catMatch[1];
            title = catMatch[2] || issue.title;
          } else if (issue.labels && issue.labels.length > 0) {
            category = issue.labels[0].name;
          }

          items.push({
            id: `gh-${issue.id}`,
            issue_number: issue.number,
            title: title,
            category: category,
            content: issue.body || '상세 내용 없음',
            author: `@${issue.user?.login || '익명 제보자'}`,
            created_at: issue.created_at.split('T')[0],
            status: issue.state === 'closed' ? '반영 완료' : '검토 및 개발 중',
            html_url: issue.html_url,
            is_github: true,
            comments_count: issue.comments,
          });
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch GitHub issues:', err);
  }

  // 2. Also merge any locally saved drafts or feedback from this browser
  try {
    const stored = localStorage.getItem('ad_user_feedbacks');
    if (stored) {
      const localList: FeedbackItem[] = JSON.parse(stored);
      if (Array.isArray(localList)) {
        localList.forEach((localItem) => {
          if (!items.some((it) => it.id === localItem.id)) {
            items.push({
              ...localItem,
              status: localItem.status || '임시 기록 (이 브라우저에만 저장)',
            });
          }
        });
      }
    }
  } catch {
    // ignore
  }

  return items;
};

export const submitFeedback = async (data: FeedbackCreateRequest): Promise<FeedbackItem> => {
  // Save to client-side localStorage. This is a local draft record only: nothing is delivered from here.
  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: data.title,
    category: data.category,
    content: data.content,
    author: data.author || '익명 마케터',
    created_at: new Date().toISOString().split('T')[0],
    status: '임시 기록 (이 브라우저에만 저장)',
  };

  try {
    const stored = localStorage.getItem('ad_user_feedbacks');
    const list: FeedbackItem[] = stored ? JSON.parse(stored) : [];
    list.unshift(newItem);
    localStorage.setItem('ad_user_feedbacks', JSON.stringify(list));
  } catch {
    // ignore
  }

  return newItem;
};

/**
 * Validate images against advertising specifications.
 * Files are processed in browser memory only; nothing is sent over the network.
 */
export const validateImages = async (
  files: File[],
  platforms: string[],
  selectedPlacements: Record<string, string[]>,
  autoMatch: boolean = true
): Promise<ValidationResponse> => validateImagesLocally(files, platforms, selectedPlacements, autoMatch);

// Quote a CSV cell; a leading = + - @ (or tab/CR) would make Excel evaluate it as a formula.
const csvCell = (value: string): string => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const downloadCsvReport = async (
  results: ValidationItem[],
  customFilename: string = 'ad_creative_validation_report.csv'
): Promise<void> => {
  // Client-side CSV generation with UTF-8 BOM (opens in Microsoft Excel in Korean without mojibake)
  const rows: string[] = [];
  rows.push(['파일명', '해상도', '용량(KB)', '비율', '매체명', '지면명', '최종판정', '세부검수내역'].join(','));

  for (const item of results) {
    const img = item.image_info;
    const dim = `${img.width}x${img.height}`;
    const size = img.file_size_kb.toFixed(1);
    const ratio = img.aspect_ratio || '';

    for (const pr of item.platform_results) {
      for (const pl of pr.placements) {
        const checkSummary = pl.checks.map((c) => `[${c.name}] ${c.message}`).join(' | ');
        const row = [
          csvCell(item.filename),
          csvCell(dim),
          csvCell(size),
          csvCell(ratio),
          csvCell(pr.platform),
          csvCell(pl.name),
          csvCell(pl.overall.toUpperCase()),
          csvCell(checkSummary),
        ];
        rows.push(row.join(','));
      }
    }
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', customFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
