import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

// Current release details - single source of truth is version.json at the repo
// root (bumped automatically by scripts/bump-version.mjs / the version-bump CI
// workflow), so this never drifts out of sync with package.json or the client.
// Read with fs instead of a JSON import so it works under both `tsx` (dev) and
// the plain Node runtime used in production, regardless of Node's JSON-import-
// attributes support.
const versionInfo: { version: string; releaseDate: string } = JSON.parse(
  readFileSync(path.resolve(__dirname, 'version.json'), 'utf-8'),
);

let CURRENT_SERVER_VERSION = versionInfo.version;
let LATEST_AVAILABLE_VERSION = versionInfo.version;
let LATEST_RELEASE_DATE = versionInfo.releaseDate;

// Edit styles matching original ai/EditStyle.kt + Pro Studio additions
const STYLES: Record<string, string> = {
  portrait:
    'Hay chinh sua anh chan dung nay mot cach chuyen nghiep: lam min da tu nhien ' +
    '(khong lam mat ket cau da that), can bang tong mau da, lam noi bat doi mat, ' +
    'tang nhe do sac net o khuon mat, lam mo nhe hau canh theo kieu chup ong kinh ' +
    'khau do lon (bokeh) neu phu hop, anh sang am va de chiu. Giu nguyen danh tinh ' +
    'va dac diem khuon mat cua nguoi trong anh, khong thay doi cau truc guong mat.',
  outdoor:
    'Hay chinh sua anh chup ngoai canh nay: can bang sang/toi tu nhien, tang nhe do ' +
    'ruc ro cua bau troi va cay coi mot cach chan thuc (khong qua da), dieu chinh ' +
    'can bang trang cho dung voi anh sang tu nhien, tao cam giac dien anh nhe nhang ' +
    'nhung van tu nhien, giu nguyen bo cuc va chu the trong anh.',
  landscape:
    'Hay chinh sua anh phong canh nay theo phong cach nhiep anh thien nhien chuyen ' +
    'nghiep: tang dai tuong phan dong (dynamic range), lam bau troi va may ro net ' +
    'hon, tang do sau mau sac mot cach chan thuc, lam noi bat chi tiet o tien canh ' +
    'va hau canh, sac net vua phai, khong chinh sua qua muc lam mat tinh tu nhien.',
  people:
    'Hay chinh sua anh chup nguoi nay theo phong cach tu nhien, doi thuong: can ' +
    'bang mau da chuan voi nhieu nguoi trong anh, chinh sang deu, giu mau sac trung ' +
    'thuc, lam sach nhe cac chi tiet gay xao nhang o hau canh neu co, giu nguyen ' +
    'bieu cam va dang dung tu nhien cua moi nguoi.',
  graduation:
    'Hay chinh sua anh ky yeu/tot nghiep nay: tong mau tuoi sang, ruc ro, vui tuoi, ' +
    'dong nhat ve tong mau de phu hop khi ghep chung voi cac anh ky yeu khac, lam ' +
    'noi bat nu cuoi va anh sang tren khuon mat, mau sac dong phuc/ao cu nhan ro ' +
    'net, co the them chut vignette nhe o vien anh cho noi bat chu the.',
  anime:
    'Hay chuyen the anh nay thanh buc hoa phong cach Anime Nhat Ban chat luong cao ' +
    '(Makoto Shinkai/Ghibli aesthetic): mau sac tuoi sang ruc ro, bau troi xanh trong ' +
    'may bong benh, anh sang lap lanh, duong net ve mem mai nhung van giu dac diem ' +
    'chu the goc mot cach tinh te.',
  cyber:
    'Hay bien hoa anh nay theo phong cach Cyberpunk Neon City: phoi mau neon xanh cyan ' +
    'va tim hong huyen ao, tang do tuong phan den sau va anh sang den neon ruc ro, ' +
    'hieu ung phan chieu dien anh hien dai.',
  // Retouch presets
  smooth:
    'Chinh sua lam min da tu nhien, giu ket cau lo chan long chan thuc, xoa vet tham, can bang do sang khuon mat.',
  tone:
    'Nang tong da trang hong tu nhien, sang deu mau, khong bi bet dinh, tao do bong tu nhien (glass skin).',
  eyes:
    'Lam sang va long lanh doi mat, ro net dong tu, xoa quang tham va bong mat, anh mat trong veo quyen ru.',
  slim:
    'Tinh chinh goc mat V-line thon gon tu nhien nhe nhang, can doi ty le guong mat hai hoa, giu net dac trung.',
  blemish:
    'Xoa sach cac vet mun, seo tham, nep nhan va khuyet diem tren da mot cach ti mi, giu nguyen duong net that.',
  // AI Tools
  enhance:
    'Hay khoi phuc va lam net anh nay (AI Super-Resolution HD): tang cuong do phan giai, lam ro chi tiet toc, mat, da va quan ao, giam nhieu (denoise) toi da.',
  bg:
    'Hay tach chu the va thay the hau canh thanh studio chup anh cao cap phong cach toi gian hien dai voi anh sang mem mai.',
  lighting:
    'Bo sung anh sang studio chuyen nghiep: hieu ung den ven (rim light) vien chu the, anh sang am ap ruc ro nhu gio vang.',
  erase:
    'Xoa bo cac chi tiet gay xao nhang o hau canh, nguoi la va rac thai xung quanh de lam noi bat chu the chinh.',
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '45mb' }));

  // API Config endpoint
  app.get('/api/config', (_req: Request, res: Response) => {
    res.json({
      appName: 'PhotoAI Studio',
      appVersion: CURRENT_SERVER_VERSION,
      latestVersion: LATEST_AVAILABLE_VERSION,
      defaultModel: 'gemini-2.5-flash-image',
      hasServerApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    });
  });

  // Check for updates endpoint
  app.get('/api/check-update', (req: Request, res: Response) => {
    const clientVersion = (req.query.currentVersion as string) || CURRENT_SERVER_VERSION;
    const hasUpdate = clientVersion !== LATEST_AVAILABLE_VERSION;

    res.json({
      hasUpdate,
      currentVersion: clientVersion,
      latestVersion: LATEST_AVAILABLE_VERSION,
      releaseDate: LATEST_RELEASE_DATE,
      releaseNotes: [
        'Video Veo 3.1 giờ xử lý hoàn chỉnh: tự động theo dõi tiến trình tạo video và tải video thật về để xem/lưu (trước đây chỉ khởi tạo rồi dừng ở đó).',
        'Áp dụng Veo Video hàng loạt (Batch) cũng được xử lý hoàn chỉnh tương tự, kèm xem trước video và tải xuống.',
        'Thêm lưu ý "dự án vibe coding" trong mục Cài đặt và README để minh bạch về cách ứng dụng được xây dựng.',
        'Đồng bộ số phiên bản ứng dụng về một nguồn duy nhất, tự động tăng ở mỗi lần phát hành.',
      ],
      mandatory: false,
    });
  });

  // Trigger simulate bumping version for user testing (in-memory only, does
  // not touch version.json - that file is the real release version and is
  // only bumped by scripts/bump-version.mjs / the version-bump CI workflow).
  app.post('/api/simulate-bump-version', (_req: Request, res: Response) => {
    const match = LATEST_AVAILABLE_VERSION.match(/^alpha-(\d+)\.(\d+)\.(\d+)$/);
    const [major, minor, patch] = match ? match.slice(1).map(Number) : [0, 0, 0];
    LATEST_AVAILABLE_VERSION = `alpha-${major}.${minor}.${patch + 1}`;

    res.json({
      success: true,
      newLatestVersion: LATEST_AVAILABLE_VERSION,
    });
  });

  // AI photo edit endpoint matching GeminiEditor.kt
  app.post('/api/gemini/edit', async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageBase64, styleKey, customPrompt, extraInstruction, apiKey, model } = req.body;

      if (!imageBase64) {
        res.status(400).json({ errorCode: 'error_no_photo_selected', error: 'No image provided' });
        return;
      }

      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';
      if (!effectiveApiKey) {
        res.status(401).json({ errorCode: 'error_missing_api_key', error: 'Missing Gemini API key' });
        return;
      }

      let stylePrompt = customPrompt || STYLES[styleKey] || STYLES.portrait;
      let fullPrompt = stylePrompt;
      if (extraInstruction && extraInstruction.trim().length > 0) {
        fullPrompt += `\n\nYeu cau them tu nguoi dung: ${extraInstruction.trim()}`;
      }

      // Extract raw base64 and mime type
      let cleanBase64 = imageBase64;
      let mimeType = 'image/jpeg';
      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }

      const effectiveModel = (model && model.trim()) || 'gemini-2.5-flash-image';

      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: effectiveModel,
        contents: {
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) {
        res.status(502).json({ errorCode: 'error_no_candidates', error: 'No candidates returned from Gemini' });
        return;
      }

      if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY') {
        res.status(400).json({ errorCode: 'error_prohibited_content', error: 'Content blocked by safety policy' });
        return;
      }

      const parts = candidate.content?.parts || [];
      let outputBase64: string | null = null;
      let outputMimeType = 'image/jpeg';

      for (const part of parts) {
        if (part.inlineData?.data) {
          outputBase64 = part.inlineData.data;
          if (part.inlineData.mimeType) {
            outputMimeType = part.inlineData.mimeType;
          }
          break;
        }
      }

      if (!outputBase64) {
        const textPart = parts.find((p) => p.text)?.text;
        res.status(502).json({
          errorCode: 'error_no_image_in_response',
          error: textPart || 'Gemini did not return an image',
        });
        return;
      }

      res.json({
        success: true,
        imageDataUrl: `data:${outputMimeType};base64,${outputBase64}`,
        mimeType: outputMimeType,
      });
    } catch (err: any) {
      console.error('Error processing AI edit:', err);
      const message = err?.message || String(err);
      const status = err?.status || 500;
      res.status(status).json({
        errorCode: 'error_network_call_failed',
        error: message,
      });
    }
  });

  // AI photo categorization into Albums (Portraits, Landscapes, Selfies, Events, Others)
  app.post('/api/gemini/categorize', async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageBase64, apiKey, filename } = req.body;

      if (!imageBase64) {
        res.status(400).json({ error: 'imageBase64 is required' });
        return;
      }

      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';

      // Extract raw base64 and mime type
      let cleanBase64 = imageBase64;
      let mimeType = 'image/jpeg';
      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }

      if (effectiveApiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey: effectiveApiKey,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' },
            },
          });

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
            contents: {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          });

          const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              const allowed = ['portraits', 'landscapes', 'selfies', 'events', 'others'];
              const category = allowed.includes(parsed.category) ? parsed.category : 'others';
              res.json({
                success: true,
                category,
                tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                confidence: parsed.confidence || 0.92,
                reason: parsed.reason || '',
                byAi: true,
              });
              return;
            }
          }
        } catch (geminiError: any) {
          console.warn('Gemini categorization failed, falling back to heuristic:', geminiError?.message || geminiError);
        }
      }

      // Intelligent heuristic fallback
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

      res.json({
        success: true,
        category,
        tags,
        confidence: 0.85,
        byAi: false,
      });
    } catch (err: any) {
      console.error('Categorize error:', err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  // Create image with gemini-nano-banana-2.1
  app.post('/api/gemini/generate-image', async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, aspectRatio, apiKey, model } = req.body;
      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';
      if (!effectiveApiKey) {
        res.status(401).json({ errorCode: 'error_missing_api_key', error: 'Missing Gemini API key' });
        return;
      }

      const selectedModel = (model && model.trim()) || 'gemini-nano-banana-2.1';
      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const generateParams: any = {
        model: selectedModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: '1K',
          },
        },
      };
      const response = await ai.models.generateContent(generateParams);

      const parts = response.candidates?.[0]?.content?.parts || [];
      let imgBase64: string | null = null;
      let mime = 'image/png';

      for (const p of parts) {
        if (p.inlineData?.data) {
          imgBase64 = p.inlineData.data;
          if (p.inlineData.mimeType) mime = p.inlineData.mimeType;
          break;
        }
      }

      if (!imgBase64) {
        res.status(502).json({ error: 'No image generated' });
        return;
      }

      res.json({
        success: true,
        imageDataUrl: `data:${mime};base64,${imgBase64}`,
      });
    } catch (err: any) {
      console.error('Error generating image:', err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  // Veo Video Generation: Animate image into video or generate from text
  app.post('/api/veo/generate-video', async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, imageBase64, aspectRatio, apiKey } = req.body;
      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';
      if (!effectiveApiKey) {
        res.status(401).json({ errorCode: 'error_missing_api_key', error: 'Missing Gemini API key' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const videoRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const modelName = 'veo-3.1-fast-generate-preview';

      let videoPayload: any = {
        model: modelName,
        prompt: prompt || 'Animate this photo with cinematic camera movement and lifelike depth',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: videoRatio,
        },
      };

      if (imageBase64) {
        let cleanBase64 = imageBase64;
        let mime = 'image/jpeg';
        const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (match) {
          mime = match[1];
          cleanBase64 = match[2];
        }
        videoPayload.image = {
          imageBytes: cleanBase64,
          mimeType: mime,
        };
      }

      const operation = await ai.models.generateVideos(videoPayload);

      res.json({
        success: true,
        operationName: operation.name,
      });
    } catch (err: any) {
      console.error('Error initiating Veo video generation:', err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  // Veo Video Status Polling
  app.post('/api/veo/status', async (req: Request, res: Response): Promise<void> => {
    try {
      const { operationName, apiKey } = req.body;
      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      // `ai.operations.getVideosOperation` does not exist on this SDK version
      // (it is a private internal helper) - the public method is `get`, and
      // completed videos land under `.result`, not `.response`.
      const updated = await ai.operations.get({ operation: { name: operationName } });

      const isDone = updated.done === true;
      let downloadUri: string | null = null;
      if (isDone) {
        downloadUri = updated.result?.generatedVideos?.[0]?.video?.uri || null;
      }

      res.json({
        done: isDone,
        hasDownloadUri: Boolean(downloadUri),
        downloadUri,
      });
    } catch (err: any) {
      console.error('Error polling Veo status:', err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  // Veo Video Download stream
  app.post('/api/veo/download', async (req: Request, res: Response): Promise<void> => {
    try {
      const { operationName, apiKey } = req.body;
      const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || '';

      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const updated = await ai.operations.get({ operation: { name: operationName } });
      const uri = updated.result?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        res.status(404).json({ error: 'Video URI not found or video generation not finished' });
        return;
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': effectiveApiKey },
      });

      res.setHeader('Content-Type', 'video/mp4');
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Error downloading Veo video:', err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`PhotoAI Studio running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
