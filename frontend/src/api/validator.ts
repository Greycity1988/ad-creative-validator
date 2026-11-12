import axios from 'axios';
import { ValidationResponse, ValidationItem, PlatformMetadata, FeedbackItem, FeedbackCreateRequest } from '../types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const fetchPlatformsMetadata = async (): Promise<PlatformMetadata[]> => {
  try {
    const response = await apiClient.get<{ platforms: PlatformMetadata[] }>('/platforms');
    if (response.data && typeof response.data === 'object' && Array.isArray(response.data.platforms)) {
      return response.data.platforms;
    }
    return [];
  } catch (err) {
    console.warn('API /platforms unreachable:', err);
    return [];
  }
};

export const fetchFeedbacks = async (): Promise<FeedbackItem[]> => {
  try {
    const response = await apiClient.get<FeedbackItem[]>('/feedbacks');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (err) {
    console.warn('API /feedbacks unreachable:', err);
    return [];
  }
};

export const submitFeedback = async (data: FeedbackCreateRequest): Promise<FeedbackItem> => {
  const response = await apiClient.post<FeedbackItem>('/feedbacks', data);
  if (!response.data || typeof response.data !== 'object' || !response.data.id) {
    throw new Error('피드백 저장 실패: 백엔드 서버 상태를 확인해주세요.');
  }
  return response.data;
};

export const updateAllSpecs = async (): Promise<{
  success: boolean;
  message: string;
  updated_at: string;
  total_platforms: number;
  total_placements: number;
}> => {
  const response = await apiClient.post('/specs/update');
  if (!response.data || typeof response.data !== 'object' || !response.data.message) {
    throw new Error('가이드라인 동기화 실패: 백엔드 서버 상태를 확인해주세요.');
  }
  return response.data;
};

export const validateImages = async (
  files: File[],
  platforms: string[],
  selectedPlacements: Record<string, string[]>,
  analyzeText: boolean,
  autoMatch: boolean = true
): Promise<ValidationResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  formData.append('platforms', JSON.stringify(platforms));
  formData.append('placements', JSON.stringify(selectedPlacements));
  formData.append('analyze_text', analyzeText ? 'true' : 'false');
  formData.append('auto_match', autoMatch ? 'true' : 'false');

  const response = await apiClient.post<ValidationResponse>('/validate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (typeof response.data === 'string' || !response.data?.results) {
    throw new Error('백엔드 검수 서버와 통신할 수 없습니다. 백엔드 주소(VITE_API_BASE_URL) 설정을 확인해주세요.');
  }

  return response.data;
};

export const downloadExcelReport = async (
  results: ValidationItem[],
  customFilename: string = 'ad_creative_validation_report.xlsx'
): Promise<void> => {
  const response = await apiClient.post('/report/excel', { results }, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', customFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
