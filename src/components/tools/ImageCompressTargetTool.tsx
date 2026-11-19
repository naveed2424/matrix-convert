import React, { useState } from 'react';
import { UploadCloud, Download, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { compressImageToTargetSize, formatFileSize } from '../../services/advancedToolsEngine';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export const ImageCompressTargetTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState<number>(100);
  const [customKb, setCustomKb] = useState<string>('150');
  const [isCustom, setIsCustom] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'webp'>('jpg');
  const [allowDownscale, setAllowDownscale] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    convertedName: string;
    originalSize: number;
    convertedSize: number;
    dataUrl: string;
    previewUrl?: string;
    width?: number;
    height?: number;
    hitTarget: boolean;
    qualityUsed: number;
    note?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effectiveTargetKb = isCustom ? Math.max(5, Number(customKb) || 100) : targetKb;

  const handleSelect = (f: File) => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    setResult(null);
    setErrorMsg(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await compressImageToTargetSize(file, effectiveTargetKb, outputFormat, allowDownscale);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not compress this image file.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Target File Size Ceiling</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Note: Very small KB limits on high-resolution images may not always be achievable without noticeable loss.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[100, 200, 500].map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => {
                  setIsCustom(false);
                  setTargetKb(kb);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tabular-nums border cursor-pointer transition-colors ${
                  !isCustom && targetKb === kb
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                {kb} KB
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                isCustom
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              Custom KB
            </button>
            {isCustom && (
              <input
                type="number"
                min={5}
                max={20000}
                value={customKb}
                onChange={(e) => setCustomKb(e.target.value)}
                aria-label="Custom target kilobytes"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-blue-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Format:</span>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium"
            >
              <option value="jpg">JPG (Portal Universal)</option>
              <option value="webp">WebP (Smallest Footprint)</option>
            </select>
          </div>
          <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDownscale}
              onChange={(e) => setAllowDownscale(e.target.checked)}
              className="accent-blue-600"
            />
            <span>Allow proportional dimension reduction if quality floor is reached</span>
          </label>
        </div>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleSelect(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleSelect(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Select image to compress under target KB'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG, or WebP · 100% browser-local</p>
      </label>

      {file && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleCompress}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-bold text-sm cursor-pointer disabled:opacity-60"
          >
            {isRunning && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{isRunning ? `Targeting ${effectiveTargetKb} KB...` : `Compress Under ${effectiveTargetKb} KB`}</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {result && originalUrl && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              {result.hitTarget ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {formatFileSize(result.originalSize)} → {formatFileSize(result.convertedSize)} ({result.width}×{result.height}px · quality {result.qualityUsed}%)
              </span>
            </div>
            <a
              href={result.dataUrl}
              download={result.convertedName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {result.convertedName}</span>
            </a>
          </div>

          {result.note && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
              {result.note}
            </div>
          )}

          <BeforeAfterSlider
            originalUrl={originalUrl}
            processedUrl={result.previewUrl || result.dataUrl}
            originalSize={result.originalSize}
            processedSize={result.convertedSize}
          />
        </div>
      )}
    </div>
  );
};
