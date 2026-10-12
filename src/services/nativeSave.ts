// On the web, a `<a download>` click on a blob/data URL triggers the
// browser's normal download. Inside an Android WebView that does nothing -
// there is no download manager listening for blob:/data: URIs - so every
// "download" and "save" button in the app would silently fail once wrapped
// as a native APK. This module writes the file to the device directly via
// the Filesystem plugin instead, whenever the app is running natively.
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const isNative = (): boolean => Capacitor.isNativePlatform();

async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Không đọc được dữ liệu file.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBase64(dataUrl: string): string {
  const commaIdx = dataUrl.indexOf(',');
  return commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
}

/**
 * Saves a blob: or data: URL to the device's Documents/PhotoAI Studio folder.
 * Returns the human-readable path shown to the user in a toast.
 */
export async function saveFileNative(source: string, filename: string): Promise<string> {
  const base64 = source.startsWith('blob:') ? await blobUrlToBase64(source) : dataUrlToBase64(source);
  const relativePath = `PhotoAI Studio/${filename}`;

  await Filesystem.writeFile({
    path: relativePath,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  return relativePath;
}
