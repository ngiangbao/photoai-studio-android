import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Video,
  Film,
  Download,
  RotateCw,
  X,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, CapturedPhoto } from '../types';
import { veoService } from '../services/veoService';

type VeoPhase = 'idle' | 'generating' | 'processing' | 'ready' | 'error';

interface MediaCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  strings: Record<string, string>;
  onAddPhoto: (photo: CapturedPhoto) => void;
  onShowToast: (type: 'status' | 'error', message: string) => void;
}

export const MediaCreationModal: React.FC<MediaCreationModalProps> = ({
  isOpen,
  onClose,
  settings,
  strings,
  onAddPhoto,
  onShowToast,
}) => {
  const isLight = settings.theme === 'light';

  const [activeMode, setActiveMode] = useState<'nano_image' | 'veo_video'>('nano_image');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Veo video generation is async on the server (1-3 minutes): these track the
  // actual lifecycle (kick off -> poll status -> download result) instead of
  // just firing the request and leaving the UI stuck on "processing" forever.
  const [veoPhase, setVeoPhase] = useState<VeoPhase>('idle');
  const [veoElapsedSec, setVeoElapsedSec] = useState<number>(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const veoCancelledRef = useRef<boolean>(false);

  if (!isOpen) return null;

  const resetVeoState = () => {
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
    setVeoPhase('idle');
    setVeoElapsedSec(0);
  };

  const handleCloseModal = () => {
    veoCancelledRef.current = true;
    resetVeoState();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedBase64) {
      onShowToast('error', 'Vui lòng nhập mô tả hoặc tải ảnh lên.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    resetVeoState();

    try {
      if (activeMode === 'nano_image') {
        const response = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            aspectRatio: aspectRatio,
            model: 'gemini-nano-banana-2.1',
            apiKey: settings.geminiApiKey,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Tạo ảnh thất bại');
        }

        setGeneratedImage(data.imageDataUrl);
        onShowToast('status', 'Tạo ảnh bằng Gemini Nano Banana 2.1 thành công!');
        setIsGenerating(false);
      } else {
        // Veo Video generation: kick off the async job, then actually follow
        // it through to completion (poll status, download the real video)
        // instead of just firing the request and leaving the UI hanging.
        veoCancelledRef.current = false;
        setVeoPhase('generating');

        const response = await fetch('/api/veo/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim() || 'Cinematic realistic video with smooth camera motion',
            imageBase64: uploadedBase64,
            aspectRatio: videoRatio,
            apiKey: settings.geminiApiKey,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Khởi tạo video Veo thất bại');
        }

        setVeoPhase('processing');
        setIsGenerating(false);

        const result = await veoService.pollAndDownload({
          operationName: data.operationName,
          apiKey: settings.geminiApiKey,
          onTick: (elapsedMs) => setVeoElapsedSec(Math.round(elapsedMs / 1000)),
          isCancelled: () => veoCancelledRef.current,
        });

        if (veoCancelledRef.current) return;

        setVideoBlobUrl(result.blobUrl);
        setVeoPhase('ready');
        onShowToast('status', 'Video Veo 3.1 đã sẵn sàng!');
      }
    } catch (err: any) {
      if (err?.message !== 'cancelled') {
        console.error('Generation error:', err);
        onShowToast('error', err?.message || 'Lỗi tạo nội dung');
        setVeoPhase('error');
      }
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return;
    const link = document.createElement('a');
    link.href = videoBlobUrl;
    link.download = `VeoVideo_${Date.now().toString().slice(-6)}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = () => {
    if (!generatedImage) return;

    const newPhoto: CapturedPhoto = {
      id: `ai_create_${Date.now()}`,
      dataUrl: generatedImage,
      name: `NanoBanana_${Date.now().toString().slice(-4)}.jpg`,
      timestamp: Date.now(),
    };

    onAddPhoto(newPhoto);
    onShowToast('status', 'Đã lưu tác phẩm vào thư viện.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <header className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
              {activeMode === 'nano_image' ? <Sparkles className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <h3 className="font-extrabold text-base">
              {activeMode === 'nano_image' ? 'Gemini Nano Banana 2.1 Studio' : 'Veo 3.1 Video Studio'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className={`p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('nano_image')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeMode === 'nano_image'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 shadow-sm'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo ảnh Nano Banana 2.1</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('veo_video')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeMode === 'veo_video'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 shadow-sm'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Tạo Video Veo 3.1</span>
            </button>
          </div>

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Mô tả ý tưởng (Prompt)
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeMode === 'nano_image'
                  ? 'Ví dụ: Một cô gái Việt Nam mặc áo dài trắng duyên dáng dạo bước bên hồ Gươm, ánh nắng hoàng hôn vàng ấm áp…'
                  : 'Ví dụ: Cảnh quay flycam cinematic lướt qua vịnh Hạ Long hùng vĩ, mặt nước lung linh sóng sánh…'
              }
              className={`w-full p-3 rounded-2xl text-xs border outline-none resize-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Aspect Ratio Options */}
          {activeMode === 'nano_image' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Tỷ lệ khung hình ảnh
              </label>
              <div className="flex gap-2">
                {['1:1', '4:3', '3:4', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      aspectRatio === ratio
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                        : isLight
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Tỷ lệ khung hình video Veo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVideoRatio('16:9')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    videoRatio === '16:9'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : isLight
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>16:9 (Landscape)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoRatio('9:16')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    videoRatio === '9:16'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : isLight
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Film className="w-4 h-4 rotate-90" />
                  <span>9:16 (Portrait TikTok/Reels)</span>
                </button>
              </div>
            </div>
          )}

          {/* Optional Image for Animate with Veo */}
          {activeMode === 'veo_video' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Ảnh nguồn để biến thành video (Tùy chọn)
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-slate-700 bg-black/10 hover:bg-black/20 cursor-pointer">
                {uploadedBase64 ? (
                  <div className="flex items-center gap-2">
                    <img src={uploadedBase64} alt="Thumb" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs text-emerald-400 font-bold">Đã chọn ảnh nguồn</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Upload className="w-4 h-4" />
                    <span>Bấm để tải ảnh cần làm động</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedImage && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Kết quả tạo ảnh
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 max-h-64 flex items-center justify-center bg-black">
                <img src={generatedImage} alt="Created Result" className="max-h-64 object-contain" />
              </div>
            </div>
          )}

          {(veoPhase === 'generating' || veoPhase === 'processing') && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-center space-y-2">
              <RotateCw className="w-6 h-6 text-purple-400 mx-auto animate-spin" />
              <p className="font-bold text-purple-300">
                {veoPhase === 'generating'
                  ? 'Đang khởi tạo video Veo 3.1…'
                  : 'AI đang tạo video (thường mất 1–3 phút)…'}
              </p>
              {veoPhase === 'processing' && (
                <p className="text-[11px] text-slate-400 font-mono">Đã chờ: {veoElapsedSec}s</p>
              )}
            </div>
          )}

          {veoPhase === 'ready' && videoBlobUrl && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Video đã sẵn sàng</span>
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black">
                <video src={videoBlobUrl} controls className="w-full max-h-72" />
              </div>
            </div>
          )}
        </div>

        <footer className="px-5 py-4 border-t border-black/5 dark:border-white/5 flex gap-2">
          {generatedImage ? (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveToGallery}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs"
              >
                Lưu vào bộ sưu tập
              </button>
            </>
          ) : veoPhase === 'ready' ? (
            <>
              <button
                type="button"
                onClick={resetVeoState}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-semibold"
              >
                Tạo video khác
              </button>
              <button
                type="button"
                onClick={handleDownloadVideo}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Tải video xuống</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || veoPhase === 'generating' || veoPhase === 'processing'}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-50"
            >
              {isGenerating || veoPhase === 'generating' || veoPhase === 'processing' ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý tạo nội dung…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{activeMode === 'nano_image' ? 'Tạo ảnh ngay' : 'Khởi tạo Video Veo'}</span>
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
