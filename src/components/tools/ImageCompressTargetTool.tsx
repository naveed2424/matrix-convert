import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Download, AlertTriangle, CheckCircle2, RefreshCw, Archive } from 'lucide-react';
import { compressImageToTargetSize, formatFileSize } from '../../services/advancedToolsEngine';
import { createZipBundle } from '../../services/converterEngine';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BatchQueuePanel } from '../BatchQueuePanel';
import {
  BatchQueueItem,
  BatchWorkerPool,
  createBatchQueueItem,
  getRecommendedConcurrency,
  revokeConvertedUrls
} from '../../services/batchWorkerPool';
import { ConvertedFile } from '../../types';

interface ImageCompressTargetToolProps {
  initialFiles?: File[];
  onConsumeInitialFiles?: () => void;
}

export const ImageCompressTargetTool: React.FC<ImageCompressTargetToolProps> = ({
  initialFiles,
  onConsumeInitialFiles
}) => {
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [concurrency, setConcurrency] = useState<number>(() => getRecommendedConcurrency());
  const [targetKb, setTargetKb] = useState<number>(100);
  const [customKb, setCustomKb] = useState<string>('150');
  const [isCustom, setIsCustom] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'webp'>('jpg');
  const [allowDownscale, setAllowDownscale] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeCompareIdx, setActiveCompareIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const poolRef = useRef<BatchWorkerPool | null>(null);
  const queueRef = useRef<BatchQueueItem[]>([]);
  queueRef.current = queue;
  const originalUrlsRef = useRef<Map<string, string>>(new Map());

  const effectiveTargetKb = isCustom ? Math.max(5, Number(customKb) || 100) : targetKb;

  const seedItems = (incoming: File[]) => {
    const added = incoming.map((file, idx) => {
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

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    seedItems(Array.from(fileList));
  };

  const handleRemoveItem = (id: string) => {
    const url = originalUrlsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
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

    setIsRunning(true);
    setErrorMsg(null);

    try {
      const summary = await poolRef.current.runBatch({
        itemIdsToProcess: targetIds,
        getItemsSnapshot: () => queueRef.current,
        concurrency,
        buildRequest: (item) => ({
          toolId: 'compress-image-to-100kb',
          toFormat: outputFormat,
          fileName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type || '',
          targetKbOptions: {
            targetKb: effectiveTargetKb,
            outputFormat,
            allowAspectSafeScale: allowDownscale
          }
        }),
        mainThreadFallback: async (item, onProgress) => {
          onProgress(40, `Targeting ${effectiveTargetKb} KB...`);
          const res = await compressImageToTargetSize(item.file, effectiveTargetKb, outputFormat, allowDownscale);
          return {
            results: [res],
            extraMeta: {
              hitTarget: res.hitTarget,
              finalQuality: res.finalQuality,
              qualityUsed: res.qualityUsed,
              finalScale: res.finalScale
            }
          };
        },
        onItemPatch: patchQueueItem
      });

      const firstDoneIdx = queueRef.current.findIndex((q) => q.status === 'completed');
      if (firstDoneIdx >= 0) setActiveCompareIdx(firstDoneIdx);

      if (summary.failedCount > 0 && summary.completedCount === 0 && !summary.cancelled) {
        const firstErr = queueRef.current.find((q) => q.status === 'failed')?.error;
        if (firstErr) setErrorMsg(firstErr);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not compress queued images.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCompress = async () => {
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
    setIsRunning(false);
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

  const completedResults = queue.flatMap((q) => q.results);

  const handleDownloadAllZip = async () => {
    if (completedResults.length === 0) return;
    const zipBlob = await createZipBundle(completedResults);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimage-${effectiveTargetKb}kb-batch-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const inspectedItem = queue[activeCompareIdx];
  const inspectedResult = inspectedItem?.results[0];
  const inspectedOrigUrl = inspectedItem ? originalUrlsRef.current.get(inspectedItem.id) : undefined;

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
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleSelectFiles(e.dataTransfer.files);
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
            handleSelectFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {queue.length > 0
            ? `${queue.length} image(s) queued — drop or click to add more`
            : 'Select or drop multiple images to compress under target KB'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          JPG, PNG, or WebP · Simultaneous Web Worker Execution
        </p>
      </label>

      {queue.length > 0 && (
        <div className="space-y-4">
          <BatchQueuePanel
            items={queue}
            isRunning={isRunning}
            concurrency={concurrency}
            onChangeConcurrency={setConcurrency}
            onAddMoreFiles={() => fileInputRef.current?.click()}
            onRemoveItem={handleRemoveItem}
            onRetryItem={async (id) => {
              patchQueueItem(id, { status: 'queued', progress: 0, error: undefined });
              await executeBatch([id]);
            }}
            onRetryAllFailed={async () => {
              const failedIds = queueRef.current
                .filter((q) => q.status === 'failed' || q.status === 'cancelled')
                .map((q) => q.id);
              if (failedIds.length > 0) await executeBatch(failedIds);
            }}
            onCancelBatch={handleCancelBatch}
            onClearQueue={handleClearQueue}
            onDownloadSingle={handleDownloadSingle}
            onInspectItem={(idx) => setActiveCompareIdx(idx)}
            inspectedIndex={activeCompareIdx}
            queueTitle="Target-KB Batch Queue"
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isRunning}
              onClick={handleCompress}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-bold text-sm cursor-pointer disabled:opacity-60"
            >
              {isRunning && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {isRunning
                  ? `Compressing Batch Under ${effectiveTargetKb} KB...`
                  : queue.some((q) => q.status === 'queued')
                  ? `Compress ${queue.filter((q) => q.status === 'queued').length} Under ${effectiveTargetKb} KB`
                  : `Reprocess Batch Under ${effectiveTargetKb} KB`}
              </span>
            </button>

            {completedResults.length > 1 && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>Download All ({completedResults.length}) ZIP</span>
              </button>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {inspectedResult && inspectedOrigUrl && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              {inspectedItem?.extraMeta?.hitTarget !== false ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {inspectedResult.convertedName}: {formatFileSize(inspectedResult.originalSize)} →{' '}
                {formatFileSize(inspectedResult.convertedSize)} ({inspectedResult.width}×{inspectedResult.height}px
                {inspectedItem?.extraMeta?.qualityUsed ? ` · quality ${inspectedItem.extraMeta.qualityUsed}%` : ''})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {queue.filter((q) => q.status === 'completed').length > 1 && (
                <select
                  value={activeCompareIdx}
                  onChange={(e) => setActiveCompareIdx(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
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
              <button
                type="button"
                onClick={() => handleDownloadSingle(inspectedResult)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {inspectedResult.note && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
              {inspectedResult.note}
            </div>
          )}

          <BeforeAfterSlider
            originalUrl={inspectedOrigUrl}
            processedUrl={inspectedResult.previewUrl || inspectedResult.dataUrl}
            originalSize={inspectedResult.originalSize}
            processedSize={inspectedResult.convertedSize}
          />
        </div>
      )}
    </div>
  );
};
