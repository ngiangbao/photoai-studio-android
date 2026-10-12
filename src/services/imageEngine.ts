import { ImageAdjustments, FilterPreset } from '../types';

export const imageEngine = {
  /**
   * Applies CSS filter string based on Adjustments + Filter Preset
   */
  getCompositeCssFilter(adjustments: ImageAdjustments, filterPreset?: FilterPreset): string {
    const filters: string[] = [];

    // Base adjustments
    const b = 1 + adjustments.brightness / 100;
    const c = 1 + adjustments.contrast / 100;
    const s = 1 + adjustments.saturation / 100;

    filters.push(`brightness(${b.toFixed(2)})`);
    filters.push(`contrast(${c.toFixed(2)})`);
    filters.push(`saturate(${s.toFixed(2)})`);

    if (adjustments.warmth !== 0) {
      if (adjustments.warmth > 0) {
        // warmer (sepia / yellow hue)
        const sepiaVal = (adjustments.warmth / 100) * 0.4;
        filters.push(`sepia(${sepiaVal.toFixed(2)})`);
      } else {
        // cooler (blue hue)
        const hueVal = (adjustments.warmth / 100) * 20;
        filters.push(`hue-rotate(${hueVal.toFixed(0)}deg)`);
      }
    }

    // Filter preset additions
    if (filterPreset && filterPreset.id !== 'none') {
      filters.push(filterPreset.cssFilter);
    }

    return filters.join(' ');
  },

  /**
   * Renders the adjusted image onto a canvas and returns the baked dataUrl
   */
  async renderBakedImage(
    sourceDataUrl: string,
    adjustments: ImageAdjustments,
    filterPreset?: FilterPreset,
    scaleFactor: number = 1.0,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = Math.round(img.naturalWidth * scaleFactor);
          const height = Math.round(img.naturalHeight * scaleFactor);
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(sourceDataUrl);
            return;
          }

          // Apply CSS filter
          ctx.filter = this.getCompositeCssFilter(adjustments, filterPreset);
          ctx.drawImage(img, 0, 0, width, height);
          ctx.filter = 'none';

          // Apply Vignette if specified
          if (adjustments.vignette > 0) {
            const vignetteIntensity = adjustments.vignette / 100;
            const radius = Math.max(width, height) * 0.75;
            const gradient = ctx.createRadialGradient(
              width / 2,
              height / 2,
              radius * 0.4,
              width / 2,
              height / 2,
              radius,
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${(0.7 * vignetteIntensity).toFixed(2)})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = sourceDataUrl;
    });
  },

  /**
   * Transforms an image (Rotate 90°, Flip Horizontal, or Crop)
   */
  async transformImage(
    sourceDataUrl: string,
    action: 'rotate90' | 'flipH' | 'crop_1_1' | 'crop_4_3' | 'crop_3_4' | 'crop_16_9' | 'crop_9_16',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(sourceDataUrl);
            return;
          }

          const w = img.naturalWidth;
          const h = img.naturalHeight;

          if (action === 'rotate90') {
            canvas.width = h;
            canvas.height = w;
            ctx.translate(h / 2, w / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -w / 2, -h / 2);
          } else if (action === 'flipH') {
            canvas.width = w;
            canvas.height = h;
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0);
          } else {
            // Aspect ratio crop
            let targetRatio = 1;
            if (action === 'crop_1_1') targetRatio = 1;
            else if (action === 'crop_4_3') targetRatio = 4 / 3;
            else if (action === 'crop_3_4') targetRatio = 3 / 4;
            else if (action === 'crop_16_9') targetRatio = 16 / 9;
            else if (action === 'crop_9_16') targetRatio = 9 / 16;

            let cropW = w;
            let cropH = h;
            const currentRatio = w / h;

            if (currentRatio > targetRatio) {
              cropW = Math.round(h * targetRatio);
            } else {
              cropH = Math.round(w / targetRatio);
            }

            const startX = Math.round((w - cropW) / 2);
            const startY = Math.round((h - cropH) / 2);

            canvas.width = cropW;
            canvas.height = cropH;
            ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = sourceDataUrl;
    });
  },
};
