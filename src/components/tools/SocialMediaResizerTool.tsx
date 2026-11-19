import React, { useState } from 'react';
import { UploadCloud, Download, RefreshCw } from 'lucide-react';
import { formatFileSize, resizeForSocialPreset } from '../../services/advancedToolsEngine';

interface SocialPreset {
  id: string;
  platform: string;
  label: string;
  width: number;
  height: number;
}

const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'ig-square', platform: 'Instagram', label: 'Instagram Square Post', width: 1080, height: 1080 },
  { id: 'ig-portrait', platform: 'Instagram', label: 'Instagram Portrait (4:5)', width: 1080, height: 1350 },
  { id: 'ig-story', platform: 'Instagram', label: 'Instagram Story / Reel (9:16)', width: 1080, height: 1920 },
  { id: 'yt-thumb', platform: 'YouTube', label: 'YouTube Thumbnail (16:9)', width: 1280, height: 720 },
  { id: 'li-post', platform: 'LinkedIn', label: 'LinkedIn Link / Post', width: 1200, height: 627 },
  { id: 'fb-share', platform: 'Facebook', label: 'Facebook Shared Post', width: 1200, height: 630 },
  { id: 'tt-vertical', platform: 'TikTok', label: 'TikTok Vertical Video Frame', width: 1080, height: 1920 },
  { id: 'pin-std', platform: 'Pinterest', label: 'Pinterest Standard Pin (2:3)', width: 1000, height: 1500 }
];

export const SocialMediaResizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ig-portrait');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<{
    convertedName: string;
    convertedSize: number;
    originalSize: number;
    dataUrl: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const preset = SOCIAL_PRESETS.find((p) => p.id === selectedPresetId) || SOCIAL_PRESETS[0];

  const handleResize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await resizeForSocialPreset(file, preset.width, preset.height, {
        fit: fitMode,
        backgroundColor: bgColor,
        format,
        quality: 92
      });
      setOutput(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resize image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Preset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SOCIAL_PRESETS.map((p) => {
          const active = p.id === selectedPresetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPresetId(p.id);
                setOutput(null);
              }}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'border-blue-600 dark:border-sky-400 bg-blue-50 dark:bg-sky-950/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-sky-400 block">
                {p.platform}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">{p.label}</span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 block">
                {p.width} × {p.height} px
              </span>
            </button>
          );
        })}
      </div>

      {/* Proportion Handling Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Aspect-Safe Fit Mode (Never Stretches)
          </label>
          <select
            value={fitMode}
            onChange={(e) => setFitMode(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value="cover">Center-Crop Cover (Fill Canvas)</option>
            <option value="contain">Contain &amp; Pad (Keep Full Photo)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value="jpg">JPG (Recommended Photos)</option>
            <option value="png">PNG (Lossless Graphics)</option>
            <option value="webp">WebP (Lightweight Web)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Padding Color (for Contain Mode)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              disabled={fitMode !== 'contain'}
              className="h-9 w-12 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <span className="font-mono text-slate-600 dark:text-slate-400">{bgColor}</span>
          </div>
        </div>
      </div>

      {/* Upload */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            setOutput(null);
          }
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              setOutput(null);
            }
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Drop photo to resize for ' + preset.platform}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Target: {preset.width}×{preset.height}px ({fitMode === 'cover' ? 'Aspect-safe center crop' : 'Zero crop padding'})
        </p>
      </label>

      {file && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleResize}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer disabled:opacity-60"
          >
            {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>Resize to {preset.width}×{preset.height}</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{errorMsg}</div>
      )}

      {output && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {output.convertedName} · {output.width}×{output.height}px · {formatFileSize(output.convertedSize)}
            </span>
            <a
              href={output.dataUrl}
              download={output.convertedName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </a>
          </div>
          <div className="max-h-96 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex justify-center p-4">
            <img src={output.dataUrl} alt={output.convertedName} className="max-h-80 w-auto object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
