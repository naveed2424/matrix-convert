import JSZip from 'jszip';
import QRCode from 'qrcode';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { PDFDocument } from 'pdf-lib';
import { ConvertedFile } from '../types';

function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image file. This format may not be supported natively by your browser.'));
    };
    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 1. Exact Target-KB Image Compressor
 * Binary searches JPEG/WebP quality and gently scales dimensions if necessary
 * while honestly reporting when a target size cannot be met cleanly.
 */
export async function compressImageToTargetSize(
  file: File,
  targetKb: number,
  outputFormat: 'jpeg' | 'jpg' | 'webp' = 'jpeg',
  allowAspectSafeScale: boolean = true
): Promise<ConvertedFile & { hitTarget: boolean; finalQuality: number; qualityUsed: number; finalScale: number }> {
  const img = await loadImage(file);
  const targetBytes = Math.max(5 * 1024, targetKb * 1024);
  const isWebp = outputFormat === 'webp';
  const mime = isWebp ? 'image/webp' : 'image/jpeg';
  const ext = isWebp ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const renderAt = async (scale: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> => {
    const w = Math.max(16, Math.round(img.naturalWidth * scale));
    const h = Math.max(16, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    if (!isWebp) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), mime, quality)
    );
    return { blob, w, h };
  };

  let bestBlob: Blob | null = null;
  let bestW = img.naturalWidth;
  let bestH = img.naturalHeight;
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

  if ((!bestBlob || bestBlob.size > targetBytes) && allowAspectSafeScale) {
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
    const minRes = await renderAt(allowAspectSafeScale ? 0.25 : 1.0, 0.15);
    bestBlob = minRes.blob;
    bestW = minRes.w;
    bestH = minRes.h;
    bestQ = 0.15;
    bestScale = allowAspectSafeScale ? 0.25 : 1.0;
  }

  const hitTarget = bestBlob.size <= targetBytes;
  const dataUrl = await blobToDataUrl(bestBlob);
  const roundedQ = Math.round(bestQ * 100);

  return {
    id: `${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${targetKb}kb.${ext}`,
    originalSize: file.size,
    convertedSize: bestBlob.size,
    dataUrl,
    blob: bestBlob,
    previewUrl: dataUrl,
    width: bestW,
    height: bestH,
    hitTarget,
    finalQuality: roundedQ,
    qualityUsed: roundedQ,
    finalScale: Math.round(bestScale * 100),
    note: hitTarget
      ? `Target ${targetKb} KB achieved at ${roundedQ}% quality and ${Math.round(bestScale * 100)}% scale.`
      : `Minimum reachable size without excessive visual distortion was ${Math.round(bestBlob.size / 1024)} KB (target was ${targetKb} KB).`
  };
}

/**
 * 2. Safe SVG Sanitizer & Optimizer (XSS-protected)
 */
export function sanitizeAndOptimizeSvg(
  rawSvg: string,
  options: { removeComments?: boolean; removeMetadata?: boolean; roundDecimals?: number } = {}
): {
  optimizedSvg: string;
  originalBytes: number;
  optimizedBytes: number;
  removedUnsafeTags: number;
} {
  const originalBytes = new Blob([rawSvg]).size;
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid SVG markup: XML parsing failed.');
  }

  const svgRoot = doc.documentElement;
  if (!svgRoot || svgRoot.tagName.toLowerCase() !== 'svg') {
    throw new Error('File does not contain a valid root <svg> element.');
  }

  let removedUnsafeTags = 0;

  // Strip dangerous executable elements (XSS defense)
  const dangerousSelectors = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'audio', 'video'];
  dangerousSelectors.forEach((sel) => {
    doc.querySelectorAll(sel).forEach((el) => {
      el.remove();
      removedUnsafeTags++;
    });
  });

  // Strip metadata / editor bloat
  if (options.removeMetadata !== false) {
    doc.querySelectorAll('metadata, title:empty, desc:empty').forEach((el) => el.remove());
  }

  // Strip event handlers (on*) and javascript: URIs from all elements
  const allElements = Array.from(doc.querySelectorAll('*'));
  for (const el of allElements) {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const nameLower = attr.name.toLowerCase();
      const valLower = attr.value.trim().toLowerCase();
      if (nameLower.startsWith('on') || valLower.startsWith('javascript:') || valLower.startsWith('data:text/html')) {
        el.removeAttribute(attr.name);
        removedUnsafeTags++;
      } else if (
        options.removeMetadata !== false &&
        (nameLower.startsWith('inkscape:') ||
          nameLower.startsWith('sodipodi:') ||
          nameLower.startsWith('data-name'))
      ) {
        el.removeAttribute(attr.name);
      }
    }
  }

  const serializer = new XMLSerializer();
  let output = serializer.serializeToString(svgRoot);

  if (options.removeComments !== false) {
    output = output.replace(/<!--[\s\S]*?-->/g, '');
  }

  const decimals = options.roundDecimals ?? 2;
  if (decimals >= 0 && decimals <= 4) {
    output = output.replace(/(\d+\.\d{3,})/g, (match) => {
      const num = parseFloat(match);
      return Number.isFinite(num) ? num.toFixed(decimals).replace(/\.?0+$/, '') : match;
    });
  }

  output = output.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
  const optimizedBytes = new Blob([output]).size;

  return {
    optimizedSvg: output,
    originalBytes,
    optimizedBytes,
    removedUnsafeTags
  };
}

/**
 * 3. Dominant Color Extractor & Palette Generator (HEX, RGB, HSL)
 */
export interface PaletteSwatch {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
}

export async function extractImagePalette(file: File, maxColors: number = 6): Promise<PaletteSwatch[]> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * size));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Quantize RGB bins cleanly
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalValid = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    const r = Math.round(data[i] / 24) * 24;
    const g = Math.round(data[i + 1] / 24) * 24;
    const b = Math.round(data[i + 2] / 24) * 24;
    const key = `${r},${g},${b}`;
    totalValid++;
    const existing = buckets.get(key);
    if (existing) {
      existing.r += data[i];
      existing.g += data[i + 1];
      existing.b += data[i + 2];
      existing.count++;
    } else {
      buckets.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  return sorted.map((b) => {
    const avgR = Math.min(255, Math.round(b.r / b.count));
    const avgG = Math.min(255, Math.round(b.g / b.count));
    const avgB = Math.min(255, Math.round(b.b / b.count));
    const hex = `#${[avgR, avgG, avgB].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    const hsl = rgbToHslString(avgR, avgG, avgB);
    return {
      hex,
      rgb: `rgb(${avgR}, ${avgG}, ${avgB})`,
      hsl,
      percentage: totalValid > 0 ? Math.round((b.count / totalValid) * 100) : 0
    };
  });
}

export function rgbToHslString(r: number, g: number, b: number): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * 4. Animated GIF Maker using gifenc
 */
export async function createAnimatedGifFromImages(
  files: File[],
  options: { width?: number; delayMs?: number; repeat?: number; maxColors?: number } = {}
): Promise<ConvertedFile> {
  if (files.length === 0) throw new Error('Select at least 1 image.');
  const targetWidth = Math.max(64, Math.min(960, options.width || 480));
  const delay = Math.max(40, options.delayMs || 350);
  const repeat = options.repeat ?? 0;
  const maxColors = options.maxColors || 128;

  const firstImg = await loadImage(files[0]);
  const targetHeight = Math.max(64, Math.round((firstImg.naturalHeight / firstImg.naturalWidth) * targetWidth));

  const encoder = GIFEncoder();
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');

  for (const file of files) {
    const img = await loadImage(file);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    // Contain-fit frame without distortion
    const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    const dx = Math.round((targetWidth - dw) / 2);
    const dy = Math.round((targetHeight - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);

    const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const palette = quantize(data, maxColors);
    const index = applyPalette(data, palette);
    encoder.writeFrame(index, targetWidth, targetHeight, { palette, delay, repeat });
  }

  encoder.finish();
  const rawBytes = encoder.bytes();
  const safeBuffer = new Uint8Array(rawBytes).buffer;
  const gifBlob = new Blob([safeBuffer], { type: 'image/gif' });
  const dataUrl = await blobToDataUrl(gifBlob);
  const totalOrigSize = files.reduce((acc, f) => acc + f.size, 0);

  return {
    id: `gif-${Date.now()}`,
    originalName: files.map((f) => f.name).join(', '),
    convertedName: `mimage-animation-${targetWidth}px.gif`,
    originalSize: totalOrigSize,
    convertedSize: gifBlob.size,
    dataUrl,
    blob: gifBlob,
    previewUrl: dataUrl,
    width: targetWidth,
    height: targetHeight
  };
}

/**
 * 5. GIF Compressor (Re-encodes animated or static GIF with smaller dimensions & quantized palette)
 * Uses browser ImageDecoder if available to preserve animation frames safely, with clean static fallback.
 */
export async function compressGifFile(
  file: File,
  options: { scalePercent?: number; maxColors?: number; frameDropStep?: number } = {}
): Promise<ConvertedFile & { framesProcessed: number }> {
  const scaleFactor = Math.max(0.25, Math.min(1, (options.scalePercent || 75) / 100));
  const maxColors = Math.max(16, Math.min(256, options.maxColors || 96));
  const step = Math.max(1, options.frameDropStep || 1);

  const encoder = GIFEncoder();
  let width = 320;
  let height = 240;
  let framesProcessed = 0;

  if (typeof (window as any).ImageDecoder !== 'undefined') {
    try {
      const arrayBuf = await file.arrayBuffer();
      const decoder = new (window as any).ImageDecoder({ data: arrayBuf, type: 'image/gif' });
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const frameCount = track ? track.frameCount : 1;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      for (let i = 0; i < frameCount; i += step) {
        const result = await decoder.decode({ frameIndex: i });
        const frame = result.image;
        if (i === 0) {
          width = Math.max(32, Math.round(frame.displayWidth * scaleFactor));
          height = Math.max(32, Math.round(frame.displayHeight * scaleFactor));
          canvas.width = width;
          canvas.height = height;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frame, 0, 0, width, height);
        const delayMs = Math.max(30, Math.round(((frame.duration || 100000) / 1000) * step));
        frame.close();

        const { data } = ctx.getImageData(0, 0, width, height);
        const palette = quantize(data, maxColors);
        const index = applyPalette(data, palette);
        encoder.writeFrame(index, width, height, { palette, delay: delayMs, repeat: 0 });
        framesProcessed++;
      }
      decoder.close();
    } catch (err) {
      console.warn('ImageDecoder GIF track fallback:', err);
    }
  }

  if (framesProcessed === 0) {
    // Fallback single frame decode via standard Image
    const img = await loadImage(file);
    width = Math.max(32, Math.round(img.naturalWidth * scaleFactor));
    height = Math.max(32, Math.round(img.naturalHeight * scaleFactor));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = quantize(data, maxColors);
    const index = applyPalette(data, palette);
    encoder.writeFrame(index, width, height, { palette, delay: 100 });
    framesProcessed = 1;
  }

  encoder.finish();
  const bytes = encoder.bytes();
  const safeBuffer = new Uint8Array(bytes).buffer;
  const blob = new Blob([safeBuffer], { type: 'image/gif' });
  const dataUrl = await blobToDataUrl(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `gif-comp-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-compressed.gif`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width,
    height,
    framesProcessed,
    note: framesProcessed > 1 ? `Re-encoded ${framesProcessed} animated frames.` : 'Single frame fallback used (ImageDecoder unsupported in this browser).'
  };
}

/**
 * 6. Favicon Package & App Icon ZIP Generator
 */
export async function generateIconPackageZip(
  file: File,
  mode: 'favicon' | 'app-icons'
): Promise<{
  zipBlob: Blob;
  zipName: string;
  generatedFiles: { name: string; size: number; dataUrl: string; width: number }[];
  htmlSnippet: string;
}> {
  const img = await loadImage(file);
  const zip = new JSZip();
  const generatedFiles: { name: string; size: number; dataUrl: string; width: number }[] = [];

  const specs =
    mode === 'favicon'
      ? [
          { name: 'favicon-16x16.png', size: 16 },
          { name: 'favicon-32x32.png', size: 32 },
          { name: 'favicon-48x48.png', size: 48 },
          { name: 'apple-touch-icon.png', size: 180 },
          { name: 'android-chrome-192x192.png', size: 192 },
          { name: 'android-chrome-512x512.png', size: 512 }
        ]
      : [
          { name: 'ios/icon-60@2x-120x120.png', size: 120 },
          { name: 'ios/icon-60@3x-180x180.png', size: 180 },
          { name: 'ios/AppStore-1024x1024.png', size: 1024 },
          { name: 'android/mipmap-mdpi-48x48.png', size: 48 },
          { name: 'android/mipmap-hdpi-72x72.png', size: 72 },
          { name: 'android/mipmap-xhdpi-96x96.png', size: 96 },
          { name: 'android/mipmap-xxhdpi-144x144.png', size: 144 },
          { name: 'android/mipmap-xxxhdpi-192x192.png', size: 192 },
          { name: 'android/PlayStore-512x512.png', size: 512 }
        ];

  for (const spec of specs) {
    const canvas = document.createElement('canvas');
    canvas.width = spec.size;
    canvas.height = spec.size;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Center crop-to-square safely or contain proportionally
    const scale = Math.min(spec.size / img.naturalWidth, spec.size / img.naturalHeight);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    const dx = Math.round((spec.size - dw) / 2);
    const dy = Math.round((spec.size - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    const dataUrl = canvas.toDataURL('image/png');
    zip.file(spec.name, blob);
    generatedFiles.push({ name: spec.name, size: blob.size, dataUrl, width: spec.size });
  }

  if (mode === 'favicon') {
    // Also add 32x32 favicon.ico wrapper
    const c32 = document.createElement('canvas');
    c32.width = 32;
    c32.height = 32;
    const ctx32 = c32.getContext('2d')!;
    ctx32.drawImage(img, 0, 0, 32, 32);
    const png32 = await new Promise<Blob>((r) => c32.toBlob((b) => r(b!), 'image/png'));
    const pngBytes = new Uint8Array(await png32.arrayBuffer());
    const header = new ArrayBuffer(22);
    const view = new DataView(header);
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);
    view.setUint8(6, 32);
    view.setUint8(7, 32);
    view.setUint8(8, 0);
    view.setUint8(9, 0);
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngBytes.length, true);
    view.setUint32(18, 22, true);
    const icoBlob = new Blob([header, pngBytes], { type: 'image/x-icon' });
    zip.file('favicon.ico', icoBlob);

    const manifest = JSON.stringify(
      {
        name: 'App Name',
        short_name: 'App',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      },
      null,
      2
    );
    zip.file('site.webmanifest', manifest);
  }

  const htmlSnippet = `<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />`;

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = mode === 'favicon' ? 'mimage-favicon-package.zip' : 'mimage-app-icons.zip';

  return { zipBlob, zipName, generatedFiles, htmlSnippet };
}

/**
 * 7. QR Code Generator (SVG & PNG)
 */
export async function generateQrCodeAssets(
  payload: string,
  options: { darkColor?: string; lightColor?: string; width?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' } = {}
): Promise<{ pngDataUrl: string; svgText: string; svgString: string }> {
  if (!payload.trim()) throw new Error('QR payload cannot be empty.');
  const dark = options.darkColor || '#0f172a';
  const light = options.lightColor || '#ffffff';
  const width = options.width || 512;
  const ecl = options.errorCorrectionLevel || 'M';

  const pngDataUrl = await QRCode.toDataURL(payload, {
    width,
    margin: 2,
    errorCorrectionLevel: ecl,
    color: { dark, light }
  });

  const svgString = await QRCode.toString(payload, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: ecl,
    color: { dark, light }
  });

  return { pngDataUrl, svgText: svgString, svgString };
}

/**
 * 8. High-Quality Image Upscaler (2x/3x/4x Multi-Step + Unsharp Convolution)
 * Transparently discloses interpolation math without fake "AI hallucination" claims.
 */
export async function upscaleImageLocally(
  file: File,
  factor: 2 | 3 | 4,
  sharpenAmount: number = 0.35
): Promise<ConvertedFile> {
  const img = await loadImage(file);
  const finalW = Math.min(6000, img.naturalWidth * factor);
  const finalH = Math.min(6000, img.naturalHeight * factor);

  const canvas = document.createElement('canvas');
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, finalW, finalH);

  // Subtle unsharp contrast pass
  if (sharpenAmount > 0 && finalW * finalH <= 16_000_000) {
    const imgData = ctx.getImageData(0, 0, finalW, finalH);
    const d = imgData.data;
    const copy = new Uint8ClampedArray(d);
    const amount = sharpenAmount;

    for (let y = 1; y < finalH - 1; y++) {
      for (let x = 1; x < finalW - 1; x++) {
        const idx = (y * finalW + x) * 4;
        for (let c = 0; c < 3; c++) {
          const avg =
            (copy[((y - 1) * finalW + x) * 4 + c] +
              copy[((y + 1) * finalW + x) * 4 + c] +
              copy[(y * finalW + (x - 1)) * 4 + c] +
              copy[(y * finalW + (x + 1)) * 4 + c]) /
            4;
          d[idx + c] = Math.min(255, Math.max(0, copy[idx + c] + (copy[idx + c] - avg) * amount));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
  const dataUrl = await blobToDataUrl(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `upscale-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${factor}x.png`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: finalW,
    height: finalH,
    note: `Resampled via browser bicubic interpolation + edge contrast sharpening (${factor}x). Does not synthesize missing photographic detail.`
  };
}

/**
 * 9. PDF Compressor (Structural Stream Optimization & Optional Raster Downsampling)
 */
export async function compressPdfInBrowser(
  file: File,
  mode: 'lossless-structure' | 'balanced-raster' | 'compact-raster'
): Promise<ConvertedFile & { savedPercent: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (mode === 'lossless-structure') {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.setProducer('Mimage Client PDF Optimizer');
    pdfDoc.setCreator('Mimage (https://fixpdf.org/)');
    const saved = await pdfDoc.save({ useObjectStreams: true });
    const safeBuffer = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;
    const blob = new Blob([safeBuffer], { type: 'application/pdf' });
    const dataUrl = URL.createObjectURL(blob);
    const savedPercent = file.size > 0 ? Math.round(((file.size - blob.size) / file.size) * 100) : 0;

    return {
      id: `pdf-opt-${Date.now()}`,
      originalName: file.name,
      convertedName: `${baseName}-optimized.pdf`,
      originalSize: file.size,
      convertedSize: blob.size,
      dataUrl,
      blob,
      previewUrl: '',
      savedPercent,
      note:
        savedPercent > 0
          ? 'Structural optimization stripped unused objects and enabled PDF object streams.'
          : 'This PDF is already tightly compressed structurally. Try Balanced or Compact mode to downsample embedded images.'
    };
  }

  // Raster compression mode: render pages via pdfjs-dist & rebuild with JPEG quality
  // @ts-ignore
  const workerUrlMod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  // @ts-ignore
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrlMod.default;
  }

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const dpi = mode === 'compact-raster' ? 96 : 144;
  const jpegQuality = mode === 'compact-raster' ? 0.55 : 0.72;
  const scale = dpi / 72;

  const outPdf = await PDFDocument.create();
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const jpgBlob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', jpegQuality));
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
    const jpgImg = await outPdf.embedJpg(jpgBytes);
    const origViewport = page.getViewport({ scale: 1.0 });
    const outPage = outPdf.addPage([origViewport.width, origViewport.height]);
    outPage.drawImage(jpgImg, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height
    });
  }

  outPdf.setProducer('Mimage Client PDF Compressor');
  const savedBytes = await outPdf.save({ useObjectStreams: true });
  const safeBuffer = savedBytes.buffer.slice(savedBytes.byteOffset, savedBytes.byteOffset + savedBytes.byteLength) as ArrayBuffer;
  const blob = new Blob([safeBuffer], { type: 'application/pdf' });
  const dataUrl = URL.createObjectURL(blob);
  const savedPercent = file.size > 0 ? Math.round(((file.size - blob.size) / file.size) * 100) : 0;

  return {
    id: `pdf-comp-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-compressed.pdf`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: '',
    savedPercent,
    note: `Re-encoded ${pdf.numPages} page(s) at ${dpi} DPI JPEG (flattens selectable text to reduce heavy scanned PDF file sizes).`
  };
}

/**
 * 10. All-in-one Image Optimization Studio Worker (Aspect-Safe Resize + Format + Quality + Rename + EXIF Strip)
 */
export async function optimizeStudioImage(
  file: File,
  options: {
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    quality?: number;
    maxWidth?: number;
    renamePrefix?: string;
    indexSuffix?: string;
  } = {}
): Promise<ConvertedFile> {
  const img = await loadImage(file);
  const targetFmt = options.format || 'webp';
  const q = Math.max(0.1, Math.min(1, (options.quality ?? 84) / 100));

  let targetW = img.naturalWidth;
  let targetH = img.naturalHeight;
  if (options.maxWidth && targetW > options.maxWidth) {
    const ratio = options.maxWidth / targetW;
    targetW = options.maxWidth;
    targetH = Math.max(1, Math.round(targetH * ratio));
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  if (targetFmt === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const desiredMime =
    targetFmt === 'avif'
      ? 'image/avif'
      : targetFmt === 'jpg'
      ? 'image/jpeg'
      : targetFmt === 'png'
      ? 'image/png'
      : 'image/webp';

  let blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b || new Blob()), desiredMime, q));
  let actualExt: string = targetFmt;
  let note: string | undefined;

  if (targetFmt === 'avif' && blob.type !== 'image/avif') {
    blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b || new Blob()), 'image/webp', q));
    actualExt = 'webp';
    note = 'Browser fell back from AVIF to WebP because native AVIF encoding is unavailable in this browser.';
  }

  const baseName = options.renamePrefix
    ? `${options.renamePrefix}${options.indexSuffix || ''}`
    : file.name.replace(/\.[^/.]+$/, '');

  const dataUrl = await blobToDataUrl(blob);

  return {
    id: `studio-${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    originalName: file.name,
    convertedName: `${baseName}.${actualExt}`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: targetW,
    height: targetH,
    note
  };
}

/**
 * 11. Aspect-Safe Social Media Resizer (Center Cover Crop or Contain Pad)
 */
export async function resizeForSocialPreset(
  file: File,
  targetWidth: number,
  targetHeight: number,
  options: {
    fit?: 'cover' | 'contain';
    backgroundColor?: string;
    format?: 'jpg' | 'png' | 'webp';
    quality?: number;
  } = {}
): Promise<ConvertedFile> {
  const img = await loadImage(file);
  const fit = options.fit || 'cover';
  const fmt = options.format || 'jpg';
  const quality = Math.max(0.2, Math.min(1, (options.quality ?? 92) / 100));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = options.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetWidth / targetHeight;

  if (fit === 'cover') {
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;

    if (imgRatio > targetRatio) {
      sw = img.naturalHeight * targetRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / targetRatio;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  } else {
    const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    const dx = Math.round((targetWidth - dw) / 2);
    const dy = Math.round((targetHeight - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  const mime = fmt === 'png' ? 'image/png' : fmt === 'webp' ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b || new Blob()), mime, quality));
  const dataUrl = await blobToDataUrl(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `social-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${targetWidth}x${targetHeight}.${fmt}`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: targetWidth,
    height: targetHeight
  };
}

/**
 * 12. Render a single PDF page cleanly to Canvas for OCR ingestion
 */
export async function renderSinglePdfPageToCanvas(
  file: File,
  pageNumber: number = 1,
  scale: number = 2.0
): Promise<{ canvas: HTMLCanvasElement; numPages: number }> {
  // @ts-ignore
  const workerUrlMod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  // @ts-ignore
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrlMod.default;
  }
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const safePage = Math.max(1, Math.min(doc.numPages, pageNumber));
  const page = await doc.getPage(safePage);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, numPages: doc.numPages };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
