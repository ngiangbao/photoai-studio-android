import React, { useRef, useState } from 'react';
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
  Sliders,
  CheckSquare,
  Layers,
  Video,
  Check,
  X,
  User,
  Mountain,
  FolderHeart,
  GraduationCap,
  Folder,
  MoreVertical,
} from 'lucide-react';
import { CapturedPhoto, AppSettings, AppUpdateInfo, PhotoCategory } from '../types';
import { CameraView } from './CameraView';
import { AutoCategorizeModal } from './AutoCategorizeModal';

interface HomeScreenProps {
  photos: CapturedPhoto[];
  onSelectPhoto: (photo: CapturedPhoto) => void;
  onDeletePhoto: (id: string, e: React.MouseEvent) => void;
  onBatchDeletePhotos: (ids: string[]) => void;
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
  onOpenBatchModal: (selected: CapturedPhoto[]) => void;
  onOpenMediaModal: () => void;
  onPhotosUpdated?: (photos: CapturedPhoto[]) => void;
  onUpdatePhotoCategory?: (photoId: string, category: PhotoCategory) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  onBatchDeletePhotos,
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
  onOpenBatchModal,
  onOpenMediaModal,
  onPhotosUpdated,
  onUpdatePhotoCategory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = settings.theme === 'light';

  // Album Category Filter State
  const [activeCategory, setActiveCategory] = useState<PhotoCategory>('all');
  const [isAutoCategorizeOpen, setIsAutoCategorizeOpen] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Batch Selection State
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Category counts
  const categoryCounts: Record<PhotoCategory, number> = {
    all: photos.length,
    portraits: photos.filter((p) => p.category === 'portraits').length,
    landscapes: photos.filter((p) => p.category === 'landscapes').length,
    selfies: photos.filter((p) => p.category === 'selfies').length,
    events: photos.filter((p) => p.category === 'events').length,
    others: photos.filter((p) => p.category === 'others' || !p.category).length,
  };

  // Filter photos by category
  const filteredPhotos = photos.filter((photo) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'others') return photo.category === 'others' || !photo.category;
    return photo.category === activeCategory;
  });

  const toggleSelectPhoto = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredPhotos.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleExitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds([]);
  };

  const handleBatchEditClick = () => {
    const selected = photos.filter((p) => selectedIds.includes(p.id));
    if (selected.length === 0) return;
    onOpenBatchModal(selected);
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Xác nhận xóa ${selectedIds.length} ảnh đã chọn?`)) {
      onBatchDeletePhotos(selectedIds);
      setSelectedIds([]);
      setIsBatchMode(false);
    }
  };

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
    if (toolType === 'media') {
      onOpenMediaModal();
      return;
    }

    if (photos.length > 0) {
      onSelectPhoto(photos[0]);
    } else {
      fileInputRef.current?.click();
    }
  };

  const getCategoryIcon = (category?: PhotoCategory) => {
    switch (category) {
      case 'portraits':
        return <User className="w-3 h-3 text-indigo-400" />;
      case 'landscapes':
        return <Mountain className="w-3 h-3 text-emerald-400" />;
      case 'selfies':
        return <Camera className="w-3 h-3 text-pink-400" />;
      case 'events':
        return <GraduationCap className="w-3 h-3 text-amber-400" />;
      default:
        return <Folder className="w-3 h-3 text-slate-400" />;
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

  const albumTabs: { id: PhotoCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: strings.album_all || 'Tất cả', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'portraits', label: strings.album_portraits || 'Chân dung', icon: <User className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'landscapes', label: strings.album_landscapes || 'Phong cảnh', icon: <Mountain className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'selfies', label: strings.album_selfies || 'Selfie', icon: <Camera className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'events', label: strings.album_events || 'Sự kiện', icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'others', label: strings.album_others || 'Khác', icon: <Folder className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-28 transition-colors duration-200">
      {/* Top Navbar */}
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
              PhotoAI Pro Studio &bull; v{settings.appVersion}
            </p>
          </div>
        </div>

        {/* Quick actions top bar */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher Toggle */}
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
        {/* Quick Action Ribbons */}
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
                  Xử lý ảnh hàng loạt, Chân dung chuẩn Hàn, phân loại Album tự động và tạo Video AI sống động.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{strings.upload_photo}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenMediaModal}
                  className={`px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                  }`}
                  title="Tạo ảnh Nano Banana 2.1 hoặc Video Veo"
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Tạo Video AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tools Grid */}
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
                id: 'media',
                label: 'Tạo Video Veo',
                icon: <Video className="w-5 h-5 text-rose-500" />,
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

        {/* Recent Works Gallery with SMART ALBUMS & BATCH MODE */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
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

            {/* Top Toolbar Actions: AI Categorize + Batch Select */}
            <div className="flex items-center gap-1.5">
              {/* AI Smart Categorize Button */}
              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAutoCategorizeOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 hover:from-pink-500/20 hover:to-indigo-500/20 text-purple-500 border border-purple-500/30 transition shadow-sm"
                  title="Tự động phân loại ảnh vào các album bằng AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>{strings.ai_categorize_button || 'Phân loại AI'}</span>
                </button>
              )}

              {/* Batch Select Controls */}
              {photos.length > 0 && (
                <>
                  {isBatchMode ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10 transition"
                      >
                        {strings.batch_select_all}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:bg-black/5 transition"
                      >
                        {strings.batch_deselect_all}
                      </button>
                      <button
                        type="button"
                        onClick={handleExitBatchMode}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition"
                      >
                        {strings.batch_cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsBatchMode(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/30 transition shadow-sm"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{strings.batch_select}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* AI ALBUMS TABS BAR */}
          {photos.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none select-none">
              {albumTabs.map((tab) => {
                const count = categoryCounts[tab.id];
                const isActive = activeCategory === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-102'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isLight
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Photo Gallery Grid */}
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
          ) : filteredPhotos.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 transition ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 text-slate-600'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <FolderHeart className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs sm:text-sm max-w-xs mx-auto text-slate-400">
                Chưa có ảnh nào trong album <b>{albumTabs.find((t) => t.id === activeCategory)?.label}</b>.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 transition"
                >
                  Xem tất cả ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoCategorizeOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition"
                >
                  Phân loại bằng AI
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedIds.includes(photo.id);
                const isEditingCategory = editingCategoryId === photo.id;

                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (isBatchMode) {
                        toggleSelectPhoto(photo.id);
                      } else {
                        onSelectPhoto(photo);
                      }
                    }}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border shadow-md transition-all active:scale-95 hover:shadow-xl ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                        : isLight
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

                    {/* Batch Selection Checkbox Pill */}
                    {isBatchMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition shadow-md ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-black/60 border border-white/40 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}

                    {/* AI Album Badge (Top Left when not in Batch mode) */}
                    {!isBatchMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategoryId(isEditingCategory ? null : photo.id);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 transition shadow-sm"
                          title="Nhấp để đổi Album"
                        >
                          {getCategoryIcon(photo.category)}
                          <span>{getCategoryLabel(photo.category)}</span>
                        </button>

                        {/* Quick category changer dropdown */}
                        {isEditingCategory && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-7 left-0 z-30 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-white min-w-[130px] space-y-1 animate-fade-in"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 px-2 font-bold">
                              Chọn Album
                            </p>
                            {(['portraits', 'landscapes', 'selfies', 'events', 'others'] as PhotoCategory[]).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  if (onUpdatePhotoCategory) {
                                    onUpdatePhotoCategory(photo.id, cat);
                                  }
                                  setEditingCategoryId(null);
                                }}
                                className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left text-xs font-semibold transition ${
                                  photo.category === cat
                                    ? 'bg-indigo-600 text-white'
                                    : 'hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                {getCategoryIcon(cat)}
                                <span>{getCategoryLabel(cat)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer tag */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white truncate max-w-[110px]">
                        {photo.name}
                      </span>
                      {!isBatchMode && (
                        <span className="p-1 rounded-lg bg-indigo-600/90 text-white text-[10px] font-medium flex items-center gap-0.5 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" /> Chỉnh
                        </span>
                      )}
                    </div>

                    {/* Delete button (only when not in batch mode) */}
                    {!isBatchMode && (
                      <button
                        type="button"
                        onClick={(e) => onDeletePhoto(photo.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        title={strings.delete_photo}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FLOATING BATCH ACTION BAR (Pops up when in Batch mode with items selected) */}
      {isBatchMode && selectedIds.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 animate-slide-up">
          <div className="p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-xl text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold hidden sm:inline">ảnh đã chọn</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBatchDeleteClick}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                title="Xóa các ảnh đã chọn"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBatchEditClick}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Xử lý hàng loạt ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Categorize Modal */}
      <AutoCategorizeModal
        isOpen={isAutoCategorizeOpen}
        onClose={() => setIsAutoCategorizeOpen(false)}
        photos={photos}
        settings={settings}
        strings={strings}
        onPhotosUpdated={(updated) => {
          if (onPhotosUpdated) {
            onPhotosUpdated(updated);
          }
        }}
        onShowToast={(type, msg) => {
          if (type === 'error') {
            onError(msg);
          }
        }}
      />

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
