import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Download,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { BatchQueueItem, getMaxHardwareConcurrency } from '../services/batchWorkerPool';
import { formatFileSize } from '../services/advancedToolsEngine';
import { ConvertedFile } from '../types';

interface BatchQueuePanelProps {
  items: BatchQueueItem[];
  isRunning: boolean;
  concurrency: number;
  onChangeConcurrency: (val: number) => void;
  onAddMoreFiles?: () => void;
  onRemoveItem: (id: string) => void;
  onRetryItem?: (id: string) => void;
  onRetryAllFailed?: () => void;
  onCancelBatch?: () => void;
  onClearQueue: () => void;
  onDownloadSingle?: (result: ConvertedFile) => void;
  onInspectItem?: (itemIndex: number) => void;
  inspectedIndex?: number;
  isMultiInputMergeTool?: boolean;
  clearLabel?: string;
  queueTitle?: string;
}

export const BatchQueuePanel: React.FC<BatchQueuePanelProps> = ({
  items,
  isRunning,
  concurrency,
  onChangeConcurrency,
  onAddMoreFiles,
  onRemoveItem,
  onRetryItem,
  onRetryAllFailed,
  onCancelBatch,
  onClearQueue,
  onDownloadSingle,
  onInspectItem,
  inspectedIndex,
  isMultiInputMergeTool = false,
  clearLabel = 'Clear Queue',
  queueTitle = 'Batch Processing Queue'
}) => {
  if (items.length === 0) return null;

  const maxWorkers = getMaxHardwareConcurrency();
  const workerOptions = Array.from(new Set([1, 2, 4, maxWorkers].filter((n) => n >= 1 && n <= maxWorkers))).sort(
    (a, b) => a - b
  );

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const overallPct =
    items.length > 0
      ? Math.round(
          items.reduce((sum, item) => sum + (item.status === 'completed' ? 100 : item.progress || 0), 0) / items.length
        )
      : 0;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-4 space-y-3">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
            {queueTitle} ({items.length})
          </span>
          {!isMultiInputMergeTool && (completedCount > 0 || processingCount > 0 || failedCount > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums">
              {processingCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  {processingCount} Active
                </span>
              )}
              {completedCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {completedCount}/{items.length} Done
                </span>
              )}
              {failedCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {failedCount} Failed
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {!isMultiInputMergeTool && (
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Workers:</span>
              <select
                value={concurrency}
                disabled={isRunning}
                onChange={(e) => onChangeConcurrency(Number(e.target.value))}
                aria-label="Parallel Web Workers"
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer disabled:opacity-60"
              >
                {workerOptions.map((n) => (
                  <option key={n} value={n} className="bg-white dark:bg-slate-900">
                    {n} {n === 1 ? 'Thread' : 'Threads'}
                  </option>
                ))}
              </select>
            </label>
          )}

          {onAddMoreFiles && !isRunning && (
            <button
              type="button"
              onClick={onAddMoreFiles}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Files</span>
            </button>
          )}

          {failedCount > 0 && !isRunning && onRetryAllFailed && (
            <button
              type="button"
              onClick={onRetryAllFailed}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Failed ({failedCount})</span>
            </button>
          )}

          {isRunning && onCancelBatch && (
            <button
              type="button"
              onClick={onCancelBatch}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop Batch</span>
            </button>
          )}

          {!isRunning && (
            <button
              type="button"
              onClick={onClearQueue}
              className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              {clearLabel}
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Progress Bar while running or partially completed */}
      {!isMultiInputMergeTool && (isRunning || (completedCount > 0 && completedCount < items.length)) && (
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-200"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              {isRunning
                ? `Parallel execution across up to ${Math.min(concurrency, items.length)} Web Worker(s)`
                : `${completedCount} of ${items.length} completed`}
            </span>
            <span>{overallPct}%</span>
          </div>
        </div>
      )}

      {/* Per-File Queue Rows */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {items.map((item, index) => {
          const primaryResult = item.results[0];
          const outputBytes = item.results.reduce((s, r) => s + r.convertedSize, 0);
          const deltaPct =
            item.status === 'completed' && item.file.size > 0 && item.results.length === 1
              ? Math.round(((outputBytes - item.file.size) / item.file.size) * 100)
              : null;

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3 transition-colors ${
                item.status === 'processing'
                  ? 'border-blue-400 dark:border-sky-500/60 bg-blue-50/50 dark:bg-sky-950/20'
                  : item.status === 'failed'
                  ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20'
                  : item.status === 'completed'
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {item.status === 'processing' ? (
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-sky-400 animate-spin shrink-0" />
                  ) : item.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : item.status === 'failed' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                        {item.file.name}
                      </span>
                      {item.status === 'processing' && item.workerIndex && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-blue-600/10 text-blue-700 dark:text-sky-300 border border-blue-500/20">
                          Worker #{item.workerIndex}
                        </span>
                      )}
                      {item.status === 'completed' && item.durationMs !== undefined && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 tabular-nums">
                          {item.usedWorkerThread ? `Worker · ${item.durationMs}ms` : `${item.durationMs}ms`}
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Stopped
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                      <span>{formatFileSize(item.file.size)}</span>
                      {item.status === 'completed' && item.results.length > 0 && (
                        <>
                          <span>→</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.results.length > 1
                              ? `${item.results.length} outputs (${formatFileSize(outputBytes)})`
                              : formatFileSize(outputBytes)}
                          </span>
                          {deltaPct !== null && (
                            <span
                              className={
                                deltaPct <= 0
                                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                  : 'text-amber-600 dark:text-amber-400'
                              }
                            >
                              ({deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                            </span>
                          )}
                        </>
                      )}
                      {item.status === 'processing' && item.progressMessage && (
                        <span className="text-blue-600 dark:text-sky-400 truncate">{item.progressMessage}</span>
                      )}
                      {item.status === 'failed' && item.error && (
                        <span className="text-rose-600 dark:text-rose-300 truncate">{item.error}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.status === 'completed' && onInspectItem && (
                    <button
                      type="button"
                      onClick={() => onInspectItem(index)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] cursor-pointer ${
                        inspectedIndex === index
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Compare</span>
                    </button>
                  )}

                  {item.status === 'completed' && primaryResult && item.results.length === 1 && onDownloadSingle && (
                    <button
                      type="button"
                      onClick={() => onDownloadSingle(primaryResult)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}

                  {(item.status === 'failed' || item.status === 'cancelled') && !isRunning && onRetryItem && (
                    <button
                      type="button"
                      onClick={() => onRetryItem(item.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold cursor-pointer"
                      aria-label="Retry file"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}

                  {item.status !== 'processing' && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {item.status === 'processing' && (
                <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-150"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
