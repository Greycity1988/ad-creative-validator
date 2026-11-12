import axios from 'axios';
import {
  ValidationResponse,
  ValidationItem,
  PlatformMetadata,
  FeedbackItem,
  FeedbackCreateRequest,
} from '../types';
import specsData from '../data/specsData.json';
import { validateImagesLocally } from '../utils/clientValidator';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
});

const DEFAULT_METADATA = specsData as unknown as PlatformMetadata[];

export const fetchPlatformsMetadata = async (): Promise<PlatformMetadata[]> => {
  if (import.meta.env.VITE_API_BASE_URL) {
    try {
      const response = await apiClient.get<{ platforms: PlatformMetadata[] }>('/platforms');
      if (response.data && typeof response.data === 'object' && Array.isArray(response.data.platforms) && response.data.platforms.length > 0) {
        return response.data.platforms;
      }
    } catch (err) {
      console.warn('Custom backend API /platforms unreachable, falling back to built-in specs:', err);
    }
  }

  return DEFAULT_METADATA;
};

/** True only when an external backend is configured. The public site runs without one. */
export const HAS_BACKEND = Boolean(import.meta.env.VITE_API_BASE_URL);

const FEEDBACK_ISSUES_URL = 'https://github.com/Greycity1988/ad-creative-validator/issues/new';

/**
 * Build a prefilled GitHub issue link for a feedback item.
 * The email field is left out on purpose: issues are public.
 */
export const buildFeedbackIssueUrl = (data: FeedbackCreateRequest): string => {
  const title = `[${data.category}] ${data.title}`;
  const body = `${data.content}\n\n---\n작성자: ${data.author || '익명 마케터'}`;
  return `${FEEDBACK_ISSUES_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
};

export const fetchFeedbacks = async (): Promise<FeedbackItem[]> => {
  if (!HAS_BACKEND) {
    return [];
  }

  try {
    const response = await apiClient.get<FeedbackItem[]>('/feedbacks');
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    // ignore
  }

  return [];
};

/**
 * Send feedback to the backend. Only call this when HAS_BACKEND is true;
 * without a backend there is nowhere to deliver it, so the UI opens a GitHub issue instead.
 */
export const submitFeedback = async (data: FeedbackCreateRequest): Promise<FeedbackItem> => {
  const response = await apiClient.post<FeedbackItem>('/feedbacks', data);
  if (response.data && typeof response.data === 'object' && response.data.id) {
    return response.data;
  }
  throw new Error('Unexpected feedback response');
};

/**
 * Validate images against advertising specifications.
 * ZERO-NETWORK-TRANSFER GUARANTEE:
 * When running in client-mode (default on Vercel), files are processed 100% locally
 * in browser memory without sending a single byte over the network.
 */
export const validateImages = async (
  files: File[],
  platforms: string[],
  selectedPlacements: Record<string, string[]>,
  _analyzeText: boolean = false,
  autoMatch: boolean = true
): Promise<ValidationResponse> => {
  // 1. Guaranteed 100% local client-side evaluation if no external backend base URL is provided
  if (!import.meta.env.VITE_API_BASE_URL) {
    return validateImagesLocally(files, platforms, selectedPlacements, autoMatch);
  }

  // 2. If an enterprise backend is explicitly configured via VITE_API_BASE_URL
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('platforms', JSON.stringify(platforms));
    formData.append('placements', JSON.stringify(selectedPlacements));
    formData.append('auto_match', autoMatch ? 'true' : 'false');

    const response = await apiClient.post<ValidationResponse>('/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && typeof response.data === 'object' && Array.isArray(response.data.results) && response.data.results.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn('Backend /validate unavailable, falling back to local client engine:', err);
  }

  return validateImagesLocally(files, platforms, selectedPlacements, autoMatch);
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
          `"${item.filename.replace(/"/g, '""')}"`,
          `"${dim}"`,
          `"${size}"`,
          `"${ratio}"`,
          `"${pr.platform.replace(/"/g, '""')}"`,
          `"${pl.name.replace(/"/g, '""')}"`,
          `"${pl.overall.toUpperCase()}"`,
          `"${checkSummary.replace(/"/g, '""')}"`,
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
