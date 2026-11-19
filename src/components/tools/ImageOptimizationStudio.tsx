import React, { useState } from 'react';
import { UploadCloud, Download, Archive, RefreshCw, Sliders, Trash2 } from 'lucide-react';
import { formatFileSize, optimizeStudioImage } from '../../services/advancedToolsEngine';
import { createZipBundle } from '../../services/converterEngine';
import { ConvertedFile } from '../../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface StudioQueueItem {
  id: string;
  file: File;
  originalUrl: string;
}

export const ImageOptimizationStudio: React.FC = () => {
  const [queue, setQueue] = useState<StudioQueueItem[]>([]);
  const [format, setFormat] = useState<'webp' | 'avif' | 'jpg' | 'png'>('webp');
  const [quality, setQuality] = useState(84);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [renamePrefix, setRenamePrefix] = useState('');
  const [stripMetadata, setStripMetadata] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [activeCompareIdx, setActiveCompareIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const added: StudioQueueItem[] = Array.from(list).map((file, idx) => ({
      id: `${file.name}-${Date.now()}-${idx}`,
      file,
      originalUrl: URL.createObjectURL(file)
    }));
    setQueue((prev) => [...prev, ...added]);
    setResults([]);
    setErrorMsg(null);
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((q) => q.id === id);
      if (target) URL.revokeObjectURL(target.originalUrl);
      return prev.filter((q) => q.id !== id);
    });
  };

  const handleOptimizeAll = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    const out: ConvertedFile[] = [];

    try {
      for (let i = 0; i < queue.length; i++) {
        const res = await optimizeStudioImage(queue[i].file, {
          format,
          quality,
          maxWidth: maxWidth > 0 ? maxWidth : undefined,
          renamePrefix: renamePrefix.trim() || undefined,
          indexSuffix: queue.length > 1 ? `-${i + 1}` : ''
        });
        out.push(res);
      }
      setResults(out);
      setActiveCompareIdx(0);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not process one or more files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const blob = await createZipBundle(results);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimage-optimized-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalOrig = results.reduce((s, r) => s + r.originalSize, 0);
  const totalOut = results.reduce((s, r) => s + r.convertedSize, 0);
  const savedPct = totalOrig > 0 ? Math.round(((totalOrig - totalOut) / totalOrig) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Studio Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="webp">WebP (Recommended Web)</option>
            <option value="avif">AVIF (Modern High Efficiency)</option>
            <option value="jpg">JPG (Universal Photo)</option>
            <option value="png">PNG (Lossless Bitmap)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Max Width (Aspect-Safe)
          </label>
          <select
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value={0}>Keep Original Dimensions</option>
            <option value={2560}>Max 2560px wide</option>
            <option value={1920}>Max 1920px wide (Full HD)</option>
            <option value={1280}>Max 1280px wide (Blog / Hero)</option>
            <option value={800}>Max 800px wide (Thumbnails)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
            <span>Quality</span>
            <span className="font-mono text-blue-600 dark:text-sky-400 tabular-nums">{quality}%</span>
          </label>
          <input
            type="range"
            min={35}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={format === 'png'}
            className="w-full accent-blue-600 dark:accent-sky-400"
          />
          {format === 'png' && (
            <span className="text-[10px] text-slate-500">PNG is lossless (slider ignored)</span>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Batch Filename Prefix (Optional)
          </label>
          <input
            type="text"
            value={renamePrefix}
            onChange={(e) => setRenamePrefix(e.target.value)}
            placeholder="e.g. product-2026"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={stripMetadata}
            onChange={(e) => setStripMetadata(e.target.checked)}
            className="accent-blue-600"
          />
          <span>Strip EXIF camera &amp; GPS headers cleanly via local canvas export (enabled automatically)</span>
        </label>
      </div>

      {/* Dropzone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer transition-colors"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Drop images into Image Optimization Studio
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Originals remain untouched in your session until you download
        </p>
      </label>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {queue.length} file(s) staged
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  queue.forEach((q) => URL.revokeObjectURL(q.originalUrl));
                  setQueue([]);
                  setResults([]);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleOptimizeAll}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
                <span>{isProcessing ? 'Optimizing Batch...' : 'Optimize Batch Now'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={item.originalUrl} alt={item.file.name} className="w-10 h-10 rounded object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.file.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 tabular-nums">{formatFileSize(item.file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results & Live Comparison */}
      {results.length > 0 && (
        <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20">
            <div className="text-xs text-slate-800 dark:text-slate-200 tabular-nums">
              <strong>Total Batch Result:</strong> {formatFileSize(totalOrig)} →{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">{formatFileSize(totalOut)}</strong>{' '}
              ({savedPct >= 0 ? `-${savedPct}% saved` : `+${Math.abs(savedPct)}%`})
            </div>
            <button
              type="button"
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Download All (.ZIP)</span>
            </button>
          </div>

          {/* Interactive Comparison for Selected Result */}
          {queue[activeCompareIdx] && results[activeCompareIdx] && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Visual Inspector: {results[activeCompareIdx].convertedName} ({results[activeCompareIdx].width}×
                  {results[activeCompareIdx].height}px)
                </span>
                {results.length > 1 && (
                  <select
                    value={activeCompareIdx}
                    onChange={(e) => setActiveCompareIdx(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  >
                    {results.map((r, i) => (
                      <option key={r.id} value={i}>
                        {r.convertedName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <BeforeAfterSlider
                originalUrl={queue[activeCompareIdx].originalUrl}
                processedUrl={results[activeCompareIdx].previewUrl || results[activeCompareIdx].dataUrl}
                originalSize={results[activeCompareIdx].originalSize}
                processedSize={results[activeCompareIdx].convertedSize}
              />
            </div>
          )}

          {/* Individual File Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.convertedName}</p>
                  <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {formatFileSize(r.originalSize)} → {formatFileSize(r.convertedSize)} · {r.width}×{r.height}px
                  </p>
                  {r.note && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{r.note}</p>}
                </div>
                <a
                  href={r.dataUrl}
                  download={r.convertedName}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
