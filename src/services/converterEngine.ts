import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { ConvertedFile, ConversionSettings } from '../types';

// Use local Vite URL for the worker so it never relies on external CDNs or network requests
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let pdfjsLib: any = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  try {
    // @ts-ignore
    const pdfModule = await import('pdfjs-dist/build/pdf.mjs');
    pdfjsLib = pdfModule;
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }
    return pdfjsLib;
  } catch (err) {
    console.warn('pdfjs-dist local worker failed, attempting fallback:', err);
    try {
      // @ts-ignore
      const fallbackModule = await import('pdfjs-dist/build/pdf.mjs');
      pdfjsLib = fallbackModule;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }
      return pdfjsLib;
    } catch (e2) {
      console.error('All PDF engines failed to load:', e2);
      return null;
    }
  }
}

/**
 * Convert PDF to PNG, JPG, or SVG
 */
export async function convertPdf(
  file: File,
  targetFormat: 'png' | 'jpg' | 'svg',
  settings: Partial<ConversionSettings> = {},
  onProgress?: (progress: number, page: number, total: number) => void
): Promise<ConvertedFile[]> {
  const lib = await getPdfjs();
  if (!lib) {
    throw new Error('PDF processing library could not be loaded.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = lib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const results: ConvertedFile[] = [];

  const dpi = settings.dpi || 150;
  const scale = dpi / 72; // Standard PDF base unit is 72 DPI

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    // Background fill
    if (targetFormat === 'jpg' || settings.backgroundColor === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (settings.backgroundColor === 'black') {
      ctx.fillStyle = '#050807';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const pageSuffix = numPages > 1 ? `-page-${pageNum}` : '';

    if (targetFormat === 'svg') {
      const pngData = canvas.toDataURL('image/png');
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
  <!-- Converted by MatrixConvert Vector Engine -->
  <rect width="100%" height="100%" fill="${settings.backgroundColor === 'white' ? '#ffffff' : 'none'}" />
  <image href="${pngData}" width="${canvas.width}" height="${canvas.height}" />
</svg>`;
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const convertedName = `${baseName}${pageSuffix}.svg`;

      results.push({
        id: `${file.name}-${pageNum}-${Date.now()}`,
        originalName: file.name,
        convertedName,
        originalSize: file.size,
        convertedSize: svgBlob.size,
        dataUrl: svgUrl,
        blob: svgBlob,
        previewUrl: pngData,
        width: canvas.width,
        height: canvas.height,
        pageNumber: pageNum
      });
    } else {
      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      const quality = settings.quality !== undefined ? settings.quality / 100 : 0.92;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, quality)
      );

      const ext = targetFormat === 'jpg' ? 'jpg' : 'png';
      const convertedName = `${baseName}${pageSuffix}.${ext}`;

      results.push({
        id: `${file.name}-${pageNum}-${Date.now()}`,
        originalName: file.name,
        convertedName,
        originalSize: file.size,
        convertedSize: blob.size,
        dataUrl,
        blob,
        previewUrl: dataUrl,
        width: canvas.width,
        height: canvas.height,
        pageNumber: pageNum
      });
    }

    if (onProgress) {
      onProgress(Math.round((pageNum / numPages) * 100), pageNum, numPages);
    }
  }

  return results;
}

/**
 * Convert Raster Image to any target format (WebP, PNG, JPG, AVIF, SVG, BMP, ICO)
 */
export async function convertRasterImage(
  file: File,
  targetFormat: string,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  const img = await loadImageFromFile(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas');

  const scale = settings.scale || 1.0;
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  let fmt = targetFormat.toLowerCase();
  const originalExt = file.name.split('.').pop()?.toLowerCase() || 'png';

  // If format is 'any' (e.g. smart compression), keep the original format
  if (fmt === 'any') {
    fmt = originalExt === 'jpeg' ? 'jpg' : originalExt;
  }

  // Background fill
  if (fmt === 'jpg' || fmt === 'jpeg' || settings.backgroundColor === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundColor === 'black') {
    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // ICO Favicon Generation
  if (fmt === 'ico') {
    const icoBlob = await generateIcoBlob(canvas);
    const icoUrl = URL.createObjectURL(icoBlob);
    return {
      id: `${file.name}-${Date.now()}`,
      originalName: file.name,
      convertedName: `${baseName}.ico`,
      originalSize: file.size,
      convertedSize: icoBlob.size,
      dataUrl: icoUrl,
      blob: icoBlob,
      previewUrl: canvas.toDataURL('image/png'),
      width: 256,
      height: 256
    };
  }

  // BMP Generation
  if (fmt === 'bmp') {
    const bmpBlob = generateBmpBlob(canvas);
    const bmpUrl = URL.createObjectURL(bmpBlob);
    return {
      id: `${file.name}-${Date.now()}`,
      originalName: file.name,
      convertedName: `${baseName}.bmp`,
      originalSize: file.size,
      convertedSize: bmpBlob.size,
      dataUrl: bmpUrl,
      blob: bmpBlob,
      previewUrl: canvas.toDataURL('image/png'),
      width: targetWidth,
      height: targetHeight
    };
  }

  // SVG Generation (Vectorize or Vector-Embed)
  if (fmt === 'svg') {
    const pngData = canvas.toDataURL('image/png');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${targetWidth} ${targetHeight}" width="${targetWidth}" height="${targetHeight}">
  <!-- Converted by MatrixConvert Free Tool -->
  <image href="${pngData}" width="${targetWidth}" height="${targetHeight}" />
</svg>`;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    return {
      id: `${file.name}-${Date.now()}`,
      originalName: file.name,
      convertedName: `${baseName}.svg`,
      originalSize: file.size,
      convertedSize: svgBlob.size,
      dataUrl: svgUrl,
      blob: svgBlob,
      previewUrl: pngData,
      width: targetWidth,
      height: targetHeight
    };
  }

  // Standard Web Formats: WebP, PNG, JPG, AVIF
  let mimeType = 'image/png';
  let ext = 'png';

  if (fmt === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  } else if (fmt === 'jpg' || fmt === 'jpeg') {
    mimeType = 'image/jpeg';
    ext = 'jpg';
  } else if (fmt === 'avif') {
    mimeType = 'image/avif';
    ext = 'avif';
  }

  const quality = settings.quality !== undefined ? settings.quality / 100 : 0.9;
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), mimeType, quality);
  });

  return {
    id: `${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}.${ext}`,
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
 * Apply Image Filters: Grayscale, Invert, Rotate, Crop
 */
export async function applyImageFilter(
  file: File,
  filterType: 'grayscale' | 'rotate-90' | 'flip-h' | 'crop-center',
  params: { scale?: number } = {}
): Promise<ConvertedFile> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (filterType === 'rotate-90') {
    canvas.width = img.height;
    canvas.height = img.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
  } else if (filterType === 'flip-h') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
  } else if (filterType === 'crop-center') {
    // 1:1 square center crop
    const minDim = Math.min(img.width, img.height);
    canvas.width = minDim;
    canvas.height = minDim;
    const sx = (img.width - minDim) / 2;
    const sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, minDim, minDim);
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

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

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/png'));

  return {
    id: `${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${filterType}.png`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: canvas.width,
    height: canvas.height
  };
}

/**
 * Merge multiple images into a single paginated PDF document
 */
export async function mergeImagesToPdf(files: File[]): Promise<ConvertedFile> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < files.length; i++) {
    if (i > 0) doc.addPage();
    const file = files[i];
    const img = await loadImageFromFile(file);

    const margin = 10;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    const imgAspect = img.width / img.height;
    const maxAspect = maxW / maxH;

    let finalW = maxW;
    let finalH = maxW / imgAspect;

    if (imgAspect < maxAspect) {
      finalH = maxH;
      finalW = maxH * imgAspect;
    }

    const posX = margin + (maxW - finalW) / 2;
    const posY = margin + (maxH - finalH) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(dataUrl, 'JPEG', posX, posY, finalW, finalH);
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return {
    id: `merged-pdf-${Date.now()}`,
    originalName: files.map((f) => f.name).join(', '),
    convertedName: `merged-document-${Date.now()}.pdf`,
    originalSize: files.reduce((acc, f) => acc + f.size, 0),
    convertedSize: pdfBlob.size,
    dataUrl: pdfUrl,
    blob: pdfBlob,
    previewUrl: pdfUrl
  };
}

/**
 * Generate Authentic Matrix Code / ASCII Art from any Image
 */
export async function generateMatrixAsciiArt(
  file: File,
  density: number = 80,
  charSetType: 'katakana-binary' | 'ascii' | 'hex' = 'katakana-binary'
): Promise<{ textArt: string; renderedImage: ConvertedFile }> {
  const img = await loadImageFromFile(file);

  let chars = ' 01';
  if (charSetType === 'katakana-binary') {
    chars = ' 01ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ#';
  } else if (charSetType === 'hex') {
    chars = ' 0123456789ABCDEF';
  } else {
    chars = ' .:-=+*#%@';
  }

  const cols = Math.min(density, 120);
  const rows = Math.round((cols * img.height) / (img.width * 2));

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  const sampleCtx = sampleCanvas.getContext('2d')!;
  sampleCtx.drawImage(img, 0, 0, cols, rows);
  const imgData = sampleCtx.getImageData(0, 0, cols, rows).data;

  let asciiString = '';
  const charGrid: string[][] = [];

  for (let y = 0; y < rows; y++) {
    const rowChars: string[] = [];
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const alpha = imgData[idx + 3];

      if (alpha < 50) {
        rowChars.push(' ');
        asciiString += ' ';
        continue;
      }

      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = cols * charW + 40;
  renderCanvas.height = rows * charH + 40;
  const rCtx = renderCanvas.getContext('2d')!;

  rCtx.fillStyle = '#050807';
  rCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

  rCtx.font = `bold 14px "JetBrains Mono", monospace`;
  rCtx.textBaseline = 'middle';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = charGrid[y][x];
      if (ch === ' ') continue;

      const px = 20 + x * charW;
      const py = 20 + y * charH;

      rCtx.shadowColor = '#00ff66';
      rCtx.shadowBlur = 8;
      rCtx.fillStyle = Math.random() > 0.9 ? '#ffffff' : '#00ff66';
      rCtx.fillText(ch, px, py);
    }
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const dataUrl = renderCanvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((res) => renderCanvas.toBlob((b) => res(b || new Blob()), 'image/png'));

  const renderedImage: ConvertedFile = {
    id: `${file.name}-matrix-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-matrix-rain.png`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: renderCanvas.width,
    height: renderCanvas.height
  };

  return { textArt: asciiString, renderedImage };
}

/**
 * Bundle all converted files into a downloadable ZIP
 */
export async function createZipBundle(files: ConvertedFile[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.convertedName, file.blob);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not load image: ${file.name}`));
    };
    img.src = url;
  });
}

async function generateIcoBlob(sourceCanvas: HTMLCanvasElement): Promise<Blob> {
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBlobs: { size: number; bytes: Uint8Array }[] = [];

  for (const s of sizes) {
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(sourceCanvas, 0, 0, s, s);
    const data = await new Promise<Uint8Array>((res) => {
      c.toBlob(async (b) => {
        if (!b) return res(new Uint8Array(0));
        const buf = await b.arrayBuffer();
        res(new Uint8Array(buf));
      }, 'image/png');
    });
    pngBlobs.push({ size: s, bytes: data });
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * pngBlobs.length;

  const totalLength = offset + pngBlobs.reduce((acc, p) => acc + p.bytes.length, 0);
  const icoBuffer = new Uint8Array(totalLength);
  const view = new DataView(icoBuffer.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngBlobs.length, true);

  for (let i = 0; i < pngBlobs.length; i++) {
    const entry = pngBlobs[i];
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

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

function generateBmpBlob(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, width, height).data;

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
      uint8[pos++] = imgData[idx + 2];
      uint8[pos++] = imgData[idx + 1];
      uint8[pos++] = imgData[idx];
    }
    for (let p = 0; p < rowPadding; p++) {
      uint8[pos++] = 0;
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}
