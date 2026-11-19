import { jsPDF } from 'jspdf';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { ConvertedFile } from '../types';
import { getPdfjs, loadImageFromFile } from './converterEngine';

/**
 * -----------------------------------------------------------------------------
 * MIMAGE EXTRA CONVERTERS ENGINE (30 High-Demand PDF, LLM & File Converters)
 * Pure Browser-Local Processing using pdfjs-dist, pdf-lib, jsPDF, DOMParser & Canvas
 * -----------------------------------------------------------------------------
 */

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generates a crisp Matrix-themed SVG preview card for non-raster output files
 * (MD, JSON, HTML, RTF, CSV, PDF, TXT) so DedicatedToolPage result cards render cleanly.
 */
export function makeDocumentBadgePreview(extLabel: string, line1: string, line2 = ''): string {
  const safeExt = escapeXml(extLabel.toUpperCase().slice(0, 8));
  const safeL1 = escapeXml(line1.slice(0, 32));
  const safeL2 = escapeXml(line2.slice(0, 36));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050807"/>
      <stop offset="100%" stop-color="#0b1510"/>
    </linearGradient>
  </defs>
  <rect width="480" height="270" fill="url(#bg)"/>
  <rect x="16" y="16" width="448" height="238" rx="14" fill="none" stroke="#10b981" stroke-opacity="0.35" stroke-width="1.5"/>
  <rect x="176" y="48" width="128" height="44" rx="10" fill="#10b981" fill-opacity="0.16" stroke="#10b981" stroke-width="1.5"/>
  <text x="240" y="77" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="22" font-weight="700" fill="#34d399">${safeExt}</text>
  <text x="240" y="138" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">${safeL1}</text>
  <text x="240" y="166" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#94a3b8">${safeL2}</text>
  <text x="240" y="220" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="10" fill="#10b981" fill-opacity="0.8">MIMAGE · BROWSER-LOCAL ENGINE</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildTextResult(
  file: File,
  newExt: string,
  mimeType: string,
  content: string,
  badgeLabel: string,
  subtitle: string
): ConvertedFile {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const blob = new Blob([content], { type: mimeType });
  const dataUrl = URL.createObjectURL(blob);
  const convertedName = `${baseName}.${newExt}`;

  return {
    id: `${newExt}-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: makeDocumentBadgePreview(badgeLabel, convertedName, subtitle),
    textContent: content
  };
}

function toPdfBlobResult(bytes: Uint8Array, originalFile: File, suffixName: string, subtitle: string): ConvertedFile {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
  const convertedName = `${baseName}${suffixName}.pdf`;

  return {
    id: `pdf-${originalFile.name}-${Date.now()}`,
    originalName: originalFile.name,
    convertedName,
    originalSize: originalFile.size,
    convertedSize: blob.size,
    dataUrl: url,
    blob,
    previewUrl: makeDocumentBadgePreview('PDF', convertedName, subtitle)
  };
}

function jsPdfToResult(doc: jsPDF, originalFile: File, suffixName: string, subtitle: string): ConvertedFile {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
  const convertedName = `${baseName}${suffixName}.pdf`;

  return {
    id: `pdf-${originalFile.name}-${Date.now()}`,
    originalName: originalFile.name,
    convertedName,
    originalSize: originalFile.size,
    convertedSize: pdfBlob.size,
    dataUrl: url,
    blob: pdfBlob,
    previewUrl: makeDocumentBadgePreview('PDF', convertedName, subtitle)
  };
}

/**
 * -----------------------------------------------------------------------------
 * 1. STRUCTURED PDF TEXT EXTRACTION (Markdown, JSON, HTML, Word RTF, CSV)
 * -----------------------------------------------------------------------------
 */

interface PdfTextRun {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

interface ExtractedPdfPage {
  pageNumber: number;
  width: number;
  height: number;
  lines: { y: number; maxFontSize: number; runs: PdfTextRun[]; text: string }[];
  rawText: string;
}

async function extractPdfStructure(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<{ pages: ExtractedPdfPage[]; modalFontSize: number }> {
  const lib = await getPdfjs();
  if (!lib) throw new Error('PDF processing library could not be loaded.');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
  const numPages: number = pdfDoc.numPages;

  const fontSizeCounts = new Map<number, number>();
  const pages: ExtractedPdfPage[] = [];

  for (let p = 1; p <= numPages; p++) {
    onProgress?.(Math.round((p / numPages) * 85), `Parsing PDF layer page ${p} of ${numPages}...`);
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const runs: PdfTextRun[] = [];
    for (const item of textContent.items as any[]) {
      const str = typeof item.str === 'string' ? item.str : '';
      if (!str.trim()) continue;
      const tr = item.transform || [12, 0, 0, 12, 0, 0];
      const fontSize = Math.max(6, Math.round(Math.hypot(tr[0], tr[1]) || Math.abs(tr[3]) || 11));
      runs.push({
        str,
        x: tr[4] || 0,
        y: tr[5] || 0,
        width: item.width || str.length * fontSize * 0.5,
        fontSize
      });
      fontSizeCounts.set(fontSize, (fontSizeCounts.get(fontSize) || 0) + str.length);
    }

    // Cluster into visual lines top-to-bottom (higher Y is higher up on PDF page)
    runs.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4.5) return b.y - a.y;
      return a.x - b.x;
    });

    const lines: { y: number; maxFontSize: number; runs: PdfTextRun[]; text: string }[] = [];
    for (const run of runs) {
      const existing = lines.find((l) => Math.abs(l.y - run.y) <= Math.max(4, run.fontSize * 0.45));
      if (existing) {
        existing.runs.push(run);
        if (run.fontSize > existing.maxFontSize) existing.maxFontSize = run.fontSize;
      } else {
        lines.push({ y: run.y, maxFontSize: run.fontSize, runs: [run], text: '' });
      }
    }

    for (const line of lines) {
      line.runs.sort((a, b) => a.x - b.x);
      let joined = '';
      for (let i = 0; i < line.runs.length; i++) {
        const curr = line.runs[i];
        if (i > 0) {
          const prev = line.runs[i - 1];
          const gap = curr.x - (prev.x + prev.width);
          if (gap > curr.fontSize * 0.25 && !joined.endsWith(' ') && !curr.str.startsWith(' ')) {
            joined += ' ';
          }
        }
        joined += curr.str;
      }
      line.text = joined.replace(/\s+/g, ' ').trim();
    }

    const nonEmptyLines = lines.filter((l) => l.text.length > 0);
    pages.push({
      pageNumber: p,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      lines: nonEmptyLines,
      rawText: nonEmptyLines.map((l) => l.text).join('\n')
    });
  }

  let modalFontSize = 11;
  let bestCount = -1;
  for (const [sz, count] of fontSizeCounts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      modalFontSize = sz;
    }
  }

  return { pages, modalFontSize };
}

/**
 * Tool 1: PDF to Markdown (.md) — Ideal for LLM / RAG ingestion & knowledge bases
 */
export async function convertPdfToMarkdown(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const { pages, modalFontSize } = await extractPdfStructure(file, onProgress);
  const title = file.name.replace(/\.[^/.]+$/, '');
  const parts: string[] = [`# ${title}\n`];

  let totalLines = 0;
  for (const page of pages) {
    if (pages.length > 1) {
      parts.push(`\n<!-- Page ${page.pageNumber} -->\n`);
    }
    if (page.lines.length === 0) {
      parts.push(`_No selectable text layer found on page ${page.pageNumber} (this may be a scanned image; use OCR Text Extractor if needed)._\n`);
      continue;
    }

    for (const line of page.lines) {
      totalLines++;
      const t = line.text;
      if (line.maxFontSize >= modalFontSize * 1.45 && t.length < 140) {
        parts.push(`\n## ${t}\n`);
      } else if (line.maxFontSize >= modalFontSize * 1.18 && t.length < 120) {
        parts.push(`\n### ${t}\n`);
      } else if (/^[•·▪‣◦\-*]\s+/.test(t)) {
        parts.push(`- ${t.replace(/^[•·▪‣◦\-*]\s+/, '')}`);
      } else {
        parts.push(t);
      }
    }
  }

  if (totalLines === 0) {
    parts.push('\n> Notice: No embedded text layer was detected in this PDF. Try the OCR Text Extractor tool for scanned documents.\n');
  }

  const md = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  onProgress?.(100, 'Markdown generated');
  return buildTextResult(file, 'md', 'text/markdown;charset=utf-8', md, 'MD', `${pages.length} page(s) · LLM-ready Markdown`);
}

/**
 * Tool 2: PDF to JSON (.json) — Structured document schema for developers & RAG pipelines
 */
export async function convertPdfToJson(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const { pages, modalFontSize } = await extractPdfStructure(file, onProgress);
  const payload = {
    sourceFile: file.name,
    originalSizeBytes: file.size,
    pageCount: pages.length,
    detectedBodyFontSize: modalFontSize,
    generatedBy: 'Mimage Local PDF Engine',
    pages: pages.map((p) => {
      const words = p.rawText ? p.rawText.split(/\s+/).filter(Boolean).length : 0;
      return {
        pageNumber: p.pageNumber,
        dimensions: { width: p.width, height: p.height, unit: 'pt' },
        wordCount: words,
        characterCount: p.rawText.length,
        lines: p.lines.map((l) => ({ text: l.text, fontSize: l.maxFontSize })),
        text: p.rawText
      };
    })
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  onProgress?.(100, 'JSON compiled');
  return buildTextResult(file, 'json', 'application/json;charset=utf-8', jsonStr, 'JSON', `${pages.length} page(s) structured schema`);
}

/**
 * Tool 3: PDF to HTML (.html) — Semantic standalone webpage export
 */
export async function convertPdfToHtml(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const { pages, modalFontSize } = await extractPdfStructure(file, onProgress);
  const docTitle = escapeHtml(file.name.replace(/\.[^/.]+$/, ''));

  const sections = pages
    .map((p) => {
      const bodyHtml =
        p.lines.length === 0
          ? `<p class="empty">No embedded text layer found on page ${p.pageNumber}.</p>`
          : p.lines
              .map((l) => {
                const txt = escapeHtml(l.text);
                if (l.maxFontSize >= modalFontSize * 1.45 && l.text.length < 140) return `<h2>${txt}</h2>`;
                if (l.maxFontSize >= modalFontSize * 1.18 && l.text.length < 120) return `<h3>${txt}</h3>`;
                if (/^[•·▪‣◦\-*]\s+/.test(l.text)) return `<p class="bullet">&bull; ${escapeHtml(l.text.replace(/^[•·▪‣◦\-*]\s+/, ''))}</p>`;
                return `<p>${txt}</p>`;
              })
              .join('\n    ');

      return `  <section class="pdf-page" data-page="${p.pageNumber}">
    <header class="page-label">Page ${p.pageNumber} (${p.width}×${p.height}pt)</header>
    ${bodyHtml}
  </section>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.65; color: #0f172a; background: #f8fafc; max-width: 820px; margin: 2rem auto; padding: 0 1.25rem; }
    h1 { font-size: 1.75rem; margin-bottom: 1.5rem; }
    .pdf-page { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
    .page-label { font-family: monospace; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; margin-bottom: 1rem; }
    h2 { font-size: 1.25rem; margin-top: 1.1rem; color: #0f172a; }
    h3 { font-size: 1.05rem; margin-top: 0.9rem; color: #1e293b; }
    p { margin: 0.45rem 0; }
    .bullet { padding-left: 1rem; }
    .empty { color: #94a3b8; font-style: italic; }
  </style>
</head>
<body>
  <h1>${docTitle}</h1>
${sections}
</body>
</html>
`;
  onProgress?.(100, 'HTML built');
  return buildTextResult(file, 'html', 'text/html;charset=utf-8', html, 'HTML', `${pages.length} semantic page section(s)`);
}

function encodeRtfUnicode(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (str[i] === '\\' || str[i] === '{' || str[i] === '}') {
      out += '\\' + str[i];
    } else if (code < 128) {
      out += str[i];
    } else {
      const signed = code > 32767 ? code - 65536 : code;
      out += `\\u${signed}?`;
    }
  }
  return out;
}

/**
 * Tool 4: PDF to Word-Compatible RTF (.rtf)
 * Opens natively in Microsoft Word, LibreOffice Writer, Apple Pages & Google Docs.
 */
export async function convertPdfToWordRtf(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const { pages, modalFontSize } = await extractPdfStructure(file, onProgress);

  const chunks: string[] = [
    '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}{\\f1 Arial;}}\\fs22'
  ];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) chunks.push('\\page');

    if (page.lines.length === 0) {
      chunks.push(`\\pard\\i [Page ${page.pageNumber}: No selectable text layer detected — scanned image pages require OCR.]\\i0\\par`);
      continue;
    }

    for (const line of page.lines) {
      const encoded = encodeRtfUnicode(line.text);
      if (line.maxFontSize >= modalFontSize * 1.4 && line.text.length < 140) {
        chunks.push(`\\pard\\sa140\\b\\fs32 ${encoded}\\b0\\fs22\\par`);
      } else if (line.maxFontSize >= modalFontSize * 1.15 && line.text.length < 120) {
        chunks.push(`\\pard\\sa100\\b\\fs26 ${encoded}\\b0\\fs22\\par`);
      } else {
        chunks.push(`\\pard\\sa80\\fs22 ${encoded}\\par`);
      }
    }
  }

  chunks.push('}');
  const rtf = chunks.join('\n');
  onProgress?.(100, 'Word RTF generated');
  return buildTextResult(
    file,
    'rtf',
    'application/rtf',
    rtf,
    'RTF',
    `${pages.length} page(s) · Opens in MS Word`
  );
}

/**
 * Tool 5: PDF to CSV (.csv) — X/Y table column clustering
 */
export async function convertPdfToCsv(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const { pages } = await extractPdfStructure(file, onProgress);
  const rows: string[][] = [];

  for (const page of pages) {
    for (const line of page.lines) {
      // Group adjacent runs into cells separated by wide horizontal gaps (> 14 pt)
      const cells: string[] = [];
      let currentCell = '';
      for (let i = 0; i < line.runs.length; i++) {
        const curr = line.runs[i];
        if (i === 0) {
          currentCell = curr.str.trim();
        } else {
          const prev = line.runs[i - 1];
          const gap = curr.x - (prev.x + prev.width);
          if (gap > Math.max(12, curr.fontSize * 1.15)) {
            cells.push(currentCell.trim());
            currentCell = curr.str.trim();
          } else {
            currentCell += (gap > curr.fontSize * 0.2 ? ' ' : '') + curr.str.trim();
          }
        }
      }
      if (currentCell.trim()) cells.push(currentCell.trim());
      if (cells.length > 0) rows.push(cells);
    }
  }

  if (rows.length === 0) {
    rows.push(['Notice', 'No selectable text table detected in this PDF']);
  }

  const csv = rows
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  onProgress?.(100, 'CSV table extracted');
  return buildTextResult(file, 'csv', 'text/csv;charset=utf-8', csv, 'CSV', `${rows.length} row(s) extracted`);
}

/**
 * Tool 6: PDF to Base64 Data URI (.txt)
 */
export async function convertPdfToBase64(file: File): Promise<ConvertedFile> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  const dataUri = `data:application/pdf;base64,${base64}`;
  return buildTextResult(
    file,
    'base64.txt',
    'text/plain;charset=utf-8',
    dataUri,
    'BASE64',
    `${base64.length.toLocaleString()} base64 chars`
  );
}

/**
 * Tool 7: PDF 2-Up Handout / Booklet Merger (.pdf)
 * Places sequential pairs of pages side-by-side onto landscape US Letter sheets.
 */
export async function createTwoUpPdf(file: File): Promise<ConvertedFile> {
  const srcBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(srcBytes);
  const totalPages = srcDoc.getPageCount();
  if (totalPages === 0) throw new Error('The uploaded PDF contains zero pages.');

  const outDoc = await PDFDocument.create();
  const [sheetW, sheetH] = [PageSizes.Letter[1], PageSizes.Letter[0]]; // 792 x 612 pt Landscape
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
      const x = slotX + (slotW - drawW) / 2;
      const y = margin + (slotH - drawH) / 2;
      outPage.drawPage(embPage, { x, y, width: drawW, height: drawH });
    });
  }

  const outBytes = await outDoc.save();
  return toPdfBlobResult(
    outBytes,
    file,
    '-2up-handout',
    `${totalPages} pages -> ${outDoc.getPageCount()} 2-up sheets`
  );
}

/**
 * -----------------------------------------------------------------------------
 * 2. DOCUMENT / TEXT / CODE / VECTOR TO PDF CONVERTERS
 * -----------------------------------------------------------------------------
 */

function createPaginatedTextPdf(
  originalFile: File,
  blocks: { text: string; size?: number; bold?: boolean; mono?: boolean; indent?: number; gapBefore?: number; gapAfter?: number }[],
  suffix: string
): ConvertedFile {
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
  return jsPdfToResult(doc, originalFile, suffix, `${pageCount} paginated page(s)`);
}

/**
 * Tool 8: Markdown (.md) to PDF
 */
export async function convertMarkdownToPdf(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('The Markdown file is empty.');

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Parameters<typeof createPaginatedTextPdf>[1] = [];
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
      const clean = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1');
      blocks.push({ text: clean, size: 10.5, indent: 14, gapAfter: 2 });
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

  return createPaginatedTextPdf(file, blocks, '-markdown');
}

/**
 * Tool 9: HTML to PDF (Safe DOMParser -> clean semantic PDF pagination)
 */
export async function convertHtmlToPdf(file: File): Promise<ConvertedFile> {
  const rawHtml = await file.text();
  if (!rawHtml.trim()) throw new Error('The HTML file is empty.');

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(rawHtml, 'text/html');
  htmlDoc.querySelectorAll('script, style, noscript, iframe, object, embed').forEach((el) => el.remove());

  const blocks: Parameters<typeof createPaginatedTextPdf>[1] = [];
  const docTitle = htmlDoc.title?.trim();
  if (docTitle) {
    blocks.push({ text: docTitle, size: 19, bold: true, gapAfter: 8 });
  }

  const walkElements = (root: Element) => {
    for (const child of Array.from(root.children)) {
      const tag = child.tagName.toLowerCase();
      const txt = (child.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) continue;

      if (tag === 'h1') {
        blocks.push({ text: txt, size: 18, bold: true, gapBefore: 8, gapAfter: 5 });
      } else if (tag === 'h2') {
        blocks.push({ text: txt, size: 14.5, bold: true, gapBefore: 6, gapAfter: 4 });
      } else if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        blocks.push({ text: txt, size: 12, bold: true, gapBefore: 4, gapAfter: 3 });
      } else if (tag === 'pre' || tag === 'code') {
        blocks.push({ text: child.textContent || txt, size: 9, mono: true, indent: 12, gapAfter: 4 });
      } else if (tag === 'li') {
        blocks.push({ text: `• ${txt}`, size: 10.5, indent: 14, gapAfter: 2 });
      } else if (tag === 'blockquote') {
        blocks.push({ text: `| ${txt}`, size: 10.5, indent: 14, gapAfter: 4 });
      } else if (['p', 'tr', 'dt', 'dd', 'figcaption'].includes(tag)) {
        blocks.push({ text: txt, size: 10.5, gapAfter: 4 });
      } else if (child.children.length > 0) {
        walkElements(child);
      } else {
        blocks.push({ text: txt, size: 10.5, gapAfter: 4 });
      }
    }
  };

  if (htmlDoc.body) {
    walkElements(htmlDoc.body);
  }

  if (blocks.length === 0) {
    const fallback = (htmlDoc.body?.textContent || '').replace(/\s+/g, ' ').trim();
    if (!fallback) throw new Error('No readable text content found inside the HTML document.');
    blocks.push({ text: fallback, size: 10.5 });
  }

  return createPaginatedTextPdf(file, blocks, '-webpage');
}

/**
 * Tool 10: Plain Text (.txt) to PDF
 */
export async function convertTxtToPdf(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('The text file is empty.');

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Parameters<typeof createPaginatedTextPdf>[1] = [
    { text: file.name, size: 14, bold: true, gapAfter: 8 },
    ...lines.map((line) => ({ text: line || ' ', size: 10, mono: false, gapAfter: 1 }))
  ];

  return createPaginatedTextPdf(file, blocks, '');
}

/**
 * Tool 11: JSON to PDF (Pretty-printed monospace paginated PDF)
 */
export async function convertJsonToPdf(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  let formatted = raw;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    throw new Error(`Invalid JSON syntax in "${file.name}". Please validate brackets and quotes before converting.`);
  }

  const lines = formatted.split('\n');
  const blocks: Parameters<typeof createPaginatedTextPdf>[1] = [
    { text: `${file.name} (Formatted JSON)`, size: 13, bold: true, gapAfter: 8 },
    ...lines.map((line) => ({ text: line || ' ', size: 8.8, mono: true }))
  ];

  return createPaginatedTextPdf(file, blocks, '-json');
}

/**
 * RFC 4180 Compliant CSV Parser
 */
export function parseCsvMatrix(text: string): string[][] {
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

/**
 * Tool 12: CSV to PDF Table (Landscape grid with wrapped header & cells)
 */
export async function convertCsvToPdf(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  const rows = parseCsvMatrix(raw);
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
  doc.text(file.name, margin, y);
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
  for (let r = 1; r < rows.length; r++) {
    drawRow(rows[r], false);
  }

  return jsPdfToResult(doc, file, '-table', `${rows.length} rows · ${maxCols} cols`);
}

/**
 * Tool 13 & 14: WebP to PDF & SVG to PDF
 * Sanitizes inline scripts when input is SVG, rasterizes crisply at high scale, and compiles PDF via pdf-lib.
 */
export async function convertRasterOrSvgToPdf(files: File[], isSvg = false): Promise<ConvertedFile> {
  if (files.length === 0) throw new Error('No input files selected.');

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    let fileToLoad = file;
    if (isSvg) {
      const svgText = await file.text();
      const parser = new DOMParser();
      const svgDom = parser.parseFromString(svgText, 'image/svg+xml');
      svgDom.querySelectorAll('script, foreignObject').forEach((el) => el.remove());
      const cleanSvg = new XMLSerializer().serializeToString(svgDom);
      fileToLoad = new File([cleanSvg], file.name, { type: 'image/svg+xml' });
    }

    const img = await loadImageFromFile(fileToLoad);
    const scaleFactor = isSvg ? 2 : 1;
    const w = Math.max(1, Math.round(img.width * scaleFactor));
    const h = Math.max(1, Math.round(img.height * scaleFactor));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const embedded = await pdfDoc.embedPng(pngBytes);

    // Fit cleanly inside A4 or custom proportionate page in points (1px = 0.75pt)
    const ptW = Math.max(200, Math.round(w * 0.75));
    const ptH = Math.max(200, Math.round(h * 0.75));
    const page = pdfDoc.addPage([ptW, ptH]);
    page.drawImage(embedded, { x: 0, y: 0, width: ptW, height: ptH });
  }

  const outBytes = await pdfDoc.save();
  return toPdfBlobResult(
    outBytes,
    files[0],
    files.length > 1 ? `-bundle-${files.length}pages` : '',
    `${files.length} page(s) embedded`
  );
}

/**
 * -----------------------------------------------------------------------------
 * 3. LLM / DATA / DEVELOPER CONVERTERS (JSON <-> CSV, HTML -> Markdown)
 * -----------------------------------------------------------------------------
 */

function flattenJsonObject(obj: any, prefix = '', out: Record<string, string> = {}): Record<string, string> {
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
      flattenJsonObject(val, nextKey, out);
    } else if (Array.isArray(val)) {
      out[nextKey] = JSON.stringify(val);
    } else {
      out[nextKey] = val === null || val === undefined ? '' : String(val);
    }
  }
  return out;
}

/**
 * Tool 15: JSON to CSV (.csv)
 */
export async function convertJsonToCsv(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON syntax in "${file.name}". Ensure proper quotes and valid JSON structure.`);
  }

  let items: any[] = [];
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // If top-level object wraps an array (e.g. { "data": [...] }), extract it if uniform, otherwise single row
    const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]) && parsed[k].length > 0);
    items = firstArrayKey && Object.keys(parsed).length <= 3 ? parsed[firstArrayKey] : [parsed];
  } else {
    throw new Error('JSON root must be an object or an array of objects to export as CSV.');
  }

  if (items.length === 0) throw new Error('JSON array contains zero records.');

  const flatRows = items.map((item) => flattenJsonObject(item));
  const headerSet = new Set<string>();
  for (const row of flatRows) {
    for (const k of Object.keys(row)) headerSet.add(k);
  }
  const headers = Array.from(headerSet);

  const escapeCsvCell = (val: string) => {
    const safe = val.replace(/"/g, '""');
    return /[",\r\n]/.test(safe) ? `"${safe}"` : safe;
  };

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...flatRows.map((r) => headers.map((h) => escapeCsvCell(r[h] ?? '')).join(','))
  ];
  const csv = lines.join('\r\n');

  return buildTextResult(
    file,
    'csv',
    'text/csv;charset=utf-8',
    csv,
    'CSV',
    `${flatRows.length} rows · ${headers.length} columns`
  );
}

/**
 * Tool 16: CSV to JSON (.json)
 */
export async function convertCsvToJson(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  const matrix = parseCsvMatrix(raw);
  if (matrix.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headers = matrix[0].map((h, i) => (h.trim() ? h.trim() : `column_${i + 1}`));
  const records = matrix.slice(1).map((row) => {
    const obj: Record<string, string | number | boolean | null> = {};
    headers.forEach((h, i) => {
      const cell = (row[i] ?? '').trim();
      if (cell === '') {
        obj[h] = null;
      } else if (cell === 'true') {
        obj[h] = true;
      } else if (cell === 'false') {
        obj[h] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(cell) && cell.length < 16) {
        obj[h] = Number(cell);
      } else {
        obj[h] = cell;
      }
    });
    return obj;
  });

  const json = JSON.stringify(records, null, 2);
  return buildTextResult(
    file,
    'json',
    'application/json;charset=utf-8',
    json,
    'JSON',
    `${records.length} objects · ${headers.length} fields`
  );
}

function htmlNodeToMarkdown(node: Node, listDepth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/\s+/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (['script', 'style', 'noscript', 'svg', 'iframe', 'template'].includes(tag)) return '';

  const childrenMd = () =>
    Array.from(el.childNodes)
      .map((c) => htmlNodeToMarkdown(c, listDepth))
      .join('');

  switch (tag) {
    case 'h1':
      return `\n\n# ${childrenMd().trim()}\n\n`;
    case 'h2':
      return `\n\n## ${childrenMd().trim()}\n\n`;
    case 'h3':
      return `\n\n### ${childrenMd().trim()}\n\n`;
    case 'h4':
      return `\n\n#### ${childrenMd().trim()}\n\n`;
    case 'h5':
    case 'h6':
      return `\n\n##### ${childrenMd().trim()}\n\n`;
    case 'p':
    case 'article':
    case 'section': {
      const inner = childrenMd().trim();
      return inner ? `\n\n${inner}\n\n` : '';
    }
    case 'br':
      return '  \n';
    case 'hr':
      return '\n\n---\n\n';
    case 'strong':
    case 'b': {
      const inner = childrenMd().trim();
      return inner ? `**${inner}**` : '';
    }
    case 'em':
    case 'i': {
      const inner = childrenMd().trim();
      return inner ? `*${inner}*` : '';
    }
    case 'code': {
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        return el.textContent || '';
      }
      return `\`${(el.textContent || '').trim()}\``;
    }
    case 'pre': {
      const code = (el.textContent || '').replace(/^\n+|\n+$/g, '');
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }
    case 'a': {
      const href = el.getAttribute('href') || '';
      const label = childrenMd().trim() || href;
      if (!href || href.startsWith('javascript:')) return label;
      return `[${label}](${href})`;
    }
    case 'img': {
      const alt = el.getAttribute('alt') || 'image';
      const src = el.getAttribute('src') || '';
      return src ? `![${alt}](${src})` : '';
    }
    case 'blockquote': {
      const inner = childrenMd()
        .trim()
        .split('\n')
        .map((l) => `> ${l.trim()}`)
        .join('\n');
      return `\n\n${inner}\n\n`;
    }
    case 'ul':
    case 'ol': {
      const items = Array.from(el.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li, idx) => {
          const indent = '  '.repeat(listDepth);
          const prefix = tag === 'ol' ? `${idx + 1}. ` : '- ';
          const text = Array.from(li.childNodes)
            .map((c) => htmlNodeToMarkdown(c, listDepth + 1))
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
          return `${indent}${prefix}${text}`;
        })
        .join('\n');
      return `\n\n${items}\n\n`;
    }
    case 'table': {
      const trs = Array.from(el.querySelectorAll('tr'));
      if (trs.length === 0) return '';
      const matrix = trs.map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((cell) =>
          (cell.textContent || '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim()
        )
      );
      const colCount = Math.max(...matrix.map((r) => r.length));
      if (colCount === 0) return '';
      const header = `| ${Array.from({ length: colCount }, (_, i) => matrix[0][i] || '').join(' | ')} |`;
      const sep = `| ${Array.from({ length: colCount }, () => '---').join(' | ')} |`;
      const body = matrix
        .slice(1)
        .map((r) => `| ${Array.from({ length: colCount }, (_, i) => r[i] || '').join(' | ')} |`)
        .join('\n');
      return `\n\n${header}\n${sep}\n${body}\n\n`;
    }
    default:
      return childrenMd();
  }
}

/**
 * Tool 17: HTML to Markdown (.md) — Ideal for LLM / RAG context preparation
 */
export async function convertHtmlToMarkdown(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('The HTML file is empty.');

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');
  const title = doc.title?.trim();
  const bodyMd = doc.body ? htmlNodeToMarkdown(doc.body) : '';
  const combined = `${title ? `# ${title}\n\n` : ''}${bodyMd}`
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';

  return buildTextResult(
    file,
    'md',
    'text/markdown;charset=utf-8',
    combined,
    'MD',
    `${combined.length.toLocaleString()} chars Markdown`
  );
}
