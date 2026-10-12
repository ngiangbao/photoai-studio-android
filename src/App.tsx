import React, { useState, useEffect } from 'react';
import { CapturedPhoto, AppSettings, Screen, ToastMessage, AppUpdateInfo, ThemeMode, PhotoCategory } from './types';
import { strings } from './localization/strings';
import { storageService } from './services/storageService';
import { aiClassifier } from './services/aiClassifier';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { UpdateModal } from './components/UpdateModal';
import { BatchProcessingModal } from './components/BatchProcessingModal';
import { MediaCreationModal } from './components/MediaCreationModal';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings());
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Update feature state
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  // Batch Processing state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [selectedBatchPhotos, setSelectedBatchPhotos] = useState<CapturedPhoto[]>([]);

  // Media Creation modal (Veo Video & Nano Banana 2.1)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);

  // Current language dictionary
  const currentLang = settings.language || 'vi';
  const t = strings[currentLang] || strings.vi;

  // Apply Theme to document root
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = settings.theme;

    if (effectiveTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [settings.theme]);

  // Load photos from storage & check for update on launch
  useEffect(() => {
    const loadedPhotos = storageService.loadPhotos();
    setPhotos(loadedPhotos);

    // Initial check for update
    checkForUpdates(false);
  }, []);

  const checkForUpdates = async (openModalOnFound: boolean = true) => {
    setIsCheckingUpdate(true);
    try {
      const res = await fetch(`/api/check-update?currentVersion=${encodeURIComponent(settings.appVersion)}`);
      const data = await res.json();

      setUpdateInfo(data);
      if (data.hasUpdate && openModalOnFound) {
        setIsUpdateModalOpen(true);
      } else if (!data.hasUpdate && openModalOnFound) {
        showToast('status', t.up_to_date);
      }
    } catch (e: any) {
      console.warn('Update check failed:', e);
      if (openModalOnFound) {
        showToast('error', 'Không thể kết nối máy chủ kiểm tra cập nhật.');
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleApplyUpdate = (newVersion: string) => {
    const updated = { ...settings, appVersion: newVersion };
    storageService.saveSettings(updated);
    setSettings(updated);
    setIsUpdateModalOpen(false);
    if (updateInfo) {
      setUpdateInfo({ ...updateInfo, hasUpdate: false, currentVersion: newVersion });
    }
    showToast('status', t.update_success.replace('{0}', newVersion));
  };

  const showToast = (type: 'status' | 'error', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCaptureNew = async (dataUrl: string, name: string) => {
    setIsCapturing(true);
    let newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dataUrl,
      name,
      timestamp: Date.now(),
    };

    // Auto-categorize newly captured photo with AI in background
    aiClassifier
      .categorizePhoto(newPhoto, settings.geminiApiKey)
      .then((catResult) => {
        const classified: CapturedPhoto = {
          ...newPhoto,
          category: catResult.category,
          aiTags: catResult.tags,
          analyzed: true,
        };
        const afterUpdate = storageService.updatePhoto(classified);
        setPhotos(afterUpdate);
      })
      .catch((err) => {
        console.warn('Background auto-categorize skipped:', err);
      });

    const updatedList = storageService.addPhoto(newPhoto);
    setPhotos(updatedList);
    setSelectedPhoto(newPhoto);
    setIsCapturing(false);
    showToast('status', t.status_photo_captured.replace('{0}', name));
    setCurrentScreen('editor');
  };

  const handleSelectPhoto = (photo: CapturedPhoto) => {
    setSelectedPhoto(photo);
    setCurrentScreen('editor');
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.removePhoto(id);
    setPhotos(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const handleBatchDeletePhotos = (ids: string[]) => {
    let currentPhotos = storageService.loadPhotos();
    const updated = currentPhotos.filter((p) => !ids.includes(p.id));
    storageService.savePhotos(updated);
    setPhotos(updated);
    showToast('status', `Đã xóa ${ids.length} ảnh.`);
  };

  const handlePhotosUpdated = (updatedPhotos: CapturedPhoto[]) => {
    const saved = storageService.updatePhotos(updatedPhotos);
    setPhotos(saved);
  };

  const handleUpdatePhotoCategory = (photoId: string, category: PhotoCategory) => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      const updated: CapturedPhoto = { ...photo, category };
      const saved = storageService.updatePhoto(updated);
      setPhotos(saved);
    }
  };

  const handleSaveResult = (dataUrl: string, name: string) => {
    const editedPhoto: CapturedPhoto = {
      id: `edited_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dataUrl,
      name,
      timestamp: Date.now(),
      category: selectedPhoto?.category || 'portraits',
      aiTags: selectedPhoto?.aiTags || ['đã chỉnh sửa'],
      analyzed: true,
    };
    const updated = storageService.addPhoto(editedPhoto);
    setPhotos(updated);
  };

  const handleBatchSaveToGallery = (newPhotos: CapturedPhoto[]) => {
    let currentPhotos = storageService.loadPhotos();
    const updated = [...newPhotos, ...currentPhotos];
    storageService.savePhotos(updated);
    setPhotos(updated);
  };

  const handleOpenBatchModal = (selected: CapturedPhoto[]) => {
    setSelectedBatchPhotos(selected);
    setIsBatchModalOpen(true);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'light' ? 'dark' : 'light';
    const updated = { ...settings, theme: nextTheme };
    handleSaveSettings(updated);
  };

  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'vi' ? 'en' : 'vi';
    const updated = { ...settings, language: nextLang as 'vi' | 'en' };
    handleSaveSettings(updated);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border text-sm backdrop-blur-md transition-all duration-300 animate-slide-up ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/90 border-indigo-500/40 text-slate-100'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.text}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Screen Router */}
      {currentScreen === 'home' && (
        <HomeScreen
          photos={photos}
          onSelectPhoto={handleSelectPhoto}
          onDeletePhoto={handleDeletePhoto}
          onBatchDeletePhotos={handleBatchDeletePhotos}
          onOpenSettings={() => setCurrentScreen('settings')}
          onCaptureNew={handleCaptureNew}
          isCapturing={isCapturing}
          strings={t}
          settings={settings}
          onToggleTheme={handleToggleTheme}
          onToggleLanguage={handleToggleLanguage}
          onError={(msg) => showToast('error', msg)}
          updateInfo={updateInfo}
          onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
          onOpenBatchModal={handleOpenBatchModal}
          onOpenMediaModal={() => setIsMediaModalOpen(true)}
          onPhotosUpdated={handlePhotosUpdated}
          onUpdatePhotoCategory={handleUpdatePhotoCategory}
        />
      )}

      {currentScreen === 'editor' && selectedPhoto && (
        <EditorScreen
          photo={selectedPhoto}
          onBack={() => setCurrentScreen('home')}
          onSaveResult={handleSaveResult}
          settings={settings}
          strings={t}
          onShowToast={showToast}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onBack={() => setCurrentScreen('home')}
          strings={t}
          onShowToast={showToast}
          onCheckForUpdate={() => checkForUpdates(true)}
          isCheckingUpdate={isCheckingUpdate}
        />
      )}

      {/* Update Modal */}
      {updateInfo && (
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          updateInfo={updateInfo}
          onApplyUpdate={handleApplyUpdate}
          strings={t}
        />
      )}

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedPhotos={selectedBatchPhotos}
        settings={settings}
        strings={t}
        onBatchSaveToGallery={handleBatchSaveToGallery}
        onShowToast={showToast}
      />

      {/* Media Creation Modal (Nano Banana 2.1 & Veo Video) */}
      <MediaCreationModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        settings={settings}
        strings={t}
        onAddPhoto={(photo) => {
          const updated = storageService.addPhoto(photo);
          setPhotos(updated);
        }}
        onShowToast={showToast}
      />
    </div>
  );
};
