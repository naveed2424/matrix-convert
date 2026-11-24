import { ConversionSettings } from '../types';
import {
  WorkerFallbackRequired,
  WorkerPayloadResult,
  applyAdvancedFilterInWorker,
  applySimpleFilterInWorker,
  compressTargetKbInWorker,
  csvToJsonPure,
  decodeUtf8,
  generateMatrixArtInWorker,
  jsonToCsvPure,
  jsonToXmlPure,
  markdownToHtmlPure,
  optimizeStudioInWorker,
  pdfToBase64Pure,
  processJsPdfTextToolInWorker,
  processPdfLibInWorker,
  processRasterInWorker,
  roundCornersInWorker,
  vectorizeToSvgInWorker
} from '../utils/workerPureProcessors';

export interface WorkerConvertRequest {
  jobId: string;
  toolId: string;
  toFormat: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: ArrayBuffer;
  settings?: Partial<ConversionSettings>;
  studioOptions?: {
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    quality?: number;
    maxWidth?: number;
    renamePrefix?: string;
    indexSuffix?: string;
  };
  targetKbOptions?: {
    targetKb?: number;
    outputFormat?: 'jpeg' | 'jpg' | 'webp';
    allowAspectSafeScale?: boolean;
  };
}

export interface WorkerConvertResponse {
  jobId: string;
  ok: boolean;
  durationMs: number;
  fallbackToMainThread?: boolean;
  fallbackReason?: string;
  error?: string;
  result?: WorkerPayloadResult;
}

const ADVANCED_FILTER_IDS = new Set([
  'image-aspect-ratio-padder',
  'image-color-inverter',
  'image-sepia-vintage',
  'image-brightness-contrast',
  'image-threshold-binary',
  'image-blur-redact',
  'image-sharpen-unsharp',
  'image-dpi-density-changer',
  'image-border-polaroid',
  'image-watermark-overlay',
  'image-flip-mirror',
  'image-color-tint-duotone',
  'image-transparent-png-maker',
  'image-exif-stripper'
]);

const PDF_LIB_WORKER_IDS = new Set([
  'pdf-metadata-editor',
  'pdf-page-numberer',
  'pdf-flatten',
  'pdf-page-reorder',
  'pdf-2-up-handout'
]);

const JSPDF_TEXT_WORKER_IDS = new Set([
  'markdown-to-pdf',
  'txt-to-pdf',
  'csv-to-pdf',
  'json-to-pdf'
]);

const DOM_OR_PDFJS_MAIN_THREAD_IDS = new Set([
  'xml-to-json',
  'html-to-markdown',
  'html-to-pdf',
  'svg-to-css-uri',
  'pdf-to-markdown',
  'pdf-to-json',
  'pdf-to-html',
  'pdf-to-word-rtf',
  'pdf-to-csv',
  'pdf-grayscale',
  'pdf-invert-colors',
  'pdf-blank-page-remover'
]);

interface WorkerSelfScope {
  onmessage: ((ev: MessageEvent<WorkerConvertRequest>) => void) | null;
  postMessage: (message: WorkerConvertResponse, transfer?: Transferable[]) => void;
}

const workerScope = self as unknown as WorkerSelfScope;

async function handleJob(req: WorkerConvertRequest): Promise<WorkerPayloadResult> {
  const { toolId, toFormat, fileName, mimeType, buffer, settings = {} } = req;

  if (toolId === 'optimization-studio') {
    return optimizeStudioInWorker(fileName, mimeType, buffer, req.studioOptions || {});
  }

  if (toolId === 'compress-image-to-100kb') {
    return compressTargetKbInWorker(fileName, mimeType, buffer, req.targetKbOptions || {});
  }

  if (DOM_OR_PDFJS_MAIN_THREAD_IDS.has(toolId)) {
    throw new WorkerFallbackRequired(`${toolId} requires DOM / PDF.js context`);
  }

  if (PDF_LIB_WORKER_IDS.has(toolId)) {
    return processPdfLibInWorker(toolId, fileName, buffer);
  }

  if (JSPDF_TEXT_WORKER_IDS.has(toolId)) {
    return processJsPdfTextToolInWorker(toolId, fileName, decodeUtf8(buffer));
  }

  if (toolId === 'pdf-to-base64') {
    return pdfToBase64Pure(fileName, buffer);
  }

  if (toolId === 'markdown-to-html') {
    return markdownToHtmlPure(fileName, decodeUtf8(buffer));
  }

  if (toolId === 'json-to-xml') {
    return jsonToXmlPure(fileName, decodeUtf8(buffer));
  }

  if (toolId === 'json-to-csv') {
    return jsonToCsvPure(fileName, decodeUtf8(buffer));
  }

  if (toolId === 'csv-to-json') {
    return csvToJsonPure(fileName, decodeUtf8(buffer));
  }

  if (toolId === 'image-matrix-art') {
    return generateMatrixArtInWorker(
      fileName,
      mimeType,
      buffer,
      settings.matrixDensity ?? 80,
      settings.matrixCharSet ?? 'katakana-binary'
    );
  }

  if (toolId === 'image-grayscale') {
    return applySimpleFilterInWorker(fileName, mimeType, buffer, 'grayscale');
  }
  if (toolId === 'image-rotate') {
    return applySimpleFilterInWorker(fileName, mimeType, buffer, 'rotate-90');
  }
  if (toolId === 'image-crop') {
    return applySimpleFilterInWorker(fileName, mimeType, buffer, 'crop-center');
  }

  if (ADVANCED_FILTER_IDS.has(toolId)) {
    return applyAdvancedFilterInWorker(fileName, mimeType, buffer, toolId, {
      ratio: '1:1',
      threshold: settings.colorThreshold || 128
    });
  }

  if (toolId === 'png-to-jpg') {
    const bg = settings.backgroundColor === 'black' ? 'black' : 'white';
    return processRasterInWorker(fileName, mimeType, buffer, 'jpg', { ...settings, backgroundColor: bg });
  }
  if (toolId === 'webp-to-avif') {
    return processRasterInWorker(fileName, mimeType, buffer, 'avif', settings);
  }
  if (toolId === 'avif-to-webp') {
    return processRasterInWorker(fileName, mimeType, buffer, 'webp', settings);
  }
  if (toolId === 'gif-to-png') {
    const res = await processRasterInWorker(fileName, mimeType, buffer, 'png', settings);
    res.note = 'Extracted high-precision static PNG frame with preserved alpha channel.';
    return res;
  }
  if (toolId === 'jpg-to-svg') {
    return vectorizeToSvgInWorker(fileName, mimeType, buffer, settings);
  }
  if (toolId === 'image-round-corners') {
    return roundCornersInWorker(fileName, mimeType, buffer, 'rounded');
  }

  // Fallback check: PDF-to-image tools require pdf.js main-thread canvas rendering
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    throw new WorkerFallbackRequired('PDF rasterization handled by PDF.js engine');
  }

  // Standard raster image format conversion (png, jpg, webp, avif, bmp, ico, svg, any)
  return processRasterInWorker(fileName, mimeType, buffer, toFormat, settings);
}

workerScope.onmessage = async (event: MessageEvent<WorkerConvertRequest>) => {
  const req = event.data;
  const start = performance.now();

  try {
    const res = await handleJob(req);
    const durationMs = Math.max(1, Math.round(performance.now() - start));
    const transfers: Transferable[] = [res.buffer];
    if (res.previewBuffer) {
      transfers.push(res.previewBuffer);
    }
    workerScope.postMessage(
      {
        jobId: req.jobId,
        ok: true,
        durationMs,
        result: res
      },
      transfers
    );
  } catch (err: any) {
    const durationMs = Math.max(1, Math.round(performance.now() - start));
    if (err instanceof WorkerFallbackRequired || err?.name === 'WorkerFallbackRequired') {
      workerScope.postMessage({
        jobId: req.jobId,
        ok: false,
        durationMs,
        fallbackToMainThread: true,
        fallbackReason: err?.message || 'Main-thread fallback requested'
      });
    } else {
      workerScope.postMessage({
        jobId: req.jobId,
        ok: false,
        durationMs,
        error: err?.message || 'Worker processing error'
      });
    }
  }
};
