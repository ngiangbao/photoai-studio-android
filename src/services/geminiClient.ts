// Direct, client-side calls to Google's Gemini / Nano Banana / Veo APIs.
//
// server.ts proxies these same calls for the web build, but a standalone
// Android APK has no server to talk to - so when running inside the native
// app (Capacitor), these functions call Google directly from the device,
// using the user's own API key from Settings. This mirrors server.ts's
// logic exactly so behaviour stays consistent between the web and Android
// builds; see api.ts for the native-vs-web dispatch.
//
// The @google/genai SDK officially supports being constructed the same way
// in a browser as in Node ("In the browser the initialization code is
// identical" - SDK docs). CORS would normally block direct browser calls to
// a third-party API like this, which is why capacitor.config.ts enables
// CapacitorHttp: on Android this routes fetch/XHR (and the SDK's internal
// HTTP calls) through native networking instead of the WebView, so CORS
// does not apply.
import { GoogleGenAI } from '@google/genai';

function makeClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'photoai-studio-android' },
    },
  });
}

function splitDataUrl(imageBase64: string): { mimeType: string; data: string } {
  let mimeType = 'image/jpeg';
  let data = imageBase64;
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    data = match[2];
  }
  return { mimeType, data };
}

export interface EditImageParams {
  imageBase64: string;
  customPrompt: string;
  extraInstruction?: string;
  apiKey: string;
  model?: string;
}

async function editImage({
  imageBase64,
  customPrompt,
  extraInstruction,
  apiKey,
  model,
}: EditImageParams): Promise<{ imageDataUrl: string; mimeType: string }> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa có Gemini API key. Vào Cài đặt để nhập key.');
  }

  let fullPrompt = customPrompt;
  if (extraInstruction && extraInstruction.trim().length > 0) {
    fullPrompt += `\n\nYeu cau them tu nguoi dung: ${extraInstruction.trim()}`;
  }

  const { mimeType, data } = splitDataUrl(imageBase64);
  const ai = makeClient(apiKey);

  const response = await ai.models.generateContent({
    model: model?.trim() || 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: fullPrompt }, { inlineData: { mimeType, data } }],
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error('AI không trả về kết quả nào.');
  }
  if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY') {
    throw new Error('Nội dung ảnh bị chặn bởi bộ lọc an toàn.');
  }

  const parts = candidate.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const outMime = part.inlineData.mimeType || 'image/jpeg';
      return { imageDataUrl: `data:${outMime};base64,${part.inlineData.data}`, mimeType: outMime };
    }
  }

  const textPart = parts.find((p) => p.text)?.text;
  throw new Error(textPart || 'Không tìm thấy dữ liệu ảnh sau khi xử lý.');
}

export interface CategorizePhotoParams {
  imageBase64: string;
  apiKey: string;
  filename?: string;
}

async function categorizePhoto({
  imageBase64,
  apiKey,
  filename,
}: CategorizePhotoParams): Promise<{ category: string; tags: string[]; confidence: number; byAi: boolean }> {
  const { mimeType, data } = splitDataUrl(imageBase64);

  if (apiKey && apiKey.trim()) {
    try {
      const ai = makeClient(apiKey);
      const prompt = `Analyze this photo and classify it into EXACTLY ONE of the following album categories:
- "portraits": A portrait of a person (single or couple/few people posed, bust/face/body focused, modeling, studio shot, or clear person subject).
- "landscapes": Outdoor scenery, nature, mountains, lakes, beaches, forest, open skies, sunsets, city skyline, architecture without a prominent close-up human subject.
- "selfies": A selfie photo of one or more people taken from front-facing camera angle or arm's length, close-up facial view.
- "events": Group photos, parties, ceremonies, weddings, graduations, festivals, sports, celebrations, crowds.
- "others": Objects, food, animals, documents, abstract art, or anything else.

Also provide 2 to 4 concise descriptive tags (e.g. ["chân dung", "ngoài trời", "ánh sáng đẹp"]).
Output strictly in valid JSON format:
{
  "category": "portraits" | "landscapes" | "selfies" | "events" | "others",
  "tags": ["tag1", "tag2"],
  "confidence": 0.95,
  "reason": "Brief description"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, { inlineData: { mimeType, data } }] },
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const allowed = ['portraits', 'landscapes', 'selfies', 'events', 'others'];
          const category = allowed.includes(parsed.category) ? parsed.category : 'others';
          return {
            category,
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            confidence: parsed.confidence || 0.92,
            byAi: true,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini categorization failed, falling back to heuristic:', err);
    }
  }

  // Heuristic fallback, matching server.ts's behaviour when no key / call fails.
  let category = 'portraits';
  let tags = ['chân dung', 'ảnh đẹp'];
  const fn = (filename || '').toLowerCase();
  if (fn.includes('selfie') || fn.includes('front')) {
    category = 'selfies';
    tags = ['selfie', 'gần mặt'];
  } else if (fn.includes('land') || fn.includes('sky') || fn.includes('nature') || fn.includes('phong_canh')) {
    category = 'landscapes';
    tags = ['phong cảnh', 'thiên nhiên'];
  } else if (fn.includes('event') || fn.includes('party') || fn.includes('grad') || fn.includes('ky_yeu')) {
    category = 'events';
    tags = ['sự kiện', 'kỷ yếu'];
  }
  return { category, tags, confidence: 0.85, byAi: false };
}

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  apiKey: string;
  model?: string;
}

async function generateImage({ prompt, aspectRatio, apiKey, model }: GenerateImageParams): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa có Gemini API key. Vào Cài đặt để nhập key.');
  }

  const ai = makeClient(apiKey);
  const response = await ai.models.generateContent({
    model: model?.trim() || 'gemini-nano-banana-2.1',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: aspectRatio || '1:1', imageSize: '1K' },
    },
  } as any);

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'image/png';
      return `data:${mime};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('Tạo ảnh thất bại: AI không trả về ảnh nào.');
}

export interface GenerateVeoVideoParams {
  prompt?: string;
  imageBase64?: string | null;
  aspectRatio?: '16:9' | '9:16';
  apiKey: string;
}

async function generateVeoVideo({ prompt, imageBase64, aspectRatio, apiKey }: GenerateVeoVideoParams): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa có Gemini API key. Vào Cài đặt để nhập key.');
  }

  const ai = makeClient(apiKey);
  const videoRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

  const params: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this photo with cinematic camera movement and lifelike depth',
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: videoRatio,
    },
  };

  if (imageBase64) {
    const { mimeType, data } = splitDataUrl(imageBase64);
    params.image = { imageBytes: data, mimeType };
  }

  const operation = await ai.models.generateVideos(params);
  if (!operation.name) {
    throw new Error('Khởi tạo video Veo thất bại: không nhận được mã tác vụ.');
  }
  return operation.name;
}

export interface VeoPollParams {
  operationName: string;
  apiKey: string;
  intervalMs?: number;
  timeoutMs?: number;
  onTick?: (elapsedMs: number) => void;
  isCancelled?: () => boolean;
}

async function pollAndDownloadVeoVideo({
  operationName,
  apiKey,
  intervalMs = 5000,
  timeoutMs = 5 * 60 * 1000,
  onTick,
  isCancelled,
}: VeoPollParams): Promise<{ blobUrl: string; mimeType: string }> {
  const ai = makeClient(apiKey);
  const startedAt = Date.now();
  let downloadUri: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isCancelled?.()) throw new Error('cancelled');

    const elapsed = Date.now() - startedAt;
    if (elapsed > timeoutMs) {
      throw new Error('Video generation is taking longer than expected (over 5 minutes). Please try again later.');
    }
    onTick?.(elapsed);

    const updated = await ai.operations.get({ operation: { name: operationName } });
    if (updated.done) {
      downloadUri = updated.result?.generatedVideos?.[0]?.video?.uri || null;
      if (!downloadUri) {
        throw new Error('Video generation finished, but no video was returned.');
      }
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  if (isCancelled?.()) throw new Error('cancelled');

  // This fetch goes to Google's file-serving domain, not generativelanguage's
  // CORS-enabled API domain - on native Android, CapacitorHttp still routes
  // it through native networking so CORS is not a concern there.
  const videoRes = await fetch(downloadUri, {
    headers: { 'x-goog-api-key': apiKey },
  });
  if (!videoRes.ok) {
    throw new Error('Failed to download the generated video.');
  }
  const blob = await videoRes.blob();
  return { blobUrl: URL.createObjectURL(blob), mimeType: blob.type || 'video/mp4' };
}

export const geminiClient = {
  editImage,
  categorizePhoto,
  generateImage,
  generateVeoVideo,
  pollAndDownloadVeoVideo,
};
