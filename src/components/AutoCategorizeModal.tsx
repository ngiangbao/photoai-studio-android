import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Tag,
  Loader2,
  FolderHeart,
  User,
  Mountain,
  Camera,
  GraduationCap,
  Folder,
} from 'lucide-react';
import { CapturedPhoto, AppSettings, PhotoCategory } from '../types';
import { aiClassifier } from '../services/aiClassifier';

interface AutoCategorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: CapturedPhoto[];
  settings: AppSettings;
  strings: Record<string, string>;
  onPhotosUpdated: (updatedPhotos: CapturedPhoto[]) => void;
  onShowToast: (type: 'status' | 'error', message: string) => void;
}

export const AutoCategorizeModal: React.FC<AutoCategorizeModalProps> = ({
  isOpen,
  onClose,
  photos,
  settings,
  strings,
  onPhotosUpdated,
  onShowToast,
}) => {
  const isLight = settings.theme === 'light';
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [analyzedList, setAnalyzedList] = useState<CapturedPhoto[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsCompleted(false);
      setIsRunning(false);
      setCurrentIndex(0);
      setAnalyzedList([]);
      isCancelledRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCategorizing = async () => {
    if (photos.length === 0) {
      onShowToast('error', 'Chưa có ảnh nào để phân loại.');
      return;
    }

    setIsRunning(true);
    setIsCompleted(false);
    isCancelledRef.current = false;
    const workingList: CapturedPhoto[] = [...photos];

    for (let i = 0; i < workingList.length; i++) {
      if (isCancelledRef.current) break;
      setCurrentIndex(i);

      try {
        const result = await aiClassifier.categorizePhoto(
          workingList[i],
          settings.geminiApiKey,
        );
        workingList[i] = {
          ...workingList[i],
          category: result.category,
          aiTags: result.tags,
          analyzed: true,
        };
        setAnalyzedList([...workingList.slice(0, i + 1)]);
      } catch (err) {
        console.warn('Categorize error for photo', workingList[i].name, err);
      }
    }

    setIsRunning(false);
    setIsCompleted(true);
    onPhotosUpdated(workingList);
    onShowToast('status', strings.ai_categorize_done.replace('{0}', String(workingList.length)));
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
    onClose();
  };

  const progressPercent = photos.length > 0 ? Math.round(((currentIndex + (isRunning ? 0.5 : 1)) / photos.length) * 100) : 0;

  // Category counts breakdown
  const categoryBreakdown: Record<PhotoCategory, number> = {
    all: analyzedList.length,
    portraits: analyzedList.filter((p) => p.category === 'portraits').length,
    landscapes: analyzedList.filter((p) => p.category === 'landscapes').length,
    selfies: analyzedList.filter((p) => p.category === 'selfies').length,
    events: analyzedList.filter((p) => p.category === 'events').length,
    others: analyzedList.filter((p) => p.category === 'others' || !p.category).length,
  };

  const getCategoryIcon = (category?: PhotoCategory) => {
    switch (category) {
      case 'portraits':
        return <User className="w-3.5 h-3.5 text-indigo-400" />;
      case 'landscapes':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'selfies':
        return <Camera className="w-3.5 h-3.5 text-pink-400" />;
      case 'events':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category?: PhotoCategory) => {
    switch (category) {
      case 'portraits':
        return strings.album_portraits || 'Chân dung';
      case 'landscapes':
        return strings.album_landscapes || 'Phong cảnh';
      case 'selfies':
        return strings.album_selfies || 'Selfie';
      case 'events':
        return strings.album_events || 'Sự kiện';
      default:
        return strings.album_others || 'Khác';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-lg flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                {strings.ai_categorize_button || 'Phân loại Album bằng AI'}
              </h3>
              <p className="text-[11px] text-purple-500 dark:text-purple-400 font-semibold">
                Tự động nhận diện Chân dung, Phong cảnh, Selfie & Sự kiện
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

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!isRunning && !isCompleted && (
            <div className="space-y-4 text-center py-2">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-inner ${
                  isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400'
                }`}
              >
                <FolderHeart className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-bold text-sm">
                  Phân tích thị giác AI thông minh
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hệ thống AI sẽ quét toàn bộ {photos.length} ảnh trong thư viện của bạn, phân tích bối cảnh, khuôn mặt và bố cục để phân chia tự động vào các album riêng biệt.
                </p>
              </div>

              {/* Supported Albums preview */}
              <div className="grid grid-cols-2 gap-2 text-left pt-2">
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{strings.album_portraits}</p>
                    <p className="text-[10px] text-slate-400 font-normal">Chụp chân dung, mẫu, thời trang</p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <Mountain className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{strings.album_landscapes}</p>
                    <p className="text-[10px] text-slate-400 font-normal">Thiên nhiên, núi rừng, biển, thành phố</p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <Camera className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{strings.album_selfies}</p>
                    <p className="text-[10px] text-slate-400 font-normal">Ảnh tự sướng cận mặt, camera trước</p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{strings.album_events}</p>
                    <p className="text-[10px] text-slate-400 font-normal">Kỷ yếu, tiệc tùng, lễ hội, tập thể</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Running State */}
          {isRunning && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-500 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      Đang phân loại: {currentIndex + 1} / {photos.length}
                    </span>
                  </span>
                  <span className="text-slate-400 font-mono">{progressPercent}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Real-time classified photos feed */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {analyzedList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-slide-up ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold truncate max-w-[150px]">{item.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          {item.aiTags?.slice(0, 2).map((tg, idx) => (
                            <span key={idx} className="bg-black/10 px-1 py-0.2 rounded">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[11px] flex-shrink-0">
                      {getCategoryIcon(item.category)}
                      <span>{getCategoryLabel(item.category)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="space-y-4 py-2 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base">
                  Phân loại hoàn tất!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toàn bộ {photos.length} ảnh đã được tổ chức tự động vào các album thông minh.
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-indigo-50/60 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
                      <User className="w-3.5 h-3.5" />
                      <span>{strings.album_portraits}</span>
                    </span>
                    <span className="text-sm font-black text-indigo-500">
                      {categoryBreakdown.portraits}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-emerald-50/60 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                      <Mountain className="w-3.5 h-3.5" />
                      <span>{strings.album_landscapes}</span>
                    </span>
                    <span className="text-sm font-black text-emerald-500">
                      {categoryBreakdown.landscapes}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-pink-50/60 border-pink-100' : 'bg-pink-950/20 border-pink-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-pink-400">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{strings.album_selfies}</span>
                    </span>
                    <span className="text-sm font-black text-pink-500">
                      {categoryBreakdown.selfies}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-amber-50/60 border-amber-100' : 'bg-amber-950/20 border-amber-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{strings.album_events}</span>
                    </span>
                    <span className="text-sm font-black text-amber-500">
                      {categoryBreakdown.events}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-4 border-t border-black/5 dark:border-white/5 flex gap-2">
          {!isRunning && !isCompleted && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-black/5 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleStartCategorizing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu phân loại AI</span>
              </button>
            </>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition"
            >
              Dừng quá trình phân loại
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              Xem Thư viện theo Album ngay
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
