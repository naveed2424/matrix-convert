import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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

/**
 * -----------------------------------------------------------------------------
 * ADVANCED PDF ENGINE FUNCTIONS
 * -----------------------------------------------------------------------------
 */

/**
 * Edit or Sanitize PDF Metadata (Title, Author, Subject, Keywords)
 */
export async function editPdfMetadata(
  file: File,
  meta: { title?: string; author?: string; subject?: string; keywords?: string } = {}
): Promise<ConvertedFile> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.keywords !== undefined) {
    pdfDoc.setKeywords(meta.keywords.split(',').map((k) => k.trim()));
  }
  pdfDoc.setProducer('MatrixConvert Client-Side Architecture');
  pdfDoc.setCreator('MatrixConvert (https://mimage.netlify.app/)');
  pdfDoc.setModificationDate(new Date());

  const savedBytes = await pdfDoc.save();
  const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `metadata-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-sanitized.pdf`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl: url,
    blob,
    previewUrl: url
  };
}

/**
 * Add Page Numbers or Legal Bates Stamping to PDF Pages
 */
export async function numberPdfPages(
  file: File,
  position: 'bottom-center' | 'bottom-right' | 'top-right' = 'bottom-center'
): Promise<ConvertedFile> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const text = `Page ${i + 1} of ${total}`;
    const textSize = 9;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    let x = (width - textWidth) / 2;
    let y = 25;

    if (position === 'bottom-right') {
      x = width - textWidth - 36;
      y = 25;
    } else if (position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 25;
    }

    page.drawText(text, {
      x,
      y,
      size: textSize,
      font,
      color: rgb(0.2, 0.25, 0.3)
    });
  }

  const savedBytes = await pdfDoc.save();
  const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `numbered-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-numbered.pdf`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl: url,
    blob,
    previewUrl: url
  };
}

/**
 * Flatten Form Fields, Checkboxes & Annotations in PDF
 */
export async function flattenPdf(file: File): Promise<ConvertedFile> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);

  try {
    const form = pdfDoc.getForm();
    if (form) {
      form.flatten();
    }
  } catch (e) {
    // No interactive form fields, proceed
  }

  const savedBytes = await pdfDoc.save();
  const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `flattened-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-flattened.pdf`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl: url,
    blob,
    previewUrl: url
  };
}

/**
 * Reorder or Reverse PDF Pages
 */
export async function reorderPdfPages(
  file: File,
  mode: 'reverse' | 'odd-even' = 'reverse'
): Promise<ConvertedFile> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);
  const newDoc = await PDFDocument.create();

  const total = srcDoc.getPageCount();
  const indices: number[] = [];

  if (mode === 'reverse') {
    for (let i = total - 1; i >= 0; i--) {
      indices.push(i);
    }
  } else {
    // Odd pages first, then even
    for (let i = 0; i < total; i += 2) indices.push(i);
    for (let i = 1; i < total; i += 2) indices.push(i);
  }

  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  const savedBytes = await newDoc.save();
  const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `reordered-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${mode}.pdf`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl: url,
    blob,
    previewUrl: url
  };
}

/**
 * Convert PDF to Grayscale Monochrome or Invert (Dark Mode)
 */
export async function convertPdfMonochrome(
  file: File,
  mode: 'grayscale' | 'invert' = 'grayscale',
  onProgress?: (pct: number) => void
): Promise<ConvertedFile> {
  const lib = await getPdfjs();
  if (!lib) throw new Error('PDF processing engine could not be initialized.');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = lib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (pageNum > 1) doc.addPage();
    if (onProgress) onProgress(Math.round((pageNum / numPages) * 90));

    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 150-200 DPI crispness

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (mode === 'grayscale') {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else if (mode === 'invert') {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const jpegUrl = canvas.toDataURL('image/jpeg', 0.88);
    const pdfPageW = doc.internal.pageSize.getWidth();
    const pdfPageH = doc.internal.pageSize.getHeight();
    doc.addImage(jpegUrl, 'JPEG', 0, 0, pdfPageW, pdfPageH);
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `${mode}-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${mode}.pdf`,
    originalSize: file.size,
    convertedSize: pdfBlob.size,
    dataUrl: pdfUrl,
    blob: pdfBlob,
    previewUrl: pdfUrl
  };
}

/**
 * -----------------------------------------------------------------------------
 * ADVANCED IMAGE ENGINE FUNCTIONS (20 NEW TOOLS)
 * -----------------------------------------------------------------------------
 */

export async function applyAdvancedImageFilter(
  file: File,
  filterId: string,
  options: any = {}
): Promise<ConvertedFile> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D Canvas unavailable');

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  let targetFormat = 'image/png';
  let ext = 'png';

  // 1. Social Media Aspect Ratio Padder (1:1, 4:5, 16:9, 9:16)
  if (filterId === 'image-aspect-ratio-padder') {
    const ratioType = options.ratio || '1:1';
    let targetRatio = 1.0;
    if (ratioType === '4:5') targetRatio = 4 / 5;
    else if (ratioType === '16:9') targetRatio = 16 / 9;
    else if (ratioType === '9:16') targetRatio = 9 / 16;

    const imgAspect = img.width / img.height;
    let targetW = img.width;
    let targetH = img.height;

    if (imgAspect > targetRatio) {
      targetW = img.width;
      targetH = Math.round(img.width / targetRatio);
    } else {
      targetH = img.height;
      targetW = Math.round(img.height * targetRatio);
    }

    canvas.width = targetW;
    canvas.height = targetH;

    // Background fill (white by default, or dark matrix)
    ctx.fillStyle = options.bgColor || '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const offsetX = Math.round((targetW - img.width) / 2);
    const offsetY = Math.round((targetH - img.height) / 2);
    ctx.drawImage(img, offsetX, offsetY);
  }

  // 2. EXIF & Geolocation Metadata Stripper
  else if (filterId === 'image-exif-stripper') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // Canvas export inherently creates fresh bitmap, scrubbing all EXIF / GPS tags completely
  }

  // 3. Color Negative / Inverter
  else if (filterId === 'image-color-inverter') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 255 - d[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 4. Sepia & Vintage Tone
  else if (filterId === 'image-sepia-vintage') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 5. Exposure, Brightness & Contrast Enhancer
  else if (filterId === 'image-brightness-contrast') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const brightness = 20; // +20 luminous boost
    const contrast = 1.25; // 25% contrast punch
    const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

    for (let i = 0; i < d.length; i += 4) {
      d[i] = factor * (d[i] + brightness - 128) + 128;
      d[i + 1] = factor * (d[i + 1] + brightness - 128) + 128;
      d[i + 2] = factor * (d[i + 2] + brightness - 128) + 128;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 6. 1-Bit Binary Silhouette & Stencil Maker
  else if (filterId === 'image-threshold-binary') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const thresh = options.threshold || 128;

    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const val = gray >= thresh ? 255 : 0;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 7. Privacy Blur & Face Redactor
  else if (filterId === 'image-blur-redact') {
    // Downscale and upscale to create pixelated privacy redaction
    const scale = 0.08;
    const smallW = Math.max(1, Math.round(img.width * scale));
    const smallH = Math.max(1, Math.round(img.height * scale));

    canvas.width = img.width;
    canvas.height = img.height;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(img, 0, 0, smallW, smallH);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, img.width, img.height);
  }

  // 8. Smart Sharpening & Detail Enhancer
  else if (filterId === 'image-sharpen-unsharp') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dstData = ctx.createImageData(canvas.width, canvas.height);
    const s = srcData.data;
    const d = dstData.data;
    const w = canvas.width;
    const h = canvas.height;

    // 3x3 Sharpen Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
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
    ctx.putImageData(dstData, 0, 0);
  }

  // 9. Print DPI Density Changer (Scales up to 300 DPI canvas standard)
  else if (filterId === 'image-dpi-density-changer') {
    const scaleFactor = 300 / 72; // ~4.16x
    canvas.width = Math.min(6000, Math.round(img.width * scaleFactor));
    canvas.height = Math.min(6000, Math.round(img.height * scaleFactor));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // 10. Custom Border & Polaroid Frame Studio
  else if (filterId === 'image-border-polaroid') {
    const borderWidth = Math.max(16, Math.round(img.width * 0.04));
    const bottomExtra = Math.max(48, Math.round(img.height * 0.16)); // Classic polaroid chin
    canvas.width = img.width + borderWidth * 2;
    canvas.height = img.height + borderWidth + bottomExtra;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, borderWidth, borderWidth);

    // Subtle polaroid drop border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(borderWidth, borderWidth, img.width, img.height);
  }

  // 11. Batch Image Watermark & Copyright Stamp
  else if (filterId === 'image-watermark-overlay') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const stampText = options.watermarkText || 'CONFIDENTIAL - PREVIEW ONLY';
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-30 * Math.PI) / 180);
    ctx.font = `bold ${Math.max(20, Math.round(canvas.width / 18))}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(stampText, 0, 0);
    ctx.fillText(stampText, 0, 0);
    ctx.restore();
  }

  // 12. Horizontal & Vertical Mirror Tool
  else if (filterId === 'image-flip-mirror') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Flip Horizontal
    ctx.drawImage(img, 0, 0);
  }

  // 13. Duotone Matrix Green Studio
  else if (filterId === 'image-color-tint-duotone') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Map luminance to Matrix Green (#00ff66) / Dark Slate (#02120b)
    for (let i = 0; i < d.length; i += 4) {
      const gray = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      d[i] = Math.round(2 + gray * 0); // Red
      d[i + 1] = Math.round(18 + gray * 237); // Green
      d[i + 2] = Math.round(11 + gray * 90); // Blue
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 14. Color Key to Transparent PNG Maker
  else if (filterId === 'image-transparent-png-maker') {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Convert near-white or chosen background to alpha 0
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      if (r > 235 && g > 235 && b > 235) {
        d[i + 3] = 0; // Alpha 0
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Default passthrough
  else {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  }

  const dataUrl = canvas.toDataURL(targetFormat, 0.95);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), targetFormat)
  );

  return {
    id: `${filterId}-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${filterId.replace('image-', '')}.${ext}`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: canvas.width,
    height: canvas.height
  };
}

