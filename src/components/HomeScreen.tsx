import React, { useRef } from 'react';
import {
  Camera,
  Settings,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Globe,
  Sun,
  Moon,
  Zap,
  UserCheck,
  Palette,
  Eraser,
  Sliders,
  ChevronRight,
  Download,
} from 'lucide-react';
import { CapturedPhoto, AppSettings, AppUpdateInfo, ThemeMode } from '../types';
import { CameraView } from './CameraView';

interface HomeScreenProps {
  photos: CapturedPhoto[];
  onSelectPhoto: (photo: CapturedPhoto) => void;
  onDeletePhoto: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onCaptureNew: (dataUrl: string, name: string) => void;
  isCapturing: boolean;
  strings: Record<string, string>;
  settings: AppSettings;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onError: (msg: string) => void;
  updateInfo?: AppUpdateInfo | null;
  onOpenUpdateModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  onOpenSettings,
  onCaptureNew,
  isCapturing,
  strings,
  settings,
  onToggleTheme,
  onToggleLanguage,
  onError,
  updateInfo,
  onOpenUpdateModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = settings.theme === 'light';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCaptureNew(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleQuickToolClick = (toolType: string) => {
    if (photos.length > 0) {
      // Pick the most recent photo
      onSelectPhoto(photos[0]);
    } else {
      // Prompt user to upload/capture first
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 transition-colors duration-200">
      {/* Top Navbar (Xingtu / Hypic Glass Style) */}
      <header
        className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl flex items-center justify-between transition-colors ${
          isLight
            ? 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-950/85 border-slate-800/80 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight leading-tight">
                {strings.app_name}
              </h1>
              {updateInfo?.hasUpdate && (
                <button
                  type="button"
                  onClick={onOpenUpdateModal}
                  className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white flex items-center gap-0.5 shadow-sm animate-pulse"
                  title="Có bản cập nhật mới!"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Update</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium">
              Xingtu & Hypic Studio &bull; v{settings.appVersion}
            </p>
          </div>
        </div>

        {/* Quick actions top bar */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400'
            }`}
            title={isLight ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Đổi ngôn ngữ / Change language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>{settings.language.toUpperCase()}</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`p-2 rounded-xl transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
            title={strings.settings_title}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-6">
        {/* Xingtu / Hypic Quick Action Ribbons */}
        <section className="space-y-3">
          {/* Main Hero Card */}
          <div
            className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
              isLight
                ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-100/80 shadow-indigo-100/50'
                : 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-900/40 shadow-black/40'
            }`}
          >
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                  Pro AI Engine
                </span>
                <h2 className="text-xl font-black tracking-tight">
                  {strings.app_subtitle}
                </h2>
                <p
                  className={`text-xs max-w-sm leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Chân dung chuẩn Hàn, làm nét HD, xóa vật thể và các bộ lọc màu điện ảnh thời thượng.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{strings.upload_photo}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tools Grid (Like Xingtu / Hypic Feature Icons) */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {[
              {
                id: 'edit',
                label: strings.quick_action_edit,
                icon: <Sliders className="w-5 h-5 text-indigo-500" />,
                bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
              },
              {
                id: 'enhance',
                label: strings.quick_action_enhance,
                icon: <Zap className="w-5 h-5 text-purple-500" />,
                bg: 'bg-purple-500/10 hover:bg-purple-500/20',
              },
              {
                id: 'portrait',
                label: strings.quick_action_portrait,
                icon: <UserCheck className="w-5 h-5 text-pink-500" />,
                bg: 'bg-pink-500/10 hover:bg-pink-500/20',
              },
              {
                id: 'filter',
                label: strings.quick_action_filter,
                icon: <Palette className="w-5 h-5 text-amber-500" />,
                bg: 'bg-amber-500/10 hover:bg-amber-500/20',
              },
              {
                id: 'erase',
                label: strings.quick_action_erase,
                icon: <Eraser className="w-5 h-5 text-rose-500" />,
                bg: 'bg-rose-500/10 hover:bg-rose-500/20',
              },
            ].map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleQuickToolClick(tool.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 ${
                  isLight
                    ? 'bg-white border-slate-200/80 shadow-sm hover:border-indigo-300'
                    : 'bg-slate-900/70 border-slate-800 shadow-md hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition ${tool.bg}`}>
                  {tool.icon}
                </div>
                <span className="text-[11px] font-semibold text-center truncate max-w-full">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Live Camera Viewfinder Card */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-500" />
              <span>{strings.capture_new_photo}</span>
            </h3>
          </div>

          <CameraView
            onCapture={onCaptureNew}
            isCapturing={isCapturing}
            strings={strings}
            onError={onError}
          />

          {/* Shutter Button Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video && video.srcObject) {
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth || 1280;
                  canvas.height = video.videoHeight || 960;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    const now = new Date();
                    const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 15);
                    onCaptureNew(canvas.toDataURL('image/jpeg', 0.95), `IMG_${dateStr}.jpg`);
                    return;
                  }
                }
                fileInputRef.current?.click();
              }}
              disabled={isCapturing}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isCapturing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{strings.capturing}</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>{strings.capture_new_photo}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`py-3.5 px-4 rounded-2xl font-semibold border flex items-center gap-2 transition shadow active:scale-95 ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
              title={strings.upload_photo}
            >
              <Upload className="w-5 h-5 text-indigo-500" />
              <span className="hidden sm:inline">{strings.upload_photo}</span>
            </button>
          </div>
        </section>

        {/* Recent Works Gallery (Xingtu / Hypic style) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-500" />
              <span>{strings.captured_photos_title}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {photos.length}
              </span>
            </h3>
          </div>

          {photos.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 transition ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 text-slate-600'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                  isLight ? 'bg-slate-200/80 text-slate-400' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm max-w-xs mx-auto">
                {strings.no_photos_yet}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{strings.upload_photo}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhoto(photo)}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border shadow-md transition-all active:scale-95 hover:shadow-xl ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 hover:border-indigo-400'
                      : 'bg-slate-900 border-slate-800/80 hover:border-indigo-500'
                  }`}
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Frosted gradient footer overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white truncate max-w-[110px]">
                      {photo.name}
                    </span>
                    <span className="p-1 rounded-lg bg-indigo-600/90 text-white text-[10px] font-medium flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" /> Chỉnh
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => onDeletePhoto(photo.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    title={strings.delete_photo}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
