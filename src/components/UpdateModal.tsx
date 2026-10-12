import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Download, X, RefreshCw } from 'lucide-react';
import { AppUpdateInfo } from '../types';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: AppUpdateInfo;
  onApplyUpdate: (newVersion: string) => void;
  strings: Record<string, string>;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onApplyUpdate,
  strings,
}) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [updatePhase, setUpdatePhase] = useState<'idle' | 'downloading' | 'installing' | 'done'>('idle');

  if (!isOpen) return null;

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setUpdatePhase('downloading');
    setProgress(0);

    // Simulate smooth download progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setUpdatePhase('installing');

          setTimeout(() => {
            setProgress(100);
            setUpdatePhase('done');
            setTimeout(() => {
              onApplyUpdate(updateInfo.latestVersion);
              setIsUpdating(false);
            }, 800);
          }, 1200);

          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 8;
      });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 transition-all transform scale-100">
        {/* Decorative Header Banner */}
        <div className="relative h-36 bg-gradient-to-tr from-indigo-700 via-purple-600 to-pink-500 p-6 flex flex-col justify-end overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-indigo-900/30 blur-lg pointer-events-none" />

          {!isUpdating && !updateInfo.mandatory && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 transition backdrop-blur-sm"
              title={strings.update_later}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{strings.update_available_title}</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl font-black text-white tracking-tight">
                PhotoAI Studio
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono text-xs font-semibold">
                v{updateInfo.latestVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Version comparison row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
            <div>
              <p className="text-slate-400">{strings.current_version}</p>
              <p className="font-mono font-medium text-slate-200">v{updateInfo.currentVersion}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <div className="text-right">
              <p className="text-indigo-400 font-semibold">{strings.latest_version}</p>
              <p className="font-mono font-bold text-white">v{updateInfo.latestVersion}</p>
            </div>
          </div>

          {/* Release Notes */}
          {!isUpdating ? (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {strings.release_notes}
              </h4>
              <ul className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs text-slate-300 leading-relaxed">
                {updateInfo.releaseNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* Progress State during update */
            <div className="py-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                {updatePhase === 'downloading' && (
                  <Download className="w-8 h-8 animate-bounce text-indigo-400" />
                )}
                {updatePhase === 'installing' && (
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                )}
                {updatePhase === 'done' && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 scale-110 transition-transform" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-sm text-slate-100">
                  {updatePhase === 'downloading' && strings.update_downloading}
                  {updatePhase === 'installing' && strings.update_installing}
                  {updatePhase === 'done' && 'Cài đặt thành công!'}
                </p>
                <p className="text-xs font-mono text-indigo-400 font-medium">
                  {progress}%
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isUpdating && (
            <div className="flex gap-2.5 pt-1">
              {!updateInfo.mandatory && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm transition text-center"
                >
                  {strings.update_later}
                </button>
              )}
              <button
                type="button"
                onClick={handleStartUpdate}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>{strings.update_now}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
