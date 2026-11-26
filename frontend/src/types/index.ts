export interface SafeZoneUIElement {
  name: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'right' | 'top';
  width_ratio?: number;
  height_ratio?: number;
  width_px?: number;
  height_px?: number;
  description?: string;
}

export interface SafeZoneSpec {
  description: string;
  base_width?: number;
  base_height?: number;
  top_px?: number;
  bottom_px?: number;
  left_px?: number;
  right_px?: number;
  top_percent?: number;
  bottom_percent?: number;
  left_percent?: number;
  right_percent?: number;
  ui_elements?: SafeZoneUIElement[];
}

export interface CheckItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'manual' | string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface PlacementResult {
  name: string;
  overall: 'pass' | 'fail' | 'warning' | string;
  checks: CheckItem[];
  is_matched_target?: boolean;
  safe_zone?: SafeZoneSpec;
  // true only when this placement's rule was checked against the publisher's official document
  verified?: boolean;
  source?: string;
  // the source is old or contradicted, so the value is being confirmed with the publisher
  needs_confirmation?: boolean;
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
  /** Links the result to its upload (and preview) even when file names repeat. */
  file_id?: string;
  /** Path inside an uploaded folder, e.g. "카카오/비즈보드/a.png". */
  relative_path?: string;
  /** How the file's platforms were chosen when it came from a folder or a telling file name. */
  classification?: {
    platform_ids: string[];
    source: 'folder' | 'filename';
    matched: string;
  };
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
  safe_zone?: SafeZoneSpec;
  max_file_size_kb?: number | null;
  description?: string;
  notes?: string[];
  verified?: boolean;
  source?: string;
  source_type?: 'official_page' | 'official_document' | 'media_confirmed';
  source_date?: string;
  needs_confirmation?: boolean;
  unstated?: string[];
}

export interface PlatformVerification {
  status: 'verified' | 'partial' | 'unverified';
  checked_on?: string;
  method?: string;
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
  verification?: PlatformVerification;
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
  /** Path inside an uploaded folder; equals the file name for loose files. */
  relativePath: string;
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
  html_url?: string;
  issue_number?: number;
  is_github?: boolean;
  comments_count?: number;
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
