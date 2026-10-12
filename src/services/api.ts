// Single place that decides HOW the app talks to Gemini/Veo and the
// version-check endpoint: through the Express backend (web build, served by
// server.ts) or directly from the device (Android build, no backend to call -
// see geminiClient.ts). Every component should go through this module
// instead of calling fetch('/api/...') or geminiClient directly, so that
// distinction lives in one place.
import { Capacitor } from '@capacitor/core';
import { geminiClient } from './geminiClient';
import { veoService } from './veoService';
import versionInfo from '../../version.json';
import type { AppUpdateInfo } from '../types';

const isNative = () => Capacitor.isNativePlatform();

export interface AppConfig {
  appName: string;
  appVersion: string;
  latestVersion: string;
  defaultModel: string;
  hasServerApiKey: boolean;
}

async function getConfig(): Promise<AppConfig> {
  if (isNative()) {
    // No backend on a standalone APK, so there is no shared/system API key -
    // every user supplies their own in Settings.
    return {
      appName: 'PhotoAI Studio',
      appVersion: versionInfo.version,
      latestVersion: versionInfo.version,
      defaultModel: 'gemini-2.5-flash-image',
      hasServerApiKey: false,
    };
  }
  const res = await fetch('/api/config');
  return res.json();
}

async function checkUpdate(currentVersion: string): Promise<AppUpdateInfo> {
  if (isNative()) {
    // There is no server to ask "is there a newer version" from a plain
    // APK outside an app store, so this honestly reports "up to date"
    // rather than guessing. Updating the app means installing a new APK.
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      releaseDate: versionInfo.releaseDate,
      releaseNotes: [],
      mandatory: false,
    };
  }
  const res = await fetch(`/api/check-update?currentVersion=${encodeURIComponent(currentVersion)}`);
  return res.json();
}

export interface EditImageArgs {
  imageBase64: string;
  customPrompt: string;
  extraInstruction?: string;
  apiKey: string;
  model?: string;
}

async function editImage(args: EditImageArgs): Promise<{ imageDataUrl: string }> {
  if (isNative()) {
    const result = await geminiClient.editImage(args);
    return { imageDataUrl: result.imageDataUrl };
  }
  const response = await fetch('/api/gemini/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    const err: any = new Error(data.error || 'AI edit failed');
    err.errorCode = data.errorCode;
    throw err;
  }
  return { imageDataUrl: data.imageDataUrl };
}

export interface CategorizeArgs {
  imageBase64: string;
  apiKey: string;
  filename?: string;
}

async function categorizePhoto(
  args: CategorizeArgs,
): Promise<{ category: string; tags: string[]; confidence: number; byAi: boolean }> {
  if (isNative()) {
    return geminiClient.categorizePhoto(args);
  }
  const response = await fetch('/api/gemini/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return response.json();
}

export interface GenerateImageArgs {
  prompt: string;
  aspectRatio?: string;
  apiKey: string;
  model?: string;
}

async function generateImage(args: GenerateImageArgs): Promise<string> {
  if (isNative()) {
    return geminiClient.generateImage(args);
  }
  const response = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Tạo ảnh thất bại');
  }
  return data.imageDataUrl;
}

export interface GenerateVeoVideoArgs {
  prompt?: string;
  imageBase64?: string | null;
  aspectRatio?: '16:9' | '9:16';
  apiKey: string;
}

async function generateVeoVideo(args: GenerateVeoVideoArgs): Promise<string> {
  if (isNative()) {
    return geminiClient.generateVeoVideo(args);
  }
  const response = await fetch('/api/veo/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Khởi tạo video Veo thất bại');
  }
  return data.operationName;
}

export interface VeoPollArgs {
  operationName: string;
  apiKey: string;
  onTick?: (elapsedMs: number) => void;
  isCancelled?: () => boolean;
}

async function pollAndDownloadVeoVideo(args: VeoPollArgs): Promise<{ blobUrl: string; mimeType: string }> {
  if (isNative()) {
    return geminiClient.pollAndDownloadVeoVideo(args);
  }
  return veoService.pollAndDownload(args);
}

export const api = {
  isNative,
  getConfig,
  checkUpdate,
  editImage,
  categorizePhoto,
  generateImage,
  generateVeoVideo,
  pollAndDownloadVeoVideo,
};
