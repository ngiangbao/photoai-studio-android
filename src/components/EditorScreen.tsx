import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Download,
  RotateCcw,
  RotateCw,
  Eye,
  Check,
  SplitSquareVertical,
  User,
  Sun,
  Mountain,
  Users,
  GraduationCap,
  Sparkle,
  Zap,
  Sliders,
  Palette,
  Crop,
  Layers,
  Wand2,
  RefreshCw,
  Maximize2,
  UserCheck,
  Flame,
} from 'lucide-react';
import {
  CapturedPhoto,
  AppSettings,
  EditorTab,
  ImageAdjustments,
  FilterPreset,
} from '../types';
import {
  STYLES_LIST,
  RETOUCH_PRESETS,
  AI_TOOLS_PRESETS,
  FILTER_PRESETS,
} from '../localization/strings';
import { imageEngine } from '../services/imageEngine';

interface EditorScreenProps {
  photo: CapturedPhoto;
  onBack: () => void;
  onSaveResult: (dataUrl: string, name: string) => void;
  settings: AppSettings;
  strings: Record<string, string>;
  onShowToast: (type: 'status' | 'error', message: string) => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  photo,
  onBack,
  onSaveResult,
  settings,
  strings,
  onShowToast,
}) => {
  const isLight = settings.theme === 'light';

  // Base and working image
  const [currentImage, setCurrentImage] = useState<string>(photo.dataUrl);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<string[]>([photo.dataUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active Tab in Studio ribbon
  const [activeTab, setActiveTab] = useState<EditorTab>('ai_style');

  // Styles & AI Selection
  const [selectedStyleKey, setSelectedStyleKey] = useState<string>('portrait');
  const [extraNote, setExtraNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // Retouch & AI Tools selection
  const [selectedRetouchKey, setSelectedRetouchKey] = useState<string>('smooth');
  const [selectedAiToolKey, setSelectedAiToolKey] = useState<string>('enhance');

  // Filter Selection
  const [selectedFilterId, setSelectedFilterId] = useState<string>('none');

  // Adjustments state
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0,
    sharpen: 0,
  });
  const [activeAdjustKey, setActiveAdjustKey] = useState<keyof ImageAdjustments>('brightness');

  // Compare & View controls
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [compareSplitMode, setCompareSplitMode] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Export resolution modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportQuality, setExportQuality] = useState<'hd' | '2k' | 'original'>('hd');

  const selectedFilter = FILTER_PRESETS.find((f) => f.id === selectedFilterId);

  // Push new state to history
  const pushToHistory = (newImageDataUrl: string) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newImageDataUrl);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setCurrentImage(newImageDataUrl);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentImage(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentImage(history[newIdx]);
    }
  };

  // Process with AI Engine
  const executeAiEdit = async (promptText: string) => {
    setIsProcessing(true);
    setProcessingStatus(strings.processing);

    try {
      // First bake current manual adjustments into clean base64
      const bakedImage = await imageEngine.renderBakedImage(currentImage, adjustments, selectedFilter);

      const response = await fetch('/api/gemini/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: bakedImage,
          customPrompt: promptText,
          extraInstruction: extraNote,
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errKey = data.errorCode || 'error_network_call_failed';
        const localized = strings[errKey] || data.error || strings.error_unknown;
        onShowToast('error', localized);
        return;
      }

      pushToHistory(data.imageDataUrl);
      // Reset temporary sliders since changes are baked into AI result
      setAdjustments({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        vignette: 0,
        sharpen: 0,
      });
      setSelectedFilterId('none');
      onShowToast('status', strings.status_processing_done);
    } catch (err: any) {
      console.error('AI Processing error:', err);
      onShowToast('error', strings.error_network_call_failed.replace('{0}', err?.message || ''));
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // AI Style Action
  const handleApplyStyle = () => {
    const styleObj = STYLES_LIST.find((s) => s.key === selectedStyleKey) || STYLES_LIST[0];
    executeAiEdit(styleObj.prompt);
  };

  // Retouch Action
  const handleApplyRetouch = () => {
    const preset = RETOUCH_PRESETS.find((r) => r.key === selectedRetouchKey) || RETOUCH_PRESETS[0];
    executeAiEdit(preset.prompt);
  };

  // AI Tools Action
  const handleApplyAiTool = () => {
    const tool = AI_TOOLS_PRESETS.find((t) => t.key === selectedAiToolKey) || AI_TOOLS_PRESETS[0];
    executeAiEdit(tool.prompt);
  };

  // Crop / Transform Actions
  const handleTransform = async (action: 'rotate90' | 'flipH' | 'crop_1_1' | 'crop_4_3' | 'crop_3_4' | 'crop_16_9' | 'crop_9_16') => {
    try {
      const transformed = await imageEngine.transformImage(currentImage, action);
      pushToHistory(transformed);
      onShowToast('status', 'Đã chuyển đổi hình ảnh.');
    } catch (e: any) {
      onShowToast('error', 'Chuyển đổi hình ảnh thất bại: ' + e?.message);
    }
  };

  // Final Export Action
  const handleDownload = async () => {
    try {
      let scale = 1.0;
      if (exportQuality === '2k') scale = 1.5;
      else if (exportQuality === 'hd') scale = 1.0;

      const finalBaked = await imageEngine.renderBakedImage(currentImage, adjustments, selectedFilter, scale);

      const stem = photo.name.replace(/\.[^/.]+$/, '');
      const filename = `${stem}_pro_${Date.now().toString().slice(-4)}.jpg`;

      const link = document.createElement('a');
      link.href = finalBaked;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onSaveResult(finalBaked, filename);
      setShowExportModal(false);
      onShowToast('status', strings.status_photo_saved.replace('{0}', filename));
    } catch (e: any) {
      onShowToast('error', strings.error_save_failed.replace('{0}', e?.message));
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen select-none transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Studio Bar */}
      <header
        className={`sticky top-0 z-30 px-3 py-2.5 border-b backdrop-blur-xl flex items-center justify-between transition-colors ${
          isLight
            ? 'bg-white/85 border-slate-200 shadow-sm'
            : 'bg-slate-950/85 border-slate-800 shadow-md'
        }`}
      >
        {/* Left: Back button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className={`p-2 rounded-xl transition ${
              isLight
                ? 'hover:bg-slate-100 text-slate-700'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title={strings.back_to_home}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight hidden sm:inline">
            {strings.editor_title}
          </span>
        </div>

        {/* Center: Undo / Redo & Compare */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-1.5 rounded-xl transition disabled:opacity-30 ${
              isLight ? 'hover:bg-white text-slate-800' : 'hover:bg-slate-800 text-white'
            }`}
            title={strings.undo}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 rounded-xl transition disabled:opacity-30 ${
              isLight ? 'hover:bg-white text-slate-800' : 'hover:bg-slate-800 text-white'
            }`}
            title={strings.redo}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Hold-to-compare peek button */}
          <button
            type="button"
            onMouseDown={() => setIsHoldingOriginal(true)}
            onMouseUp={() => setIsHoldingOriginal(false)}
            onTouchStart={() => setIsHoldingOriginal(true)}
            onTouchEnd={() => setIsHoldingOriginal(false)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition select-none ${
              isHoldingOriginal
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'hover:bg-white text-slate-700'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title={strings.hold_to_compare}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{strings.before_label}</span>
          </button>

          {/* Split Compare toggle */}
          <button
            type="button"
            onClick={() => setCompareSplitMode(!compareSplitMode)}
            className={`p-1.5 rounded-xl transition ${
              compareSplitMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'hover:bg-white text-slate-700'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title={strings.compare_mode}
          >
            <SplitSquareVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Export Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{strings.download_photo}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden bg-black/40">
        <div className="relative max-w-full max-h-[58vh] sm:max-h-[62vh] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/10 select-none">
          {/* Compare Split Slider View */}
          {compareSplitMode ? (
            <div className="relative w-full h-full">
              {/* Edited / Current Image */}
              <img
                src={currentImage}
                alt="Edited"
                style={{ filter: imageEngine.getCompositeCssFilter(adjustments, selectedFilter) }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Original Image (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={photo.dataUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Split Drag Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 -ml-0.5 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-[10px] font-black">
                  ⇄
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          ) : (
            /* Normal View / Hold to compare View */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={isHoldingOriginal ? photo.dataUrl : currentImage}
                alt="Studio Canvas"
                style={{
                  filter: isHoldingOriginal
                    ? 'none'
                    : imageEngine.getCompositeCssFilter(adjustments, selectedFilter),
                }}
                className="w-full h-full object-contain transition-all duration-150"
              />

              {isHoldingOriginal && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow">
                  Ảnh gốc (Original)
                </div>
              )}
            </div>
          )}

          {/* AI Processing Shimmer Glow Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-30 p-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-7 h-7 text-pink-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-extrabold text-sm text-white">
                  {processingStatus || strings.processing}
                </p>
                <p className="text-xs text-indigo-400 font-mono">
                  {settings.geminiModel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tool Shelf */}
      <div
        className={`border-t backdrop-blur-2xl transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-lg'
            : 'bg-slate-900/95 border-slate-800/80 shadow-2xl'
        }`}
      >
        {/* Sub-panel Content based on active tab */}
        <div className="p-3 max-w-2xl mx-auto">
          {/* TAB 1: AI STYLES */}
          {activeTab === 'ai_style' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {strings.style_label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {STYLES_LIST.find((s) => s.key === selectedStyleKey)?.tag}
                </span>
              </div>

              {/* Scrollable Style Cards Strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                {STYLES_LIST.map((style) => {
                  const isSelected = selectedStyleKey === style.key;
                  const nameKey = `style_${style.key}`;
                  const label = strings[nameKey] || style.key;

                  return (
                    <button
                      key={style.key}
                      type="button"
                      onClick={() => setSelectedStyleKey(style.key)}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-600/25 scale-[1.02]'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {style.tag && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 uppercase font-black">
                          {style.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Extra prompt note input & trigger button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  placeholder={strings.extra_note_placeholder}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none transition ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyStyle}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{strings.edit_with_ai}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PORTRAIT RETOUCH */}
          {activeTab === 'portrait' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {strings.tab_portrait} (Pro Retouch)
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                {RETOUCH_PRESETS.map((item) => {
                  const isSelected = selectedRetouchKey === item.key;
                  const labelKey = `retouch_${item.key}`;
                  const label = strings[labelKey] || item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedRetouchKey(item.key)}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-transparent shadow-md shadow-pink-600/25'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleApplyRetouch}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Áp dụng Chân dung AI ({strings[`retouch_${selectedRetouchKey}`]})</span>
              </button>
            </div>
          )}

          {/* TAB 3: AI TOOLS */}
          {activeTab === 'ai_tools' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-500 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5" />
                  {strings.tab_ai_tools}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AI_TOOLS_PRESETS.map((tool) => {
                  const isSelected = selectedAiToolKey === tool.key;
                  const labelKey = `ai_tool_${tool.key}`;
                  const descKey = `ai_tool_${tool.key}_desc`;
                  const label = strings[labelKey] || tool.key;
                  const desc = strings[descKey] || '';

                  return (
                    <button
                      key={tool.key}
                      type="button"
                      onClick={() => setSelectedAiToolKey(tool.key)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-600 text-white border-transparent shadow-md shadow-purple-600/25'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{label}</span>
                      <span className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{desc}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleApplyAiTool}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Kích hoạt Công cụ: {strings[`ai_tool_${selectedAiToolKey}`]}</span>
              </button>
            </div>
          )}

          {/* TAB 4: FILTERS */}
          {activeTab === 'filters' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  {strings.tab_filters}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFilterId('none')}
                  className="text-[11px] text-slate-400 hover:text-indigo-400"
                >
                  {strings.filter_none}
                </button>
              </div>

              {/* Circular Color Swatch Filter List */}
              <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                {FILTER_PRESETS.map((filter) => {
                  const isSelected = selectedFilterId === filter.id;
                  const label = filter.nameVi;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedFilterId(filter.id)}
                      className="flex flex-col items-center gap-1 flex-shrink-0 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl ${filter.thumbnailColor} border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20'
                            : 'border-transparent opacity-85 group-hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <span className="text-[11px] font-semibold text-center truncate max-w-[60px]">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ADJUST */}
          {activeTab === 'adjust' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-500 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  {strings[`adjust_${activeAdjustKey}`]} ({adjustments[activeAdjustKey]})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdjustments({
                      brightness: 0,
                      contrast: 0,
                      saturation: 0,
                      warmth: 0,
                      vignette: 0,
                      sharpen: 0,
                    })
                  }
                  className="text-[11px] text-slate-400 hover:text-indigo-400"
                >
                  {strings.reset_adjust}
                </button>
              </div>

              {/* Adjust Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={activeAdjustKey === 'vignette' || activeAdjustKey === 'sharpen' ? 0 : -100}
                  max={100}
                  value={adjustments[activeAdjustKey]}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, [activeAdjustKey]: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Parameter Selection Ribbon */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { key: 'brightness', label: strings.adjust_brightness },
                  { key: 'contrast', label: strings.adjust_contrast },
                  { key: 'saturation', label: strings.adjust_saturation },
                  { key: 'warmth', label: strings.adjust_warmth },
                  { key: 'vignette', label: strings.adjust_vignette },
                ].map((item) => {
                  const isSelected = activeAdjustKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveAdjustKey(item.key as keyof ImageAdjustments)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-transparent'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CROP & ROTATE */}
          {activeTab === 'crop' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <Crop className="w-3.5 h-3.5" />
                  {strings.tab_crop}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleTransform('rotate90')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {strings.rotate_90}
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('flipH')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {strings.flip_horizontal}
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('crop_1_1')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  1:1
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('crop_4_3')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  4:3
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('crop_3_4')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  3:4
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('crop_16_9')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => handleTransform('crop_9_16')}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  9:16
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Bottom Navigation Tabs */}
        <div
          className={`grid grid-cols-6 border-t px-2 py-2 max-w-2xl mx-auto transition-colors ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/80'
          }`}
        >
          {[
            { id: 'ai_style', label: strings.tab_ai_style, icon: <Sparkles className="w-4 h-4" /> },
            { id: 'portrait', label: strings.tab_portrait, icon: <UserCheck className="w-4 h-4" /> },
            { id: 'ai_tools', label: strings.tab_ai_tools, icon: <Wand2 className="w-4 h-4" /> },
            { id: 'filters', label: strings.tab_filters, icon: <Palette className="w-4 h-4" /> },
            { id: 'adjust', label: strings.tab_adjust, icon: <Sliders className="w-4 h-4" /> },
            { id: 'crop', label: strings.tab_crop, icon: <Crop className="w-4 h-4" /> },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as EditorTab)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
                  isCurrent
                    ? 'text-indigo-500 font-extrabold'
                    : isLight
                    ? 'text-slate-400 hover:text-slate-700 font-medium'
                    : 'text-slate-500 hover:text-slate-300 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isCurrent ? 'bg-indigo-500/10' : 'bg-transparent'
                  }`}
                >
                  {tab.icon}
                </div>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Quality Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-5 transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-500" />
                <span>{strings.export_options}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Chọn độ phân giải xuất ảnh phù hợp với nhu cầu của bạn.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'hd', label: strings.export_hd, desc: 'Tối ưu chia sẻ mạng xã hội nhanh' },
                { id: '2k', label: strings.export_2k, desc: 'Độ sắc nét vượt trội chuẩn Studio' },
                { id: 'original', label: strings.export_original, desc: 'Giữ nguyên độ phân giải nguồn' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExportQuality(opt.id as any)}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    exportQuality === opt.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                      : isLight
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </div>
                  {exportQuality === opt.id && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Xuất file ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
