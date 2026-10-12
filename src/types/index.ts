export interface EditStyle {
  key: string;
  prompt: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  tag?: string;
  icon?: string;
}

export type PhotoCategory = 'all' | 'portraits' | 'landscapes' | 'selfies' | 'events' | 'others';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  name: string;
  timestamp: number;
  width?: number;
  height?: number;
  category?: PhotoCategory;
  aiTags?: string[];
  analyzed?: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  language: 'vi' | 'en';
  theme: ThemeMode;
  appVersion: string;
  autoCheckUpdate: boolean;
}

export type Screen = 'home' | 'editor' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'status' | 'error';
  text: string;
}

export type EditorTab = 'ai_style' | 'portrait' | 'ai_tools' | 'filters' | 'adjust' | 'crop';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  warmth: number;     // -100 to 100
  vignette: number;   // 0 to 100
  sharpen: number;    // 0 to 100
}

export interface FilterPreset {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  thumbnailColor: string;
  cssFilter: string;
  colorMatrix?: number[];
}

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string[];
  mandatory: boolean;
  downloadUrl?: string;
}

// Batch Processing Types
export type BatchActionType = 'style' | 'filter' | 'veo_video';

export interface BatchProcessItem {
  id: string;
  photo: CapturedPhoto;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultDataUrl?: string;
  videoUrl?: string;
  error?: string;
}
