import { jsPDF } from 'jspdf';
import { PDFDocument, PageSizes, StandardFonts, rgb } from 'pdf-lib';
import { ConversionSettings } from '../types';

export interface WorkerPayloadResult {
  convertedName: string;
  mimeType: string;
  buffer: ArrayBuffer;
  previewBuffer?: ArrayBuffer;
  previewDataUrl?: string;
  width?: number;
  height?: number;
  note?: string;
  textContent?: string;
  extraMeta?: {
    hitTarget?: boolean;
    finalQuality?: number;
    qualityUsed?: number;
    finalScale?: number;
  };
}

export class WorkerFallbackRequired extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'WorkerFallbackRequired';
  }
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function encodeUtf8(str: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(str);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export function decodeUtf8(buffer: ArrayBuffer): string {
  return new TextDecoder('utf-8').decode(buffer);
}

export function escapeXmlPure(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeHtmlPure(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function makeDocumentBadgeSvgUrl(badgeLabel: string, title: string, subtitle: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const shortTitle = title.length > 26 ? `${title.slice(0, 23)}...` : title;
  const shortSub = subtitle.length > 34 ? `${subtitle.slice(0, 31)}...` : subtitle;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="480" height="270" rx="16" fill="url(#bg)"/>
    <rect x="28" y="28" width="110" height="36" rx="8" fill="#10b981" fill-opacity="0.2" stroke="#10b981"/>
    <text x="83" y="51" font-family="monospace" font-size="15" font-weight="bold" fill="#34d399" text-anchor="middle">${esc(badgeLabel)}</text>
    <text x="28" y="135" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">${esc(shortTitle)}</text>
    <text x="28" y="172" font-family="monospace" font-size="14" fill="#94a3b8">${esc(shortSub)}</text>
    <text x="28" y="232" font-family="monospace" font-size="12" fill="#38bdf8">Mimage Worker Engine · 100% Client-Side</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function decodeInputToBitmap(buffer: ArrayBuffer, mimeType: string, fileName: string): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    throw new WorkerFallbackRequired('OffscreenCanvas or createImageBitmap unavailable in this worker');
  }
  const lower = fileName.toLowerCase();
  if (mimeType.includes('svg') || lower.endsWith('.svg')) {
    throw new WorkerFallbackRequired('SVG rasterization requires DOM Image loader');
  }
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    throw new WorkerFallbackRequired('HEIC requires browser-native main thread check');
  }
  try {
    const blob = new Blob([buffer], mimeType ? { type: mimeType } : undefined);
    return await createImageBitmap(blob);
  } catch {
    throw new WorkerFallbackRequired('Browser worker ImageBitmap could not decode this format natively');
  }
}

function createBmpBufferFromImageData(imgData: ImageData): ArrayBuffer {
  const { width, height, data } = imgData;
  const rowPadding = (4 - ((width * 3) % 4)) % 4;
  const rowSize = width * 3 + rowPadding;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0x4d42, false);
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const uint8 = new Uint8Array(buffer);
  let pos = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      uint8[pos++] = data[idx + 2];
      uint8[pos++] = data[idx + 1];
      uint8[pos++] = data[idx];
    }
    for (let p = 0; p < rowPadding; p++) {
      uint8[pos++] = 0;
    }
  }
  return buffer;
}

async function generateIcoBufferFromCanvas(sourceCanvas: OffscreenCanvas): Promise<ArrayBuffer> {
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngChunks: { size: number; bytes: Uint8Array }[] = [];

  for (const s of sizes) {
    const c = new OffscreenCanvas(s, s);
    const ctx = c.getContext('2d');
    if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');
    ctx.drawImage(sourceCanvas, 0, 0, s, s);
    const pngBlob = await c.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await pngBlob.arrayBuffer());
    pngChunks.push({ size: s, bytes });
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * pngChunks.length;
  const totalLength = offset + pngChunks.reduce((acc, p) => acc + p.bytes.length, 0);
  const icoBuffer = new Uint8Array(totalLength);
  const view = new DataView(icoBuffer.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngChunks.length, true);

  for (let i = 0; i < pngChunks.length; i++) {
    const entry = pngChunks[i];
    const entryOffset = headerSize + i * dirEntrySize;
    icoBuffer[entryOffset] = entry.size === 256 ? 0 : entry.size;
    icoBuffer[entryOffset + 1] = entry.size === 256 ? 0 : entry.size;
    icoBuffer[entryOffset + 2] = 0;
    icoBuffer[entryOffset + 3] = 0;
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, entry.bytes.length, true);
    view.setUint32(entryOffset + 12, offset, true);
    icoBuffer.set(entry.bytes, offset);
    offset += entry.bytes.length;
  }

  return icoBuffer.buffer;
}

function arrayBufferToBase64Pure(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Raster conversion inside Web Worker (OffscreenCanvas)
 */
export async function processRasterInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  targetFormat: string,
  settings: Partial<ConversionSettings> = {}
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    const scale = settings.scale || 1.0;
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');

    let fmt = targetFormat.toLowerCase();
    const originalExt = fileName.split('.').pop()?.toLowerCase() || 'png';
    if (fmt === 'any') {
      fmt = originalExt === 'jpeg' ? 'jpg' : originalExt;
    }

    if (fmt === 'jpg' || fmt === 'jpeg' || fmt === 'bmp' || settings.backgroundColor === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (settings.backgroundColor === 'black') {
      ctx.fillStyle = '#050807';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    const baseName = stripExtension(fileName);

    if (fmt === 'ico') {
      const icoBuf = await generateIcoBufferFromCanvas(canvas);
      const previewBlob = await canvas.convertToBlob({ type: 'image/png' });
      return {
        convertedName: `${baseName}.ico`,
        mimeType: 'image/x-icon',
        buffer: icoBuf,
        previewBuffer: await previewBlob.arrayBuffer(),
        width: 256,
        height: 256
      };
    }

    if (fmt === 'bmp') {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const bmpBuf = createBmpBufferFromImageData(imgData);
      const previewBlob = await canvas.convertToBlob({ type: 'image/png' });
      return {
        convertedName: `${baseName}.bmp`,
        mimeType: 'image/bmp',
        buffer: bmpBuf,
        previewBuffer: await previewBlob.arrayBuffer(),
        width: targetWidth,
        height: targetHeight
      };
    }

    if (fmt === 'svg') {
      const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
      const pngBuf = await pngBlob.arrayBuffer();
      const pngDataUri = `data:image/png;base64,${arrayBufferToBase64Pure(pngBuf)}`;
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${targetWidth} ${targetHeight}" width="${targetWidth}" height="${targetHeight}">
  <!-- Converted by Mimage Worker Engine -->
  <image href="${pngDataUri}" width="${targetWidth}" height="${targetHeight}" />
</svg>`;
      return {
        convertedName: `${baseName}.svg`,
        mimeType: 'image/svg+xml;charset=utf-8',
        buffer: encodeUtf8(svgContent),
        previewBuffer: pngBuf,
        width: targetWidth,
        height: targetHeight
      };
    }

    let outMime = 'image/png';
    let ext = 'png';
    if (fmt === 'webp') {
      outMime = 'image/webp';
      ext = 'webp';
    } else if (fmt === 'jpg' || fmt === 'jpeg') {
      outMime = 'image/jpeg';
      ext = 'jpg';
    } else if (fmt === 'avif') {
      outMime = 'image/avif';
      ext = 'avif';
    }

    const quality = settings.quality !== undefined ? settings.quality / 100 : 0.9;
    const outBlob = await canvas.convertToBlob({ type: outMime, quality });

    if (fmt === 'avif' && outBlob.type !== 'image/avif') {
      throw new Error(
        'Your current browser does not support client-side AVIF encoding (falling back to PNG was blocked to ensure accurate output). Try WebP instead.'
      );
    }

    const outBuf = await outBlob.arrayBuffer();
    let previewBuffer: ArrayBuffer | undefined;
    if (fmt === 'avif') {
      const pBlob = await canvas.convertToBlob({ type: 'image/png' });
      previewBuffer = await pBlob.arrayBuffer();
    }

    return {
      convertedName: `${baseName}.${ext}`,
      mimeType: outMime,
      buffer: outBuf,
      previewBuffer,
      width: targetWidth,
      height: targetHeight
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Batch 12: JPG -> Quantized SVG Path Vectorizer in Worker
 */
export async function vectorizeToSvgInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  settings: Partial<ConversionSettings> = {}
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    const aspect = bitmap.height / Math.max(1, bitmap.width);
    const gridW = Math.min(120, Math.max(48, bitmap.width));
    const gridH = Math.max(24, Math.round(gridW * aspect));

    const canvas = new OffscreenCanvas(gridW, gridH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');

    ctx.drawImage(bitmap, 0, 0, gridW, gridH);
    const imgData = ctx.getImageData(0, 0, gridW, gridH).data;

    const qLevel = settings.quality && settings.quality >= 85 ? 24 : 32;
    const quantize = (v: number) => Math.min(255, Math.round(v / qLevel) * qLevel);
    const toHex = (r: number, g: number, b: number) =>
      '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');

    const colorPaths = new Map<string, string[]>();
    for (let y = 0; y < gridH; y++) {
      let runStart = -1;
      let runColor = '';
      for (let x = 0; x <= gridW; x++) {
        let hex = '';
        if (x < gridW) {
          const idx = (y * gridW + x) * 4;
          if (imgData[idx + 3] >= 64) {
            hex = toHex(quantize(imgData[idx]), quantize(imgData[idx + 1]), quantize(imgData[idx + 2]));
          }
        }
        if (hex !== runColor) {
          if (runColor && runStart >= 0) {
            const runLen = x - runStart;
            const cmd = `M${runStart} ${y}h${runLen}v1h-${runLen}z`;
            if (!colorPaths.has(runColor)) colorPaths.set(runColor, []);
            colorPaths.get(runColor)!.push(cmd);
          }
          runStart = x;
          runColor = hex;
        }
      }
    }

    const pathsMarkup = Array.from(colorPaths.entries())
      .map(([fill, cmds]) => `  <path fill="${fill}" d="${cmds.join('')}"/>`)
      .join('\n');

    const outW = bitmap.width;
    const outH = bitmap.height;
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridW} ${gridH}" width="${outW}" height="${outH}" shape-rendering="crispEdges">
  <!-- Quantized Vector Trace by Mimage Worker Engine (${colorPaths.size} palette paths) -->
${pathsMarkup}
</svg>
`;
    const baseName = stripExtension(fileName);
    return {
      convertedName: `${baseName}.svg`,
      mimeType: 'image/svg+xml;charset=utf-8',
      buffer: encodeUtf8(svgContent),
      previewDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`,
      width: outW,
      height: outH,
      textContent: svgContent,
      note: `Traced ${colorPaths.size} quantized SVG vector color layers (${gridW}×${gridH} vector grid).`
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Batch 12: Rounded Corners Alpha PNG in Worker
 */
export async function roundCornersInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  mode: 'rounded' | 'circle' = 'rounded'
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    let sx = 0;
    let sy = 0;
    if (mode === 'circle') {
      const minSide = Math.min(w, h);
      sx = Math.floor((w - minSide) / 2);
      sy = Math.floor((h - minSide) / 2);
      w = minSide;
      h = minSide;
    }

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    if (mode === 'circle') {
      ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    } else {
      const r = Math.max(12, Math.round(Math.min(w, h) * 0.14));
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
    }
    ctx.closePath();
    ctx.clip();

    if (mode === 'circle') {
      ctx.drawImage(bitmap, sx, sy, w, h, 0, 0, w, h);
    } else {
      ctx.drawImage(bitmap, 0, 0, w, h);
    }
    ctx.restore();

    const outBlob = await canvas.convertToBlob({ type: 'image/png' });
    const baseName = stripExtension(fileName);
    return {
      convertedName: `${baseName}-${mode}.png`,
      mimeType: 'image/png',
      buffer: await outBlob.arrayBuffer(),
      width: w,
      height: h
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Simple Image Filters: grayscale, rotate-90, flip-h, crop-center
 */
export async function applySimpleFilterInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  filterType: 'grayscale' | 'rotate-90' | 'flip-h' | 'crop-center'
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    let canvas: OffscreenCanvas;
    if (filterType === 'rotate-90') {
      canvas = new OffscreenCanvas(bitmap.height, bitmap.width);
      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    } else if (filterType === 'flip-h') {
      canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(bitmap, 0, 0);
    } else if (filterType === 'crop-center') {
      const minDim = Math.min(bitmap.width, bitmap.height);
      canvas = new OffscreenCanvas(minDim, minDim);
      const ctx = canvas.getContext('2d')!;
      const sx = (bitmap.width - minDim) / 2;
      const sy = (bitmap.height - minDim) / 2;
      ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, minDim, minDim);
    } else {
      canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      if (filterType === 'grayscale') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }

    const outBlob = await canvas.convertToBlob({ type: 'image/png' });
    const baseName = stripExtension(fileName);
    return {
      convertedName: `${baseName}-${filterType}.png`,
      mimeType: 'image/png',
      buffer: await outBlob.arrayBuffer(),
      width: canvas.width,
      height: canvas.height
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Matrix Code / ASCII Art Generator in Worker
 */
export async function generateMatrixArtInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  density = 80,
  charSetType: 'katakana-binary' | 'ascii' | 'hex' = 'katakana-binary',
  accentHex = '#00ff66'
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    let chars = ' 01';
    if (charSetType === 'katakana-binary') {
      chars = ' 01ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ#';
    } else if (charSetType === 'hex') {
      chars = ' 0123456789ABCDEF';
    } else {
      chars = ' .:-=+*#%@';
    }

    const cols = Math.min(density, 120);
    const rows = Math.max(1, Math.round((cols * bitmap.height) / (bitmap.width * 2)));

    const sampleCanvas = new OffscreenCanvas(cols, rows);
    const sampleCtx = sampleCanvas.getContext('2d')!;
    sampleCtx.drawImage(bitmap, 0, 0, cols, rows);
    const imgData = sampleCtx.getImageData(0, 0, cols, rows).data;

    let asciiString = '';
    const charGrid: string[][] = [];
    for (let y = 0; y < rows; y++) {
      const rowChars: string[] = [];
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4;
        if (imgData[idx + 3] < 50) {
          rowChars.push(' ');
          asciiString += ' ';
          continue;
        }
        const brightness = (0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2]) / 255;
        const charIdx = Math.min(Math.floor(brightness * chars.length), chars.length - 1);
        const ch = chars[charIdx];
        rowChars.push(ch);
        asciiString += ch;
      }
      charGrid.push(rowChars);
      asciiString += '\n';
    }

    const charW = 12;
    const charH = 18;
    const renderCanvas = new OffscreenCanvas(cols * charW + 40, rows * charH + 40);
    const rCtx = renderCanvas.getContext('2d')!;

    rCtx.fillStyle = '#050807';
    rCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    rCtx.font = 'bold 14px "JetBrains Mono", monospace';
    rCtx.textBaseline = 'middle';

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = charGrid[y][x];
        if (ch === ' ') continue;
        rCtx.shadowColor = accentHex;
        rCtx.shadowBlur = 8;
        rCtx.fillStyle = Math.random() > 0.9 ? '#ffffff' : accentHex;
        rCtx.fillText(ch, 20 + x * charW, 20 + y * charH);
      }
    }

    const outBlob = await renderCanvas.convertToBlob({ type: 'image/png' });
    const baseName = stripExtension(fileName);
    return {
      convertedName: `${baseName}-matrix-rain.png`,
      mimeType: 'image/png',
      buffer: await outBlob.arrayBuffer(),
      width: renderCanvas.width,
      height: renderCanvas.height,
      textContent: asciiString
    };
  } finally {
    bitmap.close();
  }
}

/**
 * 14 Advanced Image Filters inside Worker
 */
export async function applyAdvancedFilterInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  filterId: string,
  options: { ratio?: string; threshold?: number; bgColor?: string; watermarkText?: string } = {}
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    let canvas: OffscreenCanvas;
    let ctx: OffscreenCanvasRenderingContext2D;

    const initCanvas = (cw: number, ch: number) => {
      canvas = new OffscreenCanvas(cw, ch);
      const context = canvas.getContext('2d');
      if (!context) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');
      ctx = context;
    };

    if (filterId === 'image-aspect-ratio-padder') {
      const ratioType = options.ratio || '1:1';
      let targetRatio = 1.0;
      if (ratioType === '4:5') targetRatio = 4 / 5;
      else if (ratioType === '16:9') targetRatio = 16 / 9;
      else if (ratioType === '9:16') targetRatio = 9 / 16;

      const imgAspect = w / h;
      let targetW = w;
      let targetH = h;
      if (imgAspect > targetRatio) {
        targetH = Math.round(w / targetRatio);
      } else {
        targetW = Math.round(h * targetRatio);
      }
      initCanvas(targetW, targetH);
      ctx!.fillStyle = options.bgColor || '#ffffff';
      ctx!.fillRect(0, 0, targetW, targetH);
      ctx!.drawImage(bitmap, Math.round((targetW - w) / 2), Math.round((targetH - h) / 2));
    } else if (filterId === 'image-blur-redact') {
      const smallW = Math.max(1, Math.round(w * 0.08));
      const smallH = Math.max(1, Math.round(h * 0.08));
      const tempCanvas = new OffscreenCanvas(smallW, smallH);
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(bitmap, 0, 0, smallW, smallH);

      initCanvas(w, h);
      ctx!.imageSmoothingEnabled = false;
      ctx!.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, w, h);
    } else if (filterId === 'image-dpi-density-changer') {
      const scaleFactor = 300 / 72;
      const cw = Math.min(6000, Math.round(w * scaleFactor));
      const ch = Math.min(6000, Math.round(h * scaleFactor));
      initCanvas(cw, ch);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
      ctx!.drawImage(bitmap, 0, 0, cw, ch);
    } else if (filterId === 'image-border-polaroid') {
      const borderWidth = Math.max(16, Math.round(w * 0.04));
      const bottomExtra = Math.max(48, Math.round(h * 0.16));
      initCanvas(w + borderWidth * 2, h + borderWidth + bottomExtra);
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx!.drawImage(bitmap, borderWidth, borderWidth);
      ctx!.strokeStyle = '#e2e8f0';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(borderWidth, borderWidth, w, h);
    } else if (filterId === 'image-flip-mirror') {
      initCanvas(w, h);
      ctx!.translate(w, 0);
      ctx!.scale(-1, 1);
      ctx!.drawImage(bitmap, 0, 0);
    } else {
      initCanvas(w, h);
      ctx!.drawImage(bitmap, 0, 0);

      if (filterId === 'image-color-inverter') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];
          d[i + 1] = 255 - d[i + 1];
          d[i + 2] = 255 - d[i + 2];
        }
        ctx!.putImageData(imgData, 0, 0);
      } else if (filterId === 'image-sepia-vintage') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        ctx!.putImageData(imgData, 0, 0);
      } else if (filterId === 'image-brightness-contrast') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        const brightness = 20;
        const contrast = 1.25;
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
        for (let i = 0; i < d.length; i += 4) {
          d[i] = factor * (d[i] + brightness - 128) + 128;
          d[i + 1] = factor * (d[i + 1] + brightness - 128) + 128;
          d[i + 2] = factor * (d[i + 2] + brightness - 128) + 128;
        }
        ctx!.putImageData(imgData, 0, 0);
      } else if (filterId === 'image-threshold-binary') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        const thresh = options.threshold || 128;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const val = gray >= thresh ? 255 : 0;
          d[i] = val;
          d[i + 1] = val;
          d[i + 2] = val;
        }
        ctx!.putImageData(imgData, 0, 0);
      } else if (filterId === 'image-sharpen-unsharp') {
        const srcData = ctx!.getImageData(0, 0, w, h);
        const dstData = ctx!.createImageData(w, h);
        const s = srcData.data;
        const d = dstData.data;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * w + x) * 4 + c;
              const val =
                5 * s[idx] -
                s[((y - 1) * w + x) * 4 + c] -
                s[((y + 1) * w + x) * 4 + c] -
                s[(y * w + (x - 1)) * 4 + c] -
                s[(y * w + (x + 1)) * 4 + c];
              d[idx] = Math.max(0, Math.min(255, val));
            }
            d[(y * w + x) * 4 + 3] = s[(y * w + x) * 4 + 3];
          }
        }
        ctx!.putImageData(dstData, 0, 0);
      } else if (filterId === 'image-watermark-overlay') {
        const stampText = options.watermarkText || 'CONFIDENTIAL - PREVIEW ONLY';
        ctx!.save();
        ctx!.translate(w / 2, h / 2);
        ctx!.rotate((-30 * Math.PI) / 180);
        ctx!.font = `bold ${Math.max(20, Math.round(w / 18))}px sans-serif`;
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx!.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx!.lineWidth = 2;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.strokeText(stampText, 0, 0);
        ctx!.fillText(stampText, 0, 0);
        ctx!.restore();
      } else if (filterId === 'image-color-tint-duotone') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          d[i] = 2;
          d[i + 1] = Math.round(18 + gray * 237);
          d[i + 2] = Math.round(11 + gray * 90);
        }
        ctx!.putImageData(imgData, 0, 0);
      } else if (filterId === 'image-transparent-png-maker') {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) {
            d[i + 3] = 0;
          }
        }
        ctx!.putImageData(imgData, 0, 0);
      }
    }

    const outBlob = await canvas!.convertToBlob({ type: 'image/png' });
    const baseName = stripExtension(fileName);
    return {
      convertedName: `${baseName}-${filterId.replace('image-', '')}.png`,
      mimeType: 'image/png',
      buffer: await outBlob.arrayBuffer(),
      width: canvas!.width,
      height: canvas!.height
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Image Optimization Studio inside Web Worker
 */
export async function optimizeStudioInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  options: {
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    quality?: number;
    maxWidth?: number;
    renamePrefix?: string;
    indexSuffix?: string;
  } = {}
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    const targetFmt = options.format || 'webp';
    const q = Math.max(0.1, Math.min(1, (options.quality ?? 84) / 100));

    let targetW = bitmap.width;
    let targetH = bitmap.height;
    if (options.maxWidth && targetW > options.maxWidth) {
      const ratio = options.maxWidth / targetW;
      targetW = options.maxWidth;
      targetH = Math.max(1, Math.round(targetH * ratio));
    }

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');

    if (targetFmt === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const desiredMime =
      targetFmt === 'avif'
        ? 'image/avif'
        : targetFmt === 'jpg'
        ? 'image/jpeg'
        : targetFmt === 'png'
        ? 'image/png'
        : 'image/webp';

    let blob = await canvas.convertToBlob({ type: desiredMime, quality: q });
    let actualExt: string = targetFmt;
    let actualMime = desiredMime;
    let note: string | undefined;

    if (targetFmt === 'avif' && blob.type !== 'image/avif') {
      blob = await canvas.convertToBlob({ type: 'image/webp', quality: q });
      actualExt = 'webp';
      actualMime = 'image/webp';
      note = 'Browser fell back from AVIF to WebP because native AVIF encoding is unavailable in this browser.';
    }

    const baseName = options.renamePrefix
      ? `${options.renamePrefix}${options.indexSuffix || ''}`
      : stripExtension(fileName);

    let previewBuffer: ArrayBuffer | undefined;
    if (actualExt === 'avif') {
      const pBlob = await canvas.convertToBlob({ type: 'image/png' });
      previewBuffer = await pBlob.arrayBuffer();
    }

    return {
      convertedName: `${baseName}.${actualExt}`,
      mimeType: actualMime,
      buffer: await blob.arrayBuffer(),
      previewBuffer,
      width: targetW,
      height: targetH,
      note
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Exact Target-KB Compressor inside Web Worker
 */
export async function compressTargetKbInWorker(
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  options: {
    targetKb?: number;
    outputFormat?: 'jpeg' | 'jpg' | 'webp';
    allowAspectSafeScale?: boolean;
  } = {}
): Promise<WorkerPayloadResult> {
  const bitmap = await decodeInputToBitmap(buffer, mimeType, fileName);
  try {
    const targetKb = options.targetKb ?? 100;
    const outputFormat = options.outputFormat || 'jpg';
    const allowScale = options.allowAspectSafeScale ?? true;
    const targetBytes = Math.max(5 * 1024, targetKb * 1024);
    const isWebp = outputFormat === 'webp';
    const outMime = isWebp ? 'image/webp' : 'image/jpeg';
    const ext = isWebp ? 'webp' : 'jpg';
    const baseName = stripExtension(fileName);

    const renderAt = async (scale: number, quality: number) => {
      const w = Math.max(16, Math.round(bitmap.width * scale));
      const h = Math.max(16, Math.round(bitmap.height * scale));
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new WorkerFallbackRequired('Offscreen 2D context unavailable');
      if (!isWebp) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, w, h);
      const blob = await canvas.convertToBlob({ type: outMime, quality });
      return { blob, w, h };
    };

    let bestBlob: Blob | null = null;
    let bestW = bitmap.width;
    let bestH = bitmap.height;
    let bestQ = 0.85;
    let bestScale = 1.0;

    let low = 0.12;
    let high = 0.96;
    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2;
      const res = await renderAt(1.0, mid);
      if (res.blob.size <= targetBytes) {
        bestBlob = res.blob;
        bestW = res.w;
        bestH = res.h;
        bestQ = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    if ((!bestBlob || bestBlob.size > targetBytes) && allowScale) {
      for (const s of [0.85, 0.7, 0.55, 0.4, 0.25]) {
        let sLow = 0.12;
        let sHigh = 0.85;
        let candidate: { blob: Blob; w: number; h: number; q: number } | null = null;
        for (let i = 0; i < 6; i++) {
          const mid = (sLow + sHigh) / 2;
          const res = await renderAt(s, mid);
          if (res.blob.size <= targetBytes) {
            candidate = { ...res, q: mid };
            sLow = mid;
          } else {
            sHigh = mid;
          }
        }
        if (candidate) {
          bestBlob = candidate.blob;
          bestW = candidate.w;
          bestH = candidate.h;
          bestQ = candidate.q;
          bestScale = s;
          break;
        }
      }
    }

    if (!bestBlob) {
      const minRes = await renderAt(allowScale ? 0.25 : 1.0, 0.15);
      bestBlob = minRes.blob;
      bestW = minRes.w;
      bestH = minRes.h;
      bestQ = 0.15;
      bestScale = allowScale ? 0.25 : 1.0;
    }

    const hitTarget = bestBlob.size <= targetBytes;
    const roundedQ = Math.round(bestQ * 100);
    const scalePct = Math.round(bestScale * 100);

    return {
      convertedName: `${baseName}-${targetKb}kb.${ext}`,
      mimeType: outMime,
      buffer: await bestBlob.arrayBuffer(),
      width: bestW,
      height: bestH,
      note: hitTarget
        ? `Target ${targetKb} KB achieved at ${roundedQ}% quality and ${scalePct}% scale.`
        : `Minimum reachable size without excessive distortion was ${Math.round(bestBlob.size / 1024)} KB (target was ${targetKb} KB).`,
      extraMeta: {
        hitTarget,
        finalQuality: roundedQ,
        qualityUsed: roundedQ,
        finalScale: scalePct
      }
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Pure Text / Structured Data / Document Generators (zero DOM)
 */
function renderInlineMarkdownPure(text: string): string {
  let s = escapeHtmlPure(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const safeUrl = url.toLowerCase().startsWith('javascript:') ? '#' : url;
    return `<a href="${safeUrl}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s;
}

export function markdownToHtmlPure(fileName: string, raw: string): WorkerPayloadResult {
  if (!raw.trim()) throw new Error('The Markdown file is empty.');
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      htmlParts.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      htmlParts.push('</ol>');
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      closeLists();
      if (!inCode) {
        inCode = true;
        codeLang = escapeHtmlPure(trimmed.slice(3).trim());
        codeBuffer = [];
      } else {
        inCode = false;
        const cls = codeLang ? ` class="language-${codeLang}"` : '';
        htmlParts.push(`<pre><code${cls}>${escapeHtmlPure(codeBuffer.join('\n'))}</code></pre>`);
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }
    if (!trimmed) {
      closeLists();
      continue;
    }
    if (trimmed.startsWith('|') && i + 1 < lines.length && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
      closeLists();
      const parseRow = (rowStr: string) =>
        rowStr
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => renderInlineMarkdownPure(c.trim()));
      const headers = parseRow(trimmed);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        bodyRows.push(parseRow(lines[i].trim()));
        i++;
      }
      i--;
      const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
      const tbody = bodyRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
      htmlParts.push(`<table>${thead}<tbody>${tbody}</tbody></table>`);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${renderInlineMarkdownPure(headingMatch[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      htmlParts.push('<hr />');
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<blockquote><p>${renderInlineMarkdownPure(trimmed.replace(/^>\s?/, ''))}</p></blockquote>`);
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      if (inOl) {
        htmlParts.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        htmlParts.push('<ul>');
        inUl = true;
      }
      htmlParts.push(`  <li>${renderInlineMarkdownPure(trimmed.replace(/^[-*+]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (inUl) {
        htmlParts.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        htmlParts.push('<ol>');
        inOl = true;
      }
      htmlParts.push(`  <li>${renderInlineMarkdownPure(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    closeLists();
    htmlParts.push(`<p>${renderInlineMarkdownPure(trimmed)}</p>`);
  }
  closeLists();
  if (inCode && codeBuffer.length > 0) {
    htmlParts.push(`<pre><code>${escapeHtmlPure(codeBuffer.join('\n'))}</code></pre>`);
  }

  const baseName = stripExtension(fileName);
  const convertedName = `${baseName}.html`;
  const docTitle = escapeHtmlPure(baseName);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.7; max-width: 820px; margin: 2.5rem auto; padding: 0 1.25rem; color: #0f172a; background: #ffffff; }
    pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9em; background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; }
    pre code { background: transparent; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #0ea5e9; margin: 1rem 0; padding: 0.25rem 1rem; color: #475569; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
  </style>
</head>
<body>
${htmlParts.join('\n')}
</body>
</html>
`;

  return {
    convertedName,
    mimeType: 'text/html;charset=utf-8',
    buffer: encodeUtf8(html),
    previewDataUrl: makeDocumentBadgeSvgUrl('HTML5', convertedName, `${htmlParts.length} semantic blocks`),
    textContent: html
  };
}

function sanitizeXmlTagPure(tag: string): string {
  const cleaned = tag.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `n_${cleaned}`;
}

function jsonValueToXmlPure(key: string, val: any, indentLevel: number): string {
  const pad = '  '.repeat(indentLevel);
  const tag = sanitizeXmlTagPure(key);
  if (val === null || val === undefined) return `${pad}<${tag} />`;
  if (Array.isArray(val)) {
    if (val.length === 0) return `${pad}<${tag} />`;
    return val.map((item) => jsonValueToXmlPure(tag, item, indentLevel)).join('\n');
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val);
    if (entries.length === 0) return `${pad}<${tag} />`;
    let attrsStr = '';
    const innerParts: string[] = [];
    for (const [childKey, childVal] of entries) {
      if (childKey === '@attributes' && childVal && typeof childVal === 'object') {
        attrsStr = Object.entries(childVal)
          .map(([ak, av]) => ` ${sanitizeXmlTagPure(ak)}="${escapeXmlPure(String(av))}"`)
          .join('');
      } else if (childKey === '#text') {
        innerParts.push(`${pad}  ${escapeXmlPure(String(childVal))}`);
      } else {
        innerParts.push(jsonValueToXmlPure(childKey, childVal, indentLevel + 1));
      }
    }
    if (innerParts.length === 0) return `${pad}<${tag}${attrsStr} />`;
    return `${pad}<${tag}${attrsStr}>\n${innerParts.join('\n')}\n${pad}</${tag}>`;
  }
  return `${pad}<${tag}>${escapeXmlPure(String(val))}</${tag}>`;
}

export function jsonToXmlPure(fileName: string, raw: string): WorkerPayloadResult {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON syntax in "${fileName}". Please check quotes and braces.`);
  }
  let bodyXml = '';
  if (Array.isArray(parsed)) {
    bodyXml = `<root>\n${parsed.map((item) => jsonValueToXmlPure('item', item, 1)).join('\n')}\n</root>`;
  } else if (parsed && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    bodyXml = keys.length === 1 ? jsonValueToXmlPure(keys[0], parsed[keys[0]], 0) : jsonValueToXmlPure('root', parsed, 0);
  } else {
    bodyXml = jsonValueToXmlPure('root', parsed, 0);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${bodyXml}\n`;
  const convertedName = `${stripExtension(fileName)}.xml`;
  return {
    convertedName,
    mimeType: 'application/xml;charset=utf-8',
    buffer: encodeUtf8(xml),
    previewDataUrl: makeDocumentBadgeSvgUrl('XML', convertedName, `${xml.split('\n').length} XML lines`),
    textContent: xml
  };
}

export function parseCsvMatrixPure(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const clean = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function flattenJsonObjectPure(obj: any, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (obj === null || obj === undefined) {
    if (prefix) out[prefix] = '';
    return out;
  }
  if (typeof obj !== 'object' || obj instanceof Date) {
    out[prefix || 'value'] = String(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    out[prefix || 'value'] = JSON.stringify(obj);
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0 && prefix) {
    out[prefix] = '';
    return out;
  }
  for (const key of keys) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenJsonObjectPure(val, nextKey, out);
    } else if (Array.isArray(val)) {
      out[nextKey] = JSON.stringify(val);
    } else {
      out[nextKey] = val === null || val === undefined ? '' : String(val);
    }
  }
  return out;
}

export function jsonToCsvPure(fileName: string, raw: string): WorkerPayloadResult {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON syntax in "${fileName}".`);
  }
  let items: any[] = [];
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]) && parsed[k].length > 0);
    items = firstArrayKey && Object.keys(parsed).length <= 3 ? parsed[firstArrayKey] : [parsed];
  } else {
    throw new Error('JSON root must be an object or array of objects.');
  }
  if (items.length === 0) throw new Error('JSON array contains zero records.');

  const flatRows = items.map((item) => flattenJsonObjectPure(item));
  const headerSet = new Set<string>();
  for (const r of flatRows) for (const k of Object.keys(r)) headerSet.add(k);
  const headers = Array.from(headerSet);

  const escapeCsvCell = (val: string) => {
    const safe = val.replace(/"/g, '""');
    return /[",\r\n]/.test(safe) ? `"${safe}"` : safe;
  };
  const csv = [
    headers.map(escapeCsvCell).join(','),
    ...flatRows.map((r) => headers.map((h) => escapeCsvCell(r[h] ?? '')).join(','))
  ].join('\r\n');

  const convertedName = `${stripExtension(fileName)}.csv`;
  return {
    convertedName,
    mimeType: 'text/csv;charset=utf-8',
    buffer: encodeUtf8(csv),
    previewDataUrl: makeDocumentBadgeSvgUrl('CSV', convertedName, `${flatRows.length} rows · ${headers.length} columns`),
    textContent: csv
  };
}

export function csvToJsonPure(fileName: string, raw: string): WorkerPayloadResult {
  const matrix = parseCsvMatrixPure(raw);
  if (matrix.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }
  const headers = matrix[0].map((h, i) => (h.trim() ? h.trim() : `column_${i + 1}`));
  const records = matrix.slice(1).map((row) => {
    const obj: Record<string, string | number | boolean | null> = {};
    headers.forEach((h, i) => {
      const cell = (row[i] ?? '').trim();
      if (cell === '') obj[h] = null;
      else if (cell === 'true') obj[h] = true;
      else if (cell === 'false') obj[h] = false;
      else if (/^-?\d+(\.\d+)?$/.test(cell) && cell.length < 16) obj[h] = Number(cell);
      else obj[h] = cell;
    });
    return obj;
  });
  const json = JSON.stringify(records, null, 2);
  const convertedName = `${stripExtension(fileName)}.json`;
  return {
    convertedName,
    mimeType: 'application/json;charset=utf-8',
    buffer: encodeUtf8(json),
    previewDataUrl: makeDocumentBadgeSvgUrl('JSON', convertedName, `${records.length} objects · ${headers.length} fields`),
    textContent: json
  };
}

export function pdfToBase64Pure(fileName: string, buffer: ArrayBuffer): WorkerPayloadResult {
  const base64 = arrayBufferToBase64Pure(buffer);
  const dataUri = `data:application/pdf;base64,${base64}`;
  const convertedName = `${stripExtension(fileName)}.base64.txt`;
  return {
    convertedName,
    mimeType: 'text/plain;charset=utf-8',
    buffer: encodeUtf8(dataUri),
    previewDataUrl: makeDocumentBadgeSvgUrl('BASE64', convertedName, `${base64.length.toLocaleString()} base64 chars`),
    textContent: dataUri
  };
}

/**
 * Pure PDF-Lib Structural Transforms in Worker
 */
export async function processPdfLibInWorker(
  toolId: string,
  fileName: string,
  buffer: ArrayBuffer
): Promise<WorkerPayloadResult> {
  const baseName = stripExtension(fileName);

  if (toolId === 'pdf-metadata-editor') {
    const pdfDoc = await PDFDocument.load(buffer);
    pdfDoc.setTitle(baseName);
    pdfDoc.setAuthor('Mimage Local Engine');
    pdfDoc.setSubject('Cleaned Document');
    pdfDoc.setKeywords(['pdf', 'cleaned', 'local']);
    pdfDoc.setProducer('Mimage Client-Side Architecture');
    pdfDoc.setCreator('Mimage (https://fixpdf.org/)');
    pdfDoc.setModificationDate(new Date());
    const out = await pdfDoc.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    const convertedName = `${baseName}-sanitized.pdf`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, 'Metadata scrubbed')
    };
  }

  if (toolId === 'pdf-page-numberer') {
    const pdfDoc = await PDFDocument.load(buffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const total = pages.length;
    for (let i = 0; i < total; i++) {
      const page = pages[i];
      const { width } = page.getSize();
      const text = `Page ${i + 1} of ${total}`;
      const textWidth = font.widthOfTextAtSize(text, 9);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: 25,
        size: 9,
        font,
        color: rgb(0.2, 0.25, 0.3)
      });
    }
    const out = await pdfDoc.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    const convertedName = `${baseName}-numbered.pdf`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, `${total} page(s) numbered`)
    };
  }

  if (toolId === 'pdf-flatten') {
    const pdfDoc = await PDFDocument.load(buffer);
    try {
      const form = pdfDoc.getForm();
      if (form) form.flatten();
    } catch {
      // ignore if no interactive form fields exist
    }
    const out = await pdfDoc.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    const convertedName = `${baseName}-flattened.pdf`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, 'Form fields flattened')
    };
  }

  if (toolId === 'pdf-page-reorder') {
    const srcDoc = await PDFDocument.load(buffer);
    const newDoc = await PDFDocument.create();
    const total = srcDoc.getPageCount();
    const indices: number[] = [];
    for (let i = total - 1; i >= 0; i--) indices.push(i);
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => newDoc.addPage(p));
    const out = await newDoc.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    const convertedName = `${baseName}-reverse.pdf`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, `${total} pages reversed`)
    };
  }

  if (toolId === 'pdf-2-up-handout') {
    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();
    if (totalPages === 0) throw new Error('The uploaded PDF contains zero pages.');
    const outDoc = await PDFDocument.create();
    const [sheetW, sheetH] = [PageSizes.Letter[1], PageSizes.Letter[0]];
    const margin = 18;
    const slotW = (sheetW - margin * 3) / 2;
    const slotH = sheetH - margin * 2;

    for (let i = 0; i < totalPages; i += 2) {
      const outPage = outDoc.addPage([sheetW, sheetH]);
      const indices = i + 1 < totalPages ? [i, i + 1] : [i];
      const embedded = await outDoc.embedPdf(srcDoc, indices);
      embedded.forEach((embPage, slotIdx) => {
        const scale = Math.min(slotW / embPage.width, slotH / embPage.height);
        const drawW = embPage.width * scale;
        const drawH = embPage.height * scale;
        const slotX = margin + slotIdx * (slotW + margin);
        outPage.drawPage(embPage, {
          x: slotX + (slotW - drawW) / 2,
          y: margin + (slotH - drawH) / 2,
          width: drawW,
          height: drawH
        });
      });
    }
    const out = await outDoc.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    const convertedName = `${baseName}-2up-handout.pdf`;
    const note = `${totalPages} pages -> ${outDoc.getPageCount()} 2-up sheets`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, note),
      note
    };
  }

  throw new WorkerFallbackRequired(`Unsupported pdf-lib operation in worker: ${toolId}`);
}

/**
 * jsPDF Document Generation in Worker: markdown-to-pdf, txt-to-pdf, json-to-pdf, csv-to-pdf
 */
function buildPaginatedPdfBufferPure(
  baseName: string,
  suffix: string,
  blocks: { text: string; size?: number; bold?: boolean; mono?: boolean; indent?: number; gapBefore?: number; gapAfter?: number }[]
): WorkerPayloadResult {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const marginY = 52;
  let y = marginY;

  for (const block of blocks) {
    if (block.gapBefore) y += block.gapBefore;
    const size = block.size || 10.5;
    const indent = block.indent || 0;
    const lineHeight = size * 1.42;

    doc.setFont(block.mono ? 'courier' : 'helvetica', block.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(22, 30, 46);

    const maxW = pageW - marginX * 2 - indent;
    const wrapped: string[] = doc.splitTextToSize(block.text || ' ', maxW);

    for (const line of wrapped) {
      if (y + lineHeight > pageH - marginY) {
        doc.addPage();
        y = marginY;
        doc.setFont(block.mono ? 'courier' : 'helvetica', block.bold ? 'bold' : 'normal');
        doc.setFontSize(size);
      }
      doc.text(line, marginX + indent, y);
      y += lineHeight;
    }
    if (block.gapAfter) y += block.gapAfter;
  }

  const pageCount = doc.getNumberOfPages();
  const ab = doc.output('arraybuffer') as ArrayBuffer;
  const convertedName = `${baseName}${suffix}.pdf`;
  const note = `${pageCount} paginated page(s)`;
  return {
    convertedName,
    mimeType: 'application/pdf',
    buffer: ab,
    previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, note),
    note
  };
}

export function processJsPdfTextToolInWorker(
  toolId: string,
  fileName: string,
  rawText: string
): WorkerPayloadResult {
  const baseName = stripExtension(fileName);

  if (toolId === 'markdown-to-pdf') {
    if (!rawText.trim()) throw new Error('The Markdown file is empty.');
    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const blocks: Parameters<typeof buildPaginatedPdfBufferPure>[2] = [];
    let inCode = false;
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (trimmed.startsWith('```')) {
        inCode = !inCode;
        continue;
      }
      if (inCode) {
        blocks.push({ text: rawLine || ' ', size: 9.2, mono: true, indent: 12 });
        continue;
      }
      if (!trimmed) {
        blocks.push({ text: ' ', size: 6, gapAfter: 2 });
        continue;
      }
      if (/^#{1}\s+/.test(trimmed)) {
        blocks.push({ text: trimmed.replace(/^#\s+/, ''), size: 20, bold: true, gapBefore: 8, gapAfter: 6 });
      } else if (/^#{2}\s+/.test(trimmed)) {
        blocks.push({ text: trimmed.replace(/^##\s+/, ''), size: 15.5, bold: true, gapBefore: 6, gapAfter: 4 });
      } else if (/^#{3,6}\s+/.test(trimmed)) {
        blocks.push({ text: trimmed.replace(/^#{3,6}\s+/, ''), size: 12.5, bold: true, gapBefore: 4, gapAfter: 3 });
      } else if (/^>\s+/.test(trimmed)) {
        blocks.push({ text: `| ${trimmed.replace(/^>\s+/, '')}`, size: 10.5, indent: 14, gapAfter: 3 });
      } else if (/^[-*+]\s+/.test(trimmed)) {
        const clean = trimmed.replace(/^[-*+]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1');
        blocks.push({ text: `• ${clean}`, size: 10.5, indent: 14, gapAfter: 2 });
      } else if (/^\d+\.\s+/.test(trimmed)) {
        blocks.push({
          text: trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1'),
          size: 10.5,
          indent: 14,
          gapAfter: 2
        });
      } else if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
        blocks.push({ text: '────────────────────────────────────────────────────────────────', size: 9, gapBefore: 4, gapAfter: 4 });
      } else {
        const clean = trimmed
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/__(.*?)__/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        blocks.push({ text: clean, size: 10.5, gapAfter: 4 });
      }
    }
    return buildPaginatedPdfBufferPure(baseName, '-markdown', blocks);
  }

  if (toolId === 'txt-to-pdf') {
    if (!rawText.trim()) throw new Error('The text file is empty.');
    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const blocks: Parameters<typeof buildPaginatedPdfBufferPure>[2] = [
      { text: fileName, size: 14, bold: true, gapAfter: 8 },
      ...lines.map((line) => ({ text: line || ' ', size: 10, mono: false, gapAfter: 1 }))
    ];
    return buildPaginatedPdfBufferPure(baseName, '', blocks);
  }

  if (toolId === 'json-to-pdf') {
    let formatted = rawText;
    try {
      formatted = JSON.stringify(JSON.parse(rawText), null, 2);
    } catch {
      throw new Error(`Invalid JSON syntax in "${fileName}".`);
    }
    const blocks: Parameters<typeof buildPaginatedPdfBufferPure>[2] = [
      { text: `${fileName} (Formatted JSON)`, size: 13, bold: true, gapAfter: 8 },
      ...formatted.split('\n').map((line) => ({ text: line || ' ', size: 8.8, mono: true }))
    ];
    return buildPaginatedPdfBufferPure(baseName, '-json', blocks);
  }

  if (toolId === 'csv-to-pdf') {
    const rows = parseCsvMatrixPure(rawText);
    if (rows.length === 0) throw new Error('The CSV file contains no rows.');
    const maxCols = Math.min(12, Math.max(...rows.map((r) => r.length)));
    const doc = new jsPDF({ orientation: maxCols > 5 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 32;
    const tableW = pageW - margin * 2;
    const colW = tableW / Math.max(1, maxCols);
    const cellPad = 5;
    let y = 42;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(fileName, margin, y);
    y += 18;

    const drawRow = (cells: string[], isHeader: boolean) => {
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setFontSize(isHeader ? 8.5 : 8);
      const wrappedCols: string[][] = [];
      let maxLines = 1;
      for (let c = 0; c < maxCols; c++) {
        const val = (cells[c] ?? '').toString();
        const lines: string[] = doc.splitTextToSize(val || ' ', Math.max(20, colW - cellPad * 2));
        wrappedCols.push(lines.slice(0, 6));
        if (wrappedCols[c].length > maxLines) maxLines = wrappedCols[c].length;
      }
      const rowH = Math.max(18, maxLines * 10.5 + cellPad * 2);
      if (y + rowH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      if (isHeader) {
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, y, tableW, rowH, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, tableW, rowH, 'S');
        doc.setTextColor(30, 41, 59);
      }
      doc.setDrawColor(203, 213, 225);
      for (let c = 0; c < maxCols; c++) {
        const x = margin + c * colW;
        doc.rect(x, y, colW, rowH, 'S');
        doc.text(wrappedCols[c], x + cellPad, y + cellPad + 8);
      }
      y += rowH;
    };

    drawRow(rows[0], true);
    for (let r = 1; r < rows.length; r++) drawRow(rows[r], false);

    const ab = doc.output('arraybuffer') as ArrayBuffer;
    const convertedName = `${baseName}-table.pdf`;
    const note = `${rows.length} rows · ${maxCols} cols`;
    return {
      convertedName,
      mimeType: 'application/pdf',
      buffer: ab,
      previewDataUrl: makeDocumentBadgeSvgUrl('PDF', convertedName, note),
      note
    };
  }

  throw new WorkerFallbackRequired(`Unsupported jsPDF text tool in worker: ${toolId}`);
}
