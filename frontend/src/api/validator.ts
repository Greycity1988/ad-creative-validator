import axios from 'axios';
import { ValidationResponse, ValidationItem, PlatformMetadata, FeedbackItem, FeedbackCreateRequest } from '../types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const fetchPlatformsMetadata = async (): Promise<PlatformMetadata[]> => {
  const response = await apiClient.get<{ platforms: PlatformMetadata[] }>('/platforms');
  return response.data.platforms;
};

export const fetchFeedbacks = async (): Promise<FeedbackItem[]> => {
  const response = await apiClient.get<FeedbackItem[]>('/feedbacks');
  return response.data;
};

export const submitFeedback = async (data: FeedbackCreateRequest): Promise<FeedbackItem> => {
  const response = await apiClient.post<FeedbackItem>('/feedbacks', data);
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
