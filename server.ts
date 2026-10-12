import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

// Current release details
let CURRENT_SERVER_VERSION = '1.1.0-xingtu';
let LATEST_AVAILABLE_VERSION = '1.2.0-pro';

// Edit styles matching original ai/EditStyle.kt + Xingtu/Hypic additions
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
  app.use(express.json({ limit: '35mb' }));

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
      releaseDate: '2026-10-12',
      releaseNotes: [
        'Giao diện hoàn toàn mới lấy cảm hứng từ Xingtu & Hypic mượt mà cao cấp.',
        'Hỗ trợ chế độ Theme Sáng (Hypic Clean) & Theme Tối (Xingtu Dark).',
        'Bổ sung bộ công cụ Chân dung: Mịn da, Trắng da, Đôi mắt sáng, Thon gọn V-line.',
        'Bổ sung Công cụ AI: Làm nét HD, Đổi nền AI, Ánh sáng studio, Xóa chi tiết thừa.',
        'Bộ lọc màu chuyên nghiệp: Film cổ điển, Điện ảnh Teal, Hàn Quốc, Neon Cyber, B&W.',
        'Hệ thống Điều chỉnh ảnh theo thời gian thực (Độ sáng, Tương phản, Bão hòa, Nhiệt độ màu).',
        'Bộ điều khiển Hoàn tác (Undo) / Làm lại (Redo) đa tầng.',
        'Tùy chọn xuất ảnh chuẩn HD hoặc 2K siêu nét.',
      ],
      mandatory: false,
      downloadUrl: '/updates/photoai-studio-latest.tar.gz',
    });
  });

  // Trigger simulate bumping version for user testing
  app.post('/api/simulate-bump-version', (_req: Request, res: Response) => {
    // Generate an automatic next patch/minor version
    const parts = LATEST_AVAILABLE_VERSION.split('-')[0].split('.').map(Number);
    const nextMinor = parts[1] || 2;
    const nextPatch = (parts[2] || 0) + 1;
    LATEST_AVAILABLE_VERSION = `${parts[0]}.${nextMinor}.${nextPatch}-pro`;

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
