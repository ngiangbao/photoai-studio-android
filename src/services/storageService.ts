import { CapturedPhoto, AppSettings, ThemeMode } from '../types';
import { INITIAL_SAMPLE_PHOTOS } from './samplePhotos';

const PHOTOS_STORAGE_KEY = 'photoai_captured_photos';
const SETTINGS_STORAGE_KEY = 'photoai_studio_settings';

export const storageService = {
  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          geminiApiKey: parsed.geminiApiKey || '',
          geminiModel: parsed.geminiModel || 'gemini-2.5-flash-image',
          language: parsed.language || 'vi',
          theme: (parsed.theme as ThemeMode) || 'dark',
          appVersion: parsed.appVersion || '1.2.0-pro',
          autoCheckUpdate: parsed.autoCheckUpdate !== undefined ? parsed.autoCheckUpdate : true,
        };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return {
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash-image',
      language: 'vi',
      theme: 'dark',
      appVersion: '1.2.0-pro',
      autoCheckUpdate: true,
    };
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  loadPhotos(): CapturedPhoto[] {
    try {
      const data = localStorage.getItem(PHOTOS_STORAGE_KEY);
      if (data) {
        const parsed: CapturedPhoto[] = JSON.parse(data);
        if (parsed.length > 0) {
          return parsed;
        }
      }
      // Seed initial sample photos for immediate testing of albums and batching
      this.savePhotos(INITIAL_SAMPLE_PHOTOS);
      return INITIAL_SAMPLE_PHOTOS;
    } catch (e) {
      console.error('Failed to load photos:', e);
    }
    return INITIAL_SAMPLE_PHOTOS;
  },

  savePhotos(photos: CapturedPhoto[]): void {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.error('Failed to save photos:', e);
    }
  },

  addPhoto(photo: CapturedPhoto): CapturedPhoto[] {
    const photos = this.loadPhotos();
    const updated = [photo, ...photos];
    this.savePhotos(updated);
    return updated;
  },

  updatePhoto(photo: CapturedPhoto): CapturedPhoto[] {
    const photos = this.loadPhotos();
    const updated = photos.map((p) => (p.id === photo.id ? photo : p));
    this.savePhotos(updated);
    return updated;
  },

  updatePhotos(updatedPhotos: CapturedPhoto[]): CapturedPhoto[] {
    const photos = this.loadPhotos();
    const updatedMap = new Map(updatedPhotos.map((p) => [p.id, p]));
    const updated = photos.map((p) => updatedMap.get(p.id) || p);
    this.savePhotos(updated);
    return updated;
  },

  removePhoto(id: string): CapturedPhoto[] {
    const photos = this.loadPhotos();
    const updated = photos.filter((p) => p.id !== id);
    this.savePhotos(updated);
    return updated;
  },
};

