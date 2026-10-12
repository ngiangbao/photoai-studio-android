import { CapturedPhoto, PhotoCategory } from '../types';

export interface CategorizeResult {
  category: PhotoCategory;
  tags: string[];
  confidence: number;
  reason?: string;
}

export const aiClassifier = {
  /**
   * Analyzes an image with Gemini Vision AI to categorize it into
   * 'portraits', 'landscapes', 'selfies', 'events', or 'others'.
   */
  async categorizePhoto(
    photo: CapturedPhoto,
    apiKey?: string,
  ): Promise<CategorizeResult> {
    try {
      const response = await fetch('/api/gemini/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photo.dataUrl,
          apiKey: apiKey || '',
          filename: photo.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.category) {
          return {
            category: data.category as PhotoCategory,
            tags: data.tags || [],
            confidence: data.confidence || 0.9,
            reason: data.reason,
          };
        }
      }
    } catch (err) {
      console.warn('AI categorization network call failed, using heuristic analysis:', err);
    }

    // Heuristic analysis based on image proportions and metadata
    return this.heuristicCategorize(photo);
  },

  /**
   * Fast smart heuristic fallback based on image aspect ratio and name patterns
   */
  async heuristicCategorize(photo: CapturedPhoto): Promise<CategorizeResult> {
    const nameLower = photo.name.toLowerCase();

    // Check name clues
    if (nameLower.includes('selfie') || nameLower.includes('front') || nameLower.includes('cam_user')) {
      return {
        category: 'selfies',
        tags: ['selfie', 'gần mặt', 'tự sướng'],
        confidence: 0.88,
      };
    }

    if (nameLower.includes('grad') || nameLower.includes('ky_yeu') || nameLower.includes('party') || nameLower.includes('event')) {
      return {
        category: 'events',
        tags: ['sự kiện', 'kỷ yếu', 'tập thể'],
        confidence: 0.85,
      };
    }

    if (nameLower.includes('land') || nameLower.includes('nature') || nameLower.includes('phong_canh') || nameLower.includes('sky')) {
      return {
        category: 'landscapes',
        tags: ['phong cảnh', 'thiên nhiên', 'ngoại cảnh'],
        confidence: 0.85,
      };
    }

    // Check aspect ratio by loading image
    return new Promise<CategorizeResult>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;

        // Wide landscape orientation (ratio > 1.25)
        if (ratio >= 1.25) {
          resolve({
            category: 'landscapes',
            tags: ['phong cảnh', 'góc rộng', 'ngoại cảnh'],
            confidence: 0.82,
          });
          return;
        }

        // Tall portrait orientation (ratio < 0.8)
        if (ratio <= 0.8) {
          // If square or standard mobile portrait
          resolve({
            category: 'portraits',
            tags: ['chân dung', 'khổ dọc', 'studio'],
            confidence: 0.85,
          });
          return;
        }

        // Default to portrait
        resolve({
          category: 'portraits',
          tags: ['chân dung', 'nghệ thuật'],
          confidence: 0.8,
        });
      };

      img.onerror = () => {
        resolve({
          category: 'others',
          tags: ['ảnh chụp'],
          confidence: 0.7,
        });
      };

      img.src = photo.dataUrl;
    });
  },

  /**
   * Batch categorize photos with a progress callback
   */
  async categorizeBatch(
    photos: CapturedPhoto[],
    apiKey: string | undefined,
    onProgress: (current: number, total: number, latestPhoto: CapturedPhoto) => void,
  ): Promise<CapturedPhoto[]> {
    const updatedPhotos: CapturedPhoto[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const result = await this.categorizePhoto(photo, apiKey);
      const updated: CapturedPhoto = {
        ...photo,
        category: result.category,
        aiTags: result.tags,
        analyzed: true,
      };
      updatedPhotos.push(updated);
      onProgress(i + 1, photos.length, updated);
    }

    return updatedPhotos;
  },
};
