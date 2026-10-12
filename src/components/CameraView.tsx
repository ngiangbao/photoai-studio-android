import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  onCapture: (dataUrl: string, name: string) => void;
  isCapturing: boolean;
  strings: Record<string, string>;
  onError: (msg: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  isCapturing,
  strings,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      // Try fallback to any available camera if environment wasn't found
      if (mode === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setHasPermission(true);
          return;
        } catch (e2) {
          // ignore fallback error
        }
      }
      setHasPermission(false);
      const errMsg = err?.message || strings.camera_unavailable;
      setCameraError(errMsg);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureClick = () => {
    if (!videoRef.current || !hasPermission) {
      onError(strings.error_camera_not_ready);
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Flash visual effect
      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const now = new Date();
      const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 15);
      const filename = `IMG_${dateStr}.jpg`;

      onCapture(dataUrl, filename);
    } catch (err: any) {
      onError(strings.error_capture_failed.replace('{0}', err?.message || ''));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      {/* Live Video Preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasPermission ? 'opacity-100' : 'opacity-0'
        } ${facingMode === 'user' ? '-scale-x-100' : ''}`}
      />

      {/* Flash overlay */}
      {flash && <div className="absolute inset-0 bg-white opacity-80 z-20 pointer-events-none transition-opacity" />}

      {/* Grid overlay lines (camera viewfinder) */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/20">
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-white" />
          <div className="border-r border-white" />
          <div />
        </div>
      )}

      {/* Overlay when Camera permission not granted or error */}
      {!hasPermission && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center z-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="font-semibold text-slate-200">
              {cameraError ? strings.camera_unavailable : strings.camera_permission_rationale}
            </p>
            <p className="text-xs text-slate-400">
              Bạn có thể cấp quyền camera hoặc tải ảnh trực tiếp từ thiết bị.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow"
            >
              Thử lại Camera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {strings.upload_photo}
            </button>
          </div>
        </div>
      )}

      {/* Controls inside camera preview */}
      {hasPermission && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur border border-white/10 transition shadow"
            title={strings.switch_camera}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur border border-white/10 transition shadow"
            title={strings.upload_photo}
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      )}

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
