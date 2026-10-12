import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Key,
  Cpu,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Globe,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  ExternalLink,
  Zap,
  Info,
} from 'lucide-react';
import { AppSettings, ThemeMode } from '../types';
import { api } from '../services/api';

interface SettingsScreenProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onBack: () => void;
  strings: Record<string, string>;
  onShowToast: (type: 'status' | 'error', message: string) => void;
  onCheckForUpdate: () => void;
  isCheckingUpdate: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSaveSettings,
  onBack,
  strings,
  onShowToast,
  onCheckForUpdate,
  isCheckingUpdate,
}) => {
  const isLight = settings.theme === 'light';

  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [model, setModel] = useState(settings.geminiModel);
  const [theme, setTheme] = useState<ThemeMode>(settings.theme);
  const [language, setLanguage] = useState<'vi' | 'en'>(settings.language);
  const [showKey, setShowKey] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);

  useEffect(() => {
    api
      .getConfig()
      .then((data) => {
        if (data.hasServerApiKey) {
          setHasServerKey(true);
        }
      })
      .catch((err) => console.warn('Config fetch error:', err));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: apiKey.trim(),
      geminiModel: model.trim() || 'gemini-2.5-flash-image',
      language,
      theme,
      appVersion: settings.appVersion,
      autoCheckUpdate: settings.autoCheckUpdate,
    });
    onShowToast('status', strings.status_settings_saved);
    onBack();
  };

  const handleSimulateVersionBump = async () => {
    try {
      const res = await fetch('/api/simulate-bump-version', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onShowToast('status', `Đã tạo bản cập nhật mới: v${data.newLatestVersion}`);
        onCheckForUpdate();
      }
    } catch (e: any) {
      onShowToast('error', 'Lỗi giả lập cập nhật: ' + e?.message);
    }
  };

  const MODEL_OPTIONS = ['gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image'];

  return (
    <div
      className={`flex flex-col min-h-screen pb-20 transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl flex items-center justify-between transition-colors ${
          isLight ? 'bg-white/85 border-slate-200 shadow-sm' : 'bg-slate-950/85 border-slate-800 shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`p-2 -ml-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title={strings.back_to_home}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-extrabold text-base tracking-tight">{strings.settings_title}</h1>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4">
        <form onSubmit={handleSave} className="space-y-6">
          {/* VIBE CODING DISCLAIMER */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs leading-relaxed ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
            }`}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <span>{strings.vibe_coding_notice}</span>
          </div>

          {/* THEME SELECTION SECTION */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{strings.theme_label}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'dark',
                  label: strings.theme_dark,
                  icon: <Moon className="w-4 h-4 text-purple-400" />,
                  desc: 'Studio Dark',
                },
                {
                  id: 'light',
                  label: strings.theme_light,
                  icon: <Sun className="w-4 h-4 text-amber-500" />,
                  desc: 'Clean Light',
                },
                {
                  id: 'system',
                  label: strings.theme_system,
                  icon: <Laptop className="w-4 h-4 text-indigo-400" />,
                  desc: 'Tự động',
                },
              ].map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as ThemeMode)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 shadow-sm'
                        : isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">{item.icon}</div>
                    <span className="text-xs font-bold">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* APPLICATION UPDATES SECTION */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>{strings.updates_section}</span>
            </label>
            <div
              className={`p-4 rounded-2xl border transition space-y-3 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">{strings.current_version}: </span>
                  <span className="font-mono font-bold">v{settings.appVersion}</span>
                </div>
                {!api.isNative() && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Auto Update
                  </span>
                )}
              </div>

              {api.isNative() ? (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Đây là bản cài đặt (APK) - để cập nhật, cài đè bằng file APK phiên bản mới hơn
                  từ trang Releases của dự án.
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCheckForUpdate}
                    disabled={isCheckingUpdate}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'Đang kiểm tra…' : strings.check_for_updates}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateVersionBump}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title="Tạo giả lập phiên bản mới để test tính năng update"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tạo bản mới</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI CREDENTIALS HINT */}
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
              isLight
                ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
                : 'bg-indigo-950/30 border-indigo-500/20 text-indigo-200'
            }`}
          >
            <p>{strings.settings_hint}</p>
            {hasServerKey && (
              <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs pt-1 border-t border-indigo-500/10">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{strings.server_key_active}</span>
              </div>
            )}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline font-bold"
            >
              <span>ai.google.dev</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* GEMINI API KEY */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              <span>{strings.gemini_api_key_label}</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasServerKey ? '(Dùng key hệ thống sẵn có)' : 'AIzaSy...'}
                className={`w-full rounded-xl px-4 py-3 text-sm font-mono outline-none border transition pr-12 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* GEMINI MODEL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>{strings.gemini_model_label}</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-mono outline-none border transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500'
              }`}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition ${
                    model === m
                      ? 'bg-indigo-600 text-white border-transparent'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{strings.language_label}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                  language === 'vi'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                  language === 'en'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            <span>{strings.save}</span>
          </button>
        </form>
      </main>
    </div>
  );
};
