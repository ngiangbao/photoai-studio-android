import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Palette,
  Video,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  RotateCw,
  Film,
  Layers,
  Save,
} from 'lucide-react';
import {
  CapturedPhoto,
  AppSettings,
  BatchActionType,
  BatchProcessItem,
} from '../types';
import {
  STYLES_LIST,
  FILTER_PRESETS,
} from '../localization/strings';
import { imageEngine } from '../services/imageEngine';
import { api } from '../services/api';
import { isNative, saveFileNative } from '../services/nativeSave';

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: CapturedPhoto[];
  settings: AppSettings;
  strings: Record<string, string>;
  onBatchSaveToGallery: (newPhotos: CapturedPhoto[]) => void;
  onShowToast: (type: 'status' | 'error', message: string) => void;
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
  selectedPhotos,
  settings,
  strings,
  onBatchSaveToGallery,
  onShowToast,
}) => {
  const isLight = settings.theme === 'light';

  // Modal Step: 'config' | 'processing' | 'completed'
  const [step, setStep] = useState<'config' | 'processing' | 'completed'>('config');

  // Configuration options
  const [actionType, setActionType] = useState<BatchActionType>('style');
  const [selectedStyleKey, setSelectedStyleKey] = useState<string>('portrait');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('vintage');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [extraNote, setExtraNote] = useState<string>('');

  // Processing state
  const [items, setItems] = useState<BatchProcessItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentItemElapsedSec, setCurrentItemElapsedSec] = useState<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  if (!isOpen) return null;

  // Initialize or reset
  const handleStartProcessing = async () => {
    isCancelledRef.current = false;
    const initialItems: BatchProcessItem[] = selectedPhotos.map((p) => ({
      id: p.id,
      photo: p,
      status: 'pending',
    }));

    setItems(initialItems);
    setStep('processing');
    setCurrentIndex(0);

    const updatedItems = [...initialItems];

    for (let i = 0; i < updatedItems.length; i++) {
      if (isCancelledRef.current) break;

      setCurrentIndex(i);
      updatedItems[i].status = 'processing';
      setItems([...updatedItems]);

      const photo = updatedItems[i].photo;

      try {
        if (actionType === 'filter') {
          // Instant Canvas batch processing
          const filterPreset = FILTER_PRESETS.find((f) => f.id === selectedFilterId);
          const baked = await imageEngine.renderBakedImage(
            photo.dataUrl,
            { brightness: 0, contrast: 0, saturation: 0, warmth: 0, vignette: 0, sharpen: 0 },
            filterPreset,
          );
          updatedItems[i].resultDataUrl = baked;
          updatedItems[i].status = 'done';
        } else if (actionType === 'style') {
          // AI Style processing
          const styleObj = STYLES_LIST.find((s) => s.key === selectedStyleKey) || STYLES_LIST[0];
          const { imageDataUrl } = await api.editImage({
            imageBase64: photo.dataUrl,
            customPrompt: styleObj.prompt,
            extraInstruction: extraNote,
            apiKey: settings.geminiApiKey,
            model: settings.geminiModel,
          });
          updatedItems[i].resultDataUrl = imageDataUrl;
          updatedItems[i].status = 'done';
        } else if (actionType === 'veo_video') {
          // Veo Video generation from image. The job is async (1-3 min): kick
          // it off, then actually poll for completion and download the real
          // video instead of marking the item "done" the moment the job is
          // merely accepted (which is what used to happen - the raw
          // operationName was stored and nothing ever played/downloaded).
          setCurrentItemElapsedSec(0);
          const operationName = await api.generateVeoVideo({
            imageBase64: photo.dataUrl,
            aspectRatio: videoRatio,
            prompt: extraNote || 'Cinematic camera pan and animated movement',
            apiKey: settings.geminiApiKey,
          });

          const result = await api.pollAndDownloadVeoVideo({
            operationName,
            apiKey: settings.geminiApiKey,
            onTick: (elapsedMs) => setCurrentItemElapsedSec(Math.round(elapsedMs / 1000)),
            isCancelled: () => isCancelledRef.current,
          });

          updatedItems[i].resultDataUrl = photo.dataUrl;
          updatedItems[i].videoUrl = result.blobUrl;
          updatedItems[i].status = 'done';
        }
      } catch (err: any) {
        console.error('Batch item error:', err);
        updatedItems[i].status = 'error';
        updatedItems[i].error = err?.message || 'Lỗi xử lý';
      }

      setItems([...updatedItems]);
    }

    setStep('completed');
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    onClose();
  };

  const completedItems = items.filter((item) => item.status === 'done' && item.resultDataUrl);
  // Veo video results are real .mp4 blobs, not photos - the gallery only
  // stores CapturedPhoto (still images), so "save to gallery" only applies
  // to the style/filter actions. Video items are download-only.
  const completedVideoItems = items.filter((item) => item.status === 'done' && item.videoUrl);

  const handleSaveAllToGallery = () => {
    if (actionType === 'veo_video' || completedItems.length === 0) return;

    const newPhotos: CapturedPhoto[] = completedItems.map((item) => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dataUrl: item.resultDataUrl!,
      name: `${item.photo.name.replace(/\.[^/.]+$/, '')}_batch_${actionType}.jpg`,
      timestamp: Date.now(),
      category: item.photo.category || (selectedStyleKey === 'landscape' ? 'landscapes' : 'portraits'),
      aiTags: [...(item.photo.aiTags || []), `batch_${actionType}`],
      analyzed: true,
    }));

    onBatchSaveToGallery(newPhotos);
    onShowToast('status', `Đã lưu ${newPhotos.length} ảnh vào bộ sưu tập.`);
    onClose();
  };

  const handleDownloadAll = async () => {
    if (actionType === 'veo_video') {
      if (isNative()) {
        for (const item of completedVideoItems) {
          try {
            await saveFileNative(item.videoUrl!, `${item.photo.name.replace(/\.[^/.]+$/, '')}_veo.mp4`);
          } catch (err: any) {
            console.error('Save video failed:', err);
          }
        }
        onShowToast('status', `Đã lưu ${completedVideoItems.length} video vào Documents/PhotoAI Studio.`);
        return;
      }
      completedVideoItems.forEach((item, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = item.videoUrl!;
          link.download = `${item.photo.name.replace(/\.[^/.]+$/, '')}_veo.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 250);
      });
      onShowToast('status', `Đang tải xuống ${completedVideoItems.length} video…`);
      return;
    }

    if (isNative()) {
      for (const item of completedItems) {
        try {
          await saveFileNative(item.resultDataUrl!, `${item.photo.name.replace(/\.[^/.]+$/, '')}_batch.jpg`);
        } catch (err: any) {
          console.error('Save image failed:', err);
        }
      }
      onShowToast('status', `Đã lưu ${completedItems.length} ảnh vào Documents/PhotoAI Studio.`);
      return;
    }

    completedItems.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.resultDataUrl!;
        link.download = `${item.photo.name.replace(/\.[^/.]+$/, '')}_batch.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 250);
    });
    onShowToast('status', `Đang tải xuống ${completedItems.length} ảnh…`);
  };

  const progressPercent = items.length > 0 ? Math.round((items.filter((i) => i.status === 'done' || i.status === 'error').length / items.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <header className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                {strings.batch_action_title}
              </h3>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold">
                {selectedPhotos.length} ảnh đã chọn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className={`p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* STEP 1: CONFIGURATION */}
          {step === 'config' && (
            <div className="space-y-5 animate-fade-in">
              {/* Action Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {strings.batch_choose_action}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('style')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      actionType === 'style'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold shadow-sm'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs">{strings.batch_apply_style}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('filter')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      actionType === 'filter'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold shadow-sm'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Palette className="w-5 h-5" />
                    <span className="text-xs">{strings.batch_apply_filter}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('veo_video')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      actionType === 'veo_video'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold shadow-sm'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span className="text-xs">Veo Video AI</span>
                  </button>
                </div>
              </div>

              {/* Sub-options for AI Style */}
              {actionType === 'style' && (
                <div className="space-y-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Chọn phong cách áp dụng hàng loạt
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STYLES_LIST.map((style) => (
                        <button
                          key={style.key}
                          type="button"
                          onClick={() => setSelectedStyleKey(style.key)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                            selectedStyleKey === style.key
                              ? 'bg-indigo-600 text-white border-transparent shadow'
                              : isLight
                              ? 'bg-white border-slate-200 text-slate-700'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{strings[`style_${style.key}`] || style.key}</span>
                            {selectedStyleKey === style.key && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={extraNote}
                    onChange={(e) => setExtraNote(e.target.value)}
                    placeholder="Ghi chú thêm cho AI (tuỳ chọn: làm sáng hơn, tăng màu hoa…)"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              )}

              {/* Sub-options for Filter */}
              {actionType === 'filter' && (
                <div className="space-y-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Chọn bộ lọc màu áp dụng hàng loạt
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {FILTER_PRESETS.filter((f) => f.id !== 'none').map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setSelectedFilterId(filter.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                          selectedFilterId === filter.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-500'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${filter.thumbnailColor}`} />
                        <span>{filter.nameVi}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-options for Veo Video */}
              {actionType === 'veo_video' && (
                <div className="space-y-3 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
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
                            ? 'bg-purple-600 text-white border-transparent'
                            : isLight
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>{strings.veo_ratio_16_9}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoRatio('9:16')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          videoRatio === '9:16'
                            ? 'bg-purple-600 text-white border-transparent'
                            : isLight
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <Film className="w-4 h-4 rotate-90" />
                        <span>{strings.veo_ratio_9_16}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Photos Thumbnails Strip */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Danh sách {selectedPhotos.length} ảnh sẽ xử lý:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                  {selectedPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800"
                    >
                      <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RUNNING PROGRESS */}
          {step === 'processing' && (
            <div className="space-y-5 py-3 animate-fade-in">
              {/* Big Progress Bar & Counter */}
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-500">
                    {strings.batch_progress
                      .replace('{0}', String(currentIndex + 1))
                      .replace('{1}', String(items.length))
                      .replace('{2}', String(progressPercent))}
                  </span>
                  <span className="text-slate-400 font-mono">{progressPercent}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Per-item list with status indicators */}
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition ${
                      item.status === 'processing'
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700 border border-black/10">
                        <img
                          src={item.resultDataUrl || item.photo.dataUrl}
                          alt={item.photo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate max-w-[180px]">{item.photo.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Ảnh {idx + 1} / {items.length}
                        </p>
                      </div>
                    </div>

                    <div>
                      {item.status === 'pending' && (
                        <span className="px-2 py-1 rounded-lg bg-slate-700/60 text-slate-300 text-[10px] font-medium">
                          {strings.batch_status_pending}
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>
                            {strings.batch_status_processing}
                            {actionType === 'veo_video' && ` (${currentItemElapsedSec}s)`}
                          </span>
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{strings.batch_status_done}</span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{strings.batch_status_error}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED RESULTS SUMMARY */}
          {step === 'completed' && (
            <div className="space-y-4 animate-fade-in text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-extrabold text-base">Xử lý hàng loạt hoàn tất!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Đã hoàn thành {completedItems.length} / {items.length} tác phẩm thành công.
                </p>
              </div>

              {/* Grid of Results */}
              {actionType === 'veo_video' ? (
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                  {completedVideoItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/40 bg-black"
                    >
                      <video src={item.videoUrl} controls className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-800"
                    >
                      <img
                        src={item.resultDataUrl}
                        alt={item.photo.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-600 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <footer className="px-5 py-4 border-t border-black/5 dark:border-white/5 flex gap-2">
          {step === 'config' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
                }`}
              >
                {strings.batch_cancel}
              </button>
              <button
                type="button"
                onClick={handleStartProcessing}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>{strings.batch_start}</span>
              </button>
            </>
          )}

          {step === 'processing' && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 px-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400 font-bold text-xs"
            >
              Dừng xử lý
            </button>
          )}

          {step === 'completed' && (
            <>
              <button
                type="button"
                onClick={handleDownloadAll}
                className={`${actionType === 'veo_video' ? 'w-full' : 'flex-1'} py-3 px-4 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center justify-center gap-1.5`}
              >
                <Download className="w-4 h-4" />
                <span>{strings.batch_download_all}</span>
              </button>
              {actionType !== 'veo_video' && (
              <button
                type="button"
                onClick={handleSaveAllToGallery}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{strings.batch_save_all}</span>
              </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
