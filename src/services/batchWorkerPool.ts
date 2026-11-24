import { ConvertedFile, ConversionSettings } from '../types';
import { WorkerPayloadResult } from '../utils/workerPureProcessors';
import type { WorkerConvertRequest, WorkerConvertResponse } from '../workers/conversionWorker';

export type BatchItemStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchQueueExtraMeta {
  hitTarget?: boolean;
  finalQuality?: number;
  qualityUsed?: number;
  finalScale?: number;
}

export interface BatchQueueItem {
  id: string;
  file: File;
  status: BatchItemStatus;
  workerIndex?: number;
  progress: number;
  progressMessage?: string;
  durationMs?: number;
  results: ConvertedFile[];
  error?: string;
  extraMeta?: BatchQueueExtraMeta;
  usedWorkerThread?: boolean;
}

export function getRecommendedConcurrency(): number {
  if (typeof navigator === 'undefined') return 4;
  return Math.min(4, Math.max(2, navigator.hardwareConcurrency || 4));
}

export function getMaxHardwareConcurrency(): number {
  if (typeof navigator === 'undefined') return 6;
  return Math.min(8, Math.max(2, navigator.hardwareConcurrency || 4));
}

export function createBatchQueueItem(file: File, indexOffset = 0): BatchQueueItem {
  return {
    id: `q-${Date.now()}-${indexOffset}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    status: 'queued',
    progress: 0,
    results: []
  };
}

export function revokeConvertedUrls(results: ConvertedFile[]) {
  for (const r of results) {
    if (r.dataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(r.dataUrl);
    }
    if (r.previewUrl?.startsWith('blob:') && r.previewUrl !== r.dataUrl) {
      URL.revokeObjectURL(r.previewUrl);
    }
  }
}

function buildConvertedFileFromWorker(
  sourceFile: File,
  payload: WorkerPayloadResult
): { file: ConvertedFile; extraMeta?: BatchQueueExtraMeta } {
  const blob = new Blob([payload.buffer], { type: payload.mimeType });
  const dataUrl = URL.createObjectURL(blob);

  let previewUrl = dataUrl;
  if (payload.previewDataUrl) {
    previewUrl = payload.previewDataUrl;
  } else if (payload.previewBuffer) {
    const pBlob = new Blob([payload.previewBuffer], { type: 'image/png' });
    previewUrl = URL.createObjectURL(pBlob);
  }

  return {
    file: {
      id: `wk-${sourceFile.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      originalName: sourceFile.name,
      convertedName: payload.convertedName,
      originalSize: sourceFile.size,
      convertedSize: blob.size,
      dataUrl,
      blob,
      previewUrl,
      width: payload.width,
      height: payload.height,
      note: payload.note,
      textContent: payload.textContent
    },
    extraMeta: payload.extraMeta
  };
}

export interface RunBatchJobParams {
  itemIdsToProcess: string[];
  getItemsSnapshot: () => BatchQueueItem[];
  concurrency: number;
  buildRequest: (item: BatchQueueItem, batchIndex: number) => Omit<WorkerConvertRequest, 'buffer' | 'jobId'>;
  mainThreadFallback: (
    item: BatchQueueItem,
    onProgress: (pct: number, msg?: string) => void
  ) => Promise<{ results: ConvertedFile[]; extraMeta?: BatchQueueExtraMeta }>;
  onItemPatch: (itemId: string, patch: Partial<BatchQueueItem>) => void;
}

/**
 * Reusable Parallel Web Worker Pool with Transferable ArrayBuffers & Graceful Cancel/Fallback
 */
export class BatchWorkerPool {
  private workers: Worker[] = [];
  private activeRunId = 0;
  private isAborted = false;

  private spawnWorker(): Worker | null {
    if (typeof Worker === 'undefined') return null;
    try {
      return new Worker(new URL('../workers/conversionWorker.ts', import.meta.url), {
        type: 'module'
      });
    } catch {
      return null;
    }
  }

  private ensureWorkers(count: number): Worker[] {
    const target = Math.max(1, Math.min(8, count));
    while (this.workers.length < target) {
      const w = this.spawnWorker();
      if (!w) break;
      this.workers.push(w);
    }
    return this.workers;
  }

  public terminateAll() {
    this.activeRunId++;
    this.isAborted = true;
    for (const w of this.workers) {
      try {
        w.terminate();
      } catch {
        // ignore termination cleanup error
      }
    }
    this.workers = [];
  }

  private dispatchToWorker(worker: Worker, req: WorkerConvertRequest, runId: number): Promise<WorkerConvertResponse> {
    return new Promise((resolve, reject) => {
      if (this.isAborted || runId !== this.activeRunId) {
        reject(new Error('Batch processing cancelled'));
        return;
      }

      const onMessage = (ev: MessageEvent<WorkerConvertResponse>) => {
        if (ev.data?.jobId !== req.jobId) return;
        cleanup();
        resolve(ev.data);
      };

      const onError = (ev: ErrorEvent) => {
        cleanup();
        reject(new Error(ev?.message || 'Web Worker encountered an unexpected error'));
      };

      const cleanup = () => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      try {
        worker.postMessage(req, [req.buffer]);
      } catch (err: any) {
        cleanup();
        reject(err);
      }
    });
  }

  public async runBatch(params: RunBatchJobParams): Promise<{
    completedCount: number;
    failedCount: number;
    cancelled: boolean;
  }> {
    const {
      itemIdsToProcess,
      getItemsSnapshot,
      concurrency,
      buildRequest,
      mainThreadFallback,
      onItemPatch
    } = params;

    if (itemIdsToProcess.length === 0) {
      return { completedCount: 0, failedCount: 0, cancelled: false };
    }

    const runId = ++this.activeRunId;
    this.isAborted = false;

    const poolSize = Math.max(1, Math.min(concurrency, itemIdsToProcess.length));
    const pool = this.ensureWorkers(poolSize);

    let cursor = 0;
    let completedCount = 0;
    let failedCount = 0;

    const workerSlotCount = pool.length > 0 ? Math.min(poolSize, pool.length) : poolSize;

    const executeSlot = async (slotIndex: number) => {
      const workerInstance = pool[slotIndex] || null;
      const workerNumber = slotIndex + 1;

      while (true) {
        if (this.isAborted || runId !== this.activeRunId) break;
        const nextIdx = cursor++;
        if (nextIdx >= itemIdsToProcess.length) break;

        const targetId = itemIdsToProcess[nextIdx];
        const snapshot = getItemsSnapshot();
        const item = snapshot.find((x) => x.id === targetId);
        if (!item) continue;

        revokeConvertedUrls(item.results);
        onItemPatch(item.id, {
          status: 'processing',
          workerIndex: workerNumber,
          progress: 12,
          progressMessage: workerInstance
            ? `Worker #${workerNumber} processing...`
            : `Thread #${workerNumber} processing...`,
          error: undefined,
          results: []
        });

        const startedAt = performance.now();

        try {
          let settled = false;

          if (workerInstance) {
            const buffer = await item.file.arrayBuffer();
            if (this.isAborted || runId !== this.activeRunId) {
              onItemPatch(item.id, { status: 'cancelled', progress: 0, progressMessage: 'Cancelled' });
              break;
            }

            onItemPatch(item.id, { progress: 40 });
            const partialReq = buildRequest(item, nextIdx);
            const req: WorkerConvertRequest = {
              ...partialReq,
              jobId: `${runId}-${item.id}`,
              buffer
            };

            const response = await this.dispatchToWorker(workerInstance, req, runId);
            if (this.isAborted || runId !== this.activeRunId) {
              onItemPatch(item.id, { status: 'cancelled', progress: 0, progressMessage: 'Cancelled' });
              break;
            }

            if (response.ok && response.result) {
              const converted = buildConvertedFileFromWorker(item.file, response.result);
              onItemPatch(item.id, {
                status: 'completed',
                progress: 100,
                progressMessage: 'Completed',
                durationMs: response.durationMs,
                workerIndex: workerNumber,
                usedWorkerThread: true,
                results: [converted.file],
                extraMeta: converted.extraMeta
              });
              completedCount++;
              settled = true;
            } else if (!response.fallbackToMainThread) {
              throw new Error(response.error || 'Worker failed to convert file.');
            }
          }

          if (!settled) {
            if (this.isAborted || runId !== this.activeRunId) {
              onItemPatch(item.id, { status: 'cancelled', progress: 0, progressMessage: 'Cancelled' });
              break;
            }
            const fbResult = await mainThreadFallback(item, (pct, msg) => {
              if (!this.isAborted && runId === this.activeRunId) {
                onItemPatch(item.id, {
                  progress: Math.max(15, Math.min(99, pct)),
                  progressMessage: msg || `Thread #${workerNumber} working...`
                });
              }
            });
            if (this.isAborted || runId !== this.activeRunId) {
              onItemPatch(item.id, { status: 'cancelled', progress: 0, progressMessage: 'Cancelled' });
              break;
            }
            const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
            onItemPatch(item.id, {
              status: 'completed',
              progress: 100,
              progressMessage: 'Completed',
              durationMs,
              workerIndex: workerNumber,
              usedWorkerThread: false,
              results: fbResult.results,
              extraMeta: fbResult.extraMeta
            });
            completedCount++;
          }
        } catch (err: any) {
          if (this.isAborted || runId !== this.activeRunId) {
            onItemPatch(item.id, { status: 'cancelled', progress: 0, progressMessage: 'Cancelled' });
            break;
          }
          const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
          onItemPatch(item.id, {
            status: 'failed',
            progress: 0,
            durationMs,
            workerIndex: workerNumber,
            error: err?.message || 'Conversion failed for this file.'
          });
          failedCount++;
        }
      }
    };

    await Promise.all(Array.from({ length: workerSlotCount }, (_, idx) => executeSlot(idx)));

    return {
      completedCount,
      failedCount,
      cancelled: this.isAborted || runId !== this.activeRunId
    };
  }
}

export type MainThreadFallbackArgs = {
  toolId: string;
  toFormat: string;
  settings: Partial<ConversionSettings>;
};
