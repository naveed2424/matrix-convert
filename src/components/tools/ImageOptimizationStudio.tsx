import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Download, Archive, RefreshCw, Sliders } from 'lucide-react';
import { formatFileSize, optimizeStudioImage } from '../../services/advancedToolsEngine';
import { createZipBundle } from '../../services/converterEngine';
import { ConvertedFile } from '../../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BatchQueuePanel } from '../BatchQueuePanel';
import {
  BatchQueueItem,
  BatchWorkerPool,
  createBatchQueueItem,
  getRecommendedConcurrency,
  revokeConvertedUrls
} from '../../services/batchWorkerPool';

interface ImageOptimizationStudioProps {
  initialFiles?: File[];
  onConsumeInitialFiles?: () => void;
}

export const ImageOptimizationStudio: React.FC<ImageOptimizationStudioProps> = ({
  initialFiles,
  onConsumeInitialFiles
}) => {
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [concurrency, setConcurrency] = useState<number>(() => getRecommendedConcurrency());
  const [format, setFormat] = useState<'webp' | 'avif' | 'jpg' | 'png'>('webp');
  const [quality, setQuality] = useState(84);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [renamePrefix, setRenamePrefix] = useState('');
  const [stripMetadata, setStripMetadata] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeCompareIdx, setActiveCompareIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const poolRef = useRef<BatchWorkerPool | null>(null);
  const queueRef = useRef<BatchQueueItem[]>([]);
  queueRef.current = queue;

  const originalUrlsRef = useRef<Map<string, string>>(new Map());

  const seedItems = (fileList: File[]) => {
    const added = fileList.map((file, idx) => {
      const item = createBatchQueueItem(file, idx);
      originalUrlsRef.current.set(item.id, URL.createObjectURL(file));
      return item;
    });
    setQueue((prev) => [...prev, ...added]);
    setErrorMsg(null);
  };

  useEffect(() => {
    poolRef.current = new BatchWorkerPool();
    if (initialFiles && initialFiles.length > 0) {
      seedItems(initialFiles);
      onConsumeInitialFiles?.();
    }
    return () => {
      poolRef.current?.terminateAll();
      originalUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      originalUrlsRef.current.clear();
      queueRef.current.forEach((q) => revokeConvertedUrls(q.results));
    };
  }, []);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    seedItems(Array.from(list));
  };

  const handleRemove = (id: string) => {
    const origUrl = originalUrlsRef.current.get(id);
    if (origUrl) {
      URL.revokeObjectURL(origUrl);
      originalUrlsRef.current.delete(id);
    }
    setQueue((prev) => {
      const target = prev.find((q) => q.id === id);
      if (target) revokeConvertedUrls(target.results);
      return prev.filter((q) => q.id !== id);
    });
  };

  const handleClearQueue = () => {
    poolRef.current?.terminateAll();
    originalUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    originalUrlsRef.current.clear();
    queue.forEach((q) => revokeConvertedUrls(q.results));
    setQueue([]);
    setErrorMsg(null);
  };

  const patchQueueItem = (itemId: string, patch: Partial<BatchQueueItem>) => {
    setQueue((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  };

  const executeBatch = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    if (!poolRef.current) poolRef.current = new BatchWorkerPool();

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const summary = await poolRef.current.runBatch({
        itemIdsToProcess: targetIds,
        getItemsSnapshot: () => queueRef.current,
        concurrency,
        buildRequest: (item, batchIndex) => ({
          toolId: 'optimization-studio',
          toFormat: format,
          fileName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type || '',
          studioOptions: {
            format,
            quality,
            maxWidth: maxWidth > 0 ? maxWidth : undefined,
            renamePrefix: renamePrefix.trim() || undefined,
            indexSuffix: queueRef.current.length > 1 ? `-${batchIndex + 1}` : ''
          }
        }),
        mainThreadFallback: async (item, onProgress) => {
          onProgress(40, 'Optimizing via canvas fallback...');
          const idx = queueRef.current.findIndex((q) => q.id === item.id);
          const res = await optimizeStudioImage(item.file, {
            format,
            quality,
            maxWidth: maxWidth > 0 ? maxWidth : undefined,
            renamePrefix: renamePrefix.trim() || undefined,
            indexSuffix: queueRef.current.length > 1 ? `-${(idx >= 0 ? idx : 0) + 1}` : ''
          });
          return { results: [res] };
        },
        onItemPatch: patchQueueItem
      });

      const firstCompletedIdx = queueRef.current.findIndex((q) => q.status === 'completed');
      if (firstCompletedIdx >= 0) setActiveCompareIdx(firstCompletedIdx);

      if (summary.failedCount > 0 && summary.completedCount === 0 && !summary.cancelled) {
        const firstErr = queueRef.current.find((q) => q.status === 'failed')?.error;
        if (firstErr) setErrorMsg(firstErr);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not process one or more files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptimizeAll = async () => {
    if (queue.length === 0) return;
    const pendingIds = queue
      .filter((q) => q.status === 'queued' || q.status === 'failed' || q.status === 'cancelled')
      .map((q) => q.id);

    if (pendingIds.length > 0) {
      await executeBatch(pendingIds);
    } else {
      const allIds = queue.map((q) => q.id);
      setQueue((prev) =>
        prev.map((q) => {
          revokeConvertedUrls(q.results);
          return { ...q, status: 'queued', progress: 0, results: [], error: undefined };
        })
      );
      await executeBatch(allIds);
    }
  };

  const handleCancelBatch = () => {
    poolRef.current?.terminateAll();
    poolRef.current = new BatchWorkerPool();
    setQueue((prev) =>
      prev.map((q) =>
        q.status === 'processing' || q.status === 'queued'
          ? { ...q, status: 'cancelled', progress: 0, progressMessage: 'Stopped' }
          : q
      )
    );
    setIsProcessing(false);
  };

  const handleRetryItem = async (id: string) => {
    patchQueueItem(id, { status: 'queued', progress: 0, error: undefined });
    await executeBatch([id]);
  };

  const handleRetryFailed = async () => {
    const failedIds = queueRef.current
      .filter((q) => q.status === 'failed' || q.status === 'cancelled')
      .map((q) => q.id);
    if (failedIds.length === 0) return;
    setQueue((prev) =>
      prev.map((q) => (failedIds.includes(q.id) ? { ...q, status: 'queued', progress: 0, error: undefined } : q))
    );
    await executeBatch(failedIds);
  };

  const handleDownloadSingle = (res: ConvertedFile) => {
    const url = URL.createObjectURL(res.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const results = queue.flatMap((q) => q.results);

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
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const totalOrig = results.reduce((s, r) => s + r.originalSize, 0);
  const totalOut = results.reduce((s, r) => s + r.convertedSize, 0);
  const savedPct = totalOrig > 0 ? Math.round(((totalOrig - totalOut) / totalOrig) * 100) : 0;

  const activeItem = queue[activeCompareIdx];
  const activeOrigUrl = activeItem ? originalUrlsRef.current.get(activeItem.id) : undefined;
  const activeResult = activeItem?.results[0];

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
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`block rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDraggingOver
            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Drop multiple images into Image Optimization Studio
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Parallel Web Worker processing · Originals stay local in memory
        </p>
      </label>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Parallel Batch Queue */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <BatchQueuePanel
            items={queue}
            isRunning={isProcessing}
            concurrency={concurrency}
            onChangeConcurrency={setConcurrency}
            onAddMoreFiles={() => fileInputRef.current?.click()}
            onRemoveItem={handleRemove}
            onRetryItem={handleRetryItem}
            onRetryAllFailed={handleRetryFailed}
            onCancelBatch={handleCancelBatch}
            onClearQueue={handleClearQueue}
            onDownloadSingle={handleDownloadSingle}
            onInspectItem={(idx) => setActiveCompareIdx(idx)}
            inspectedIndex={activeCompareIdx}
            queueTitle="Studio Batch Queue"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleOptimizeAll}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
              <span>
                {isProcessing
                  ? 'Optimizing Across Web Workers...'
                  : queue.some((q) => q.status === 'queued')
                  ? `Optimize Queued (${queue.filter((q) => q.status === 'queued').length})`
                  : `Reprocess Batch (${queue.length})`}
              </span>
            </button>
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

          {activeOrigUrl && activeResult && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Visual Inspector: {activeResult.convertedName} ({activeResult.width}×{activeResult.height}px)
                </span>
                {queue.filter((q) => q.status === 'completed').length > 1 && (
                  <select
                    value={activeCompareIdx}
                    onChange={(e) => setActiveCompareIdx(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  >
                    {queue.map((q, i) =>
                      q.results[0] ? (
                        <option key={q.id} value={i}>
                          {q.results[0].convertedName}
                        </option>
                      ) : null
                    )}
                  </select>
                )}
              </div>
              <BeforeAfterSlider
                originalUrl={activeOrigUrl}
                processedUrl={activeResult.previewUrl || activeResult.dataUrl}
                originalSize={activeResult.originalSize}
                processedSize={activeResult.convertedSize}
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
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(r)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
