export interface CheckItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface PlacementResult {
  name: string;
  overall: 'pass' | 'fail' | 'warning' | string;
  checks: CheckItem[];
  is_matched_target?: boolean;
}

export interface PlatformResult {
  platform: string;
  platform_id: string;
  overall?: string;
  placements: PlacementResult[];
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  file_size_kb: number;
  has_alpha?: boolean;
  aspect_ratio?: string;
  aspect_ratio_value?: number;
}

export interface ValidationItem {
  filename: string;
  image_info: ImageInfo;
  text_ratio?: number | null;
  platform_results: PlatformResult[];
}

export interface ValidationResponse {
  results: ValidationItem[];
}

export interface PlacementDetail {
  name: string;
  dimension_str: string;
  aspect_ratio_str: string;
  allowed_formats: string[];
}

export interface PlatformMetadata {
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
  placements_detail: PlacementDetail[];
}

export interface PlatformOption {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  badgeColor: string;
  description: string;
  category: 'portal' | 'network' | 'commerce' | 'reward' | 'global';
}

export interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  dimensions?: { width: number; height: number };
  targetChannelId?: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  email?: string;
  created_at: string;
  status: string;
  reply?: string;
}

export interface FeedbackCreateRequest {
  title: string;
  category: string;
  content: string;
  author?: string;
  email?: string;
}

export interface TargetChannelOption {
  id: string;
  label: string;
  platformId: string;
  categoryName: string;
  keywords: string[];
  description: string;
}
