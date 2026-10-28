import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

function toPdfBlob(bytes: Uint8Array): Blob {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([buffer], { type: 'application/pdf' });
}

// Helper to get pdfjs-dist dynamically for rendering previews and text extraction
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
    console.error('Failed to load pdfjs in advanced engine:', err);
    return null;
  }
}

/**
 * 1. Render all pages of a PDF to lightweight image previews (Data URLs)
 */
export async function renderPdfThumbnails(
  file: File,
  maxPages: number = 20,
  scale: number = 0.5
): Promise<{ pageNumber: number; dataUrl: string; width: number; height: number }[]> {
  const lib = await getPdfjs();
  if (!lib) throw new Error('PDF viewer engine not loaded');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
  const count = Math.min(pdfDoc.numPages, maxPages);
  const thumbnails: { pageNumber: number; dataUrl: string; width: number; height: number }[] = [];

  for (let i = 1; i <= count; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbnails.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    });
  }

  return thumbnails;
}

/**
 * 2. Fill & Sign PDF: Stamp signature and optional fields onto PDF
 */
export interface SignatureStamp {
  pageNumber: number; // 1-indexed
  dataUrl: string; // PNG base64
  xPercent: number; // 0 - 100 from left
  yPercent: number; // 0 - 100 from top of visual preview
  widthPercent: number; // 0 - 100 width of page
  heightPercent: number; // 0 - 100 height of page
}

export async function stampPdfSignature(
  file: File,
  stamps: SignatureStamp[],
  extraText?: { pageNumber: number; text: string; xPercent: number; yPercent: number; fontSize?: number }[]
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const stamp of stamps) {
    const pageIdx = stamp.pageNumber - 1;
    if (pageIdx < 0 || pageIdx >= pages.length) continue;
    const page = pages[pageIdx];
    const { width: pWidth, height: pHeight } = page.getSize();

    // Convert dataUrl to bytes
    const base64Data = stamp.dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const embeddedImg = await pdfDoc.embedPng(imageBytes);

    // Calculate dimensions in PDF points
    const drawWidth = (stamp.widthPercent / 100) * pWidth;
    const drawHeight = (stamp.heightPercent / 100) * pHeight;
    const drawX = (stamp.xPercent / 100) * pWidth;
    // PDF coordinate system (0,0) is bottom-left
    const drawY = pHeight - ((stamp.yPercent / 100) * pHeight) - drawHeight;

    page.drawImage(embeddedImg, {
      x: Math.max(0, drawX),
      y: Math.max(0, drawY),
      width: Math.max(10, drawWidth),
      height: Math.max(10, drawHeight)
    });
  }

  // Draw any additional text (e.g. date stamp, signer name)
  if (extraText && extraText.length > 0) {
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (const item of extraText) {
      const pageIdx = item.pageNumber - 1;
      if (pageIdx < 0 || pageIdx >= pages.length) continue;
      const page = pages[pageIdx];
      const { width: pWidth, height: pHeight } = page.getSize();
      const fontSize = item.fontSize || 12;
      const drawX = (item.xPercent / 100) * pWidth;
      const drawY = pHeight - ((item.yPercent / 100) * pHeight) - fontSize;

      page.drawText(item.text, {
        x: Math.max(0, drawX),
        y: Math.max(0, drawY),
        size: fontSize,
        font: helvetica,
        color: rgb(0.1, 0.1, 0.1)
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 3. Crop PDF Margins
 * Margins in percentages: { top, right, bottom, left } e.g. 5 means 5% of width/height
 */
export async function cropPdfMargins(
  file: File,
  margins: { top: number; right: number; bottom: number; left: number },
  applyToAll: boolean = true,
  targetPageNum: number = 1
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    if (!applyToAll && idx !== targetPageNum - 1) return;

    const { width, height } = page.getSize();
    const leftMargin = (margins.left / 100) * width;
    const rightMargin = (margins.right / 100) * width;
    const topMargin = (margins.top / 100) * height;
    const bottomMargin = (margins.bottom / 100) * height;

    const newX = leftMargin;
    const newY = bottomMargin;
    const newWidth = Math.max(10, width - leftMargin - rightMargin);
    const newHeight = Math.max(10, height - topMargin - bottomMargin);

    page.setCropBox(newX, newY, newWidth, newHeight);
    page.setMediaBox(newX, newY, newWidth, newHeight);
  });

  const pdfBytes = await pdfDoc.save();
  return toPdfBlob(pdfBytes);
}

/**
 * Auto-detect non-white margins from a rendered HTMLCanvasElement
 */
export function detectCanvasWhiteMargins(canvas: HTMLCanvasElement): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { top: 5, right: 5, bottom: 5, left: 5 };

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Function to check if a pixel is effectively non-white / content
  function isContent(x: number, y: number): boolean {
    const idx = (y * width + x) * 4;
    const r = imgData[idx];
    const g = imgData[idx + 1];
    const b = imgData[idx + 2];
    const a = imgData[idx + 3];
    if (a < 30) return false;
    // Consider anything darker than #f5f5f5 as content
    return r < 245 || g < 245 || b < 245;
  }

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;

  // Scan Top
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x += 3) {
      if (isContent(x, y)) {
        top = y;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Scan Bottom
  found = false;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x += 3) {
      if (isContent(x, y)) {
        bottom = y;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Scan Left
  found = false;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y += 3) {
      if (isContent(x, y)) {
        left = x;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Scan Right
  found = false;
  for (let x = width - 1; x >= 0; x--) {
    for (let y = 0; y < height; y += 3) {
      if (isContent(x, y)) {
        right = x;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Leave a safe 1.5% breathing margin so content isn't flush
  const paddingPercent = 1.5;
  const topPct = Math.max(0, Math.min(40, (top / height) * 100 - paddingPercent));
  const bottomPct = Math.max(0, Math.min(40, ((height - bottom) / height) * 100 - paddingPercent));
  const leftPct = Math.max(0, Math.min(40, (left / width) * 100 - paddingPercent));
  const rightPct = Math.max(0, Math.min(40, ((width - right) / width) * 100 - paddingPercent));

  return {
    top: Math.round(topPct * 10) / 10,
    right: Math.round(rightPct * 10) / 10,
    bottom: Math.round(bottomPct * 10) / 10,
    left: Math.round(leftPct * 10) / 10
  };
}

/**
 * 4. Merge multiple PDF documents into one
 */
export async function mergePdfDocuments(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 5. Split PDF / Extract selected pages
 */
export async function extractPdfPages(
  file: File,
  pageNumbers: number[] // 1-indexed
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const zeroIndexed = pageNumbers.map((p) => p - 1).filter((p) => p >= 0 && p < sourcePdf.getPageCount());
  const copiedPages = await newPdf.copyPages(sourcePdf, zeroIndexed);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 6. Delete PDF Pages
 */
export async function deletePdfPages(
  file: File,
  pagesToDelete: number[] // 1-indexed
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const totalPages = sourcePdf.getPageCount();
  const pagesToKeep: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (!pagesToDelete.includes(i)) {
      pagesToKeep.push(i - 1);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Cannot delete all pages of a document.');
  }

  const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 7. Rotate PDF Pages
 */
export async function rotatePdfPages(
  file: File,
  angleDegrees: number, // 90, 180, 270
  applyToAll: boolean = true,
  targetPageNum: number = 1
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    if (!applyToAll && idx !== targetPageNum - 1) return;
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + angleDegrees) % 360));
  });

  const pdfBytes = await pdfDoc.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 8. Watermark PDF Document
 */
export async function watermarkPdfDocument(
  file: File,
  watermarkText: string,
  options: {
    color?: string; // hex
    opacity?: number; // 0 - 1
    angle?: number; // degrees
    fontSize?: number;
  } = {}
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const opacity = options.opacity !== undefined ? options.opacity : 0.35;
  const angle = options.angle !== undefined ? options.angle : -45;
  const fontSize = options.fontSize || 48;

  // Simple color mapping
  let r = 0.8, g = 0.2, b = 0.2; // default red
  if (options.color === 'slate') { r = 0.4; g = 0.4; b = 0.4; }
  else if (options.color === 'sky') { r = 0.05; g = 0.65; b = 0.95; }
  else if (options.color === 'gray') { r = 0.6; g = 0.6; b = 0.6; }

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      font,
      size: fontSize,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(angle)
    });
  });

  const pdfBytes = await pdfDoc.save();
  return toPdfBlob(pdfBytes);
}

/**
 * 9. Extract Text from PDF Pages
 */
export async function extractPdfText(
  file: File
): Promise<{ fullText: string; pageBreakdown: { page: number; text: string }[] }> {
  const lib = await getPdfjs();
  if (!lib) throw new Error('PDF engine not loaded');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';
  const pageBreakdown: { page: number; text: string }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map((item: any) => item.str || '').join(' ');
    const cleaned = pageStrings.replace(/\s+/g, ' ').trim();

    pageBreakdown.push({ page: i, text: cleaned });
    fullText += `--- Page ${i} ---\n${cleaned}\n\n`;
  }

  return { fullText, pageBreakdown };
}
