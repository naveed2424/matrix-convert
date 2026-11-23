import { PDFDocument } from 'pdf-lib';
import { ConvertedFile, ConversionSettings } from '../types';
import { getPdfjs, loadImageFromFile, convertRasterImage } from './converterEngine';
import { makeDocumentBadgePreview } from './extraConvertersEngine';

/**
 * -----------------------------------------------------------------------------
 * MIMAGE BATCH 12 ENGINE
 * 12 High-Demand Client-Side Image, PDF, Vector & Developer Utilities
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

function buildTextOutput(
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

/**
 * Tool 1: PNG to JPG Converter
 */
export async function convertPngToJpg(
  file: File,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  const bg = settings.backgroundColor === 'black' ? 'black' : 'white';
  return convertRasterImage(file, 'jpg', {
    ...settings,
    backgroundColor: bg
  });
}

/**
 * Tool 2: WebP to AVIF Converter
 */
export async function convertWebpToAvif(
  file: File,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  return convertRasterImage(file, 'avif', settings);
}

/**
 * Tool 3: AVIF to WebP Converter
 */
export async function convertAvifToWebp(
  file: File,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  return convertRasterImage(file, 'webp', settings);
}

/**
 * Tool 4: GIF to PNG Frame Converter (first frame / static lossless PNG)
 */
export async function convertGifToPng(
  file: File,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  const res = await convertRasterImage(file, 'png', settings);
  return {
    ...res,
    note: 'Extracted high-precision static PNG frame with preserved alpha channel.'
  };
}

/**
 * Tool 5: JPG to SVG Vectorizer (Color-quantized run-length SVG vector paths)
 */
export async function vectorizeJpgToSvg(
  file: File,
  settings: Partial<ConversionSettings> = {}
): Promise<ConvertedFile> {
  const img = await loadImageFromFile(file);
  const aspect = img.height / Math.max(1, img.width);
  const gridW = Math.min(120, Math.max(48, img.width));
  const gridH = Math.max(24, Math.round(gridW * aspect));

  const canvas = document.createElement('canvas');
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D Canvas context unavailable');

  ctx.drawImage(img, 0, 0, gridW, gridH);
  const imgData = ctx.getImageData(0, 0, gridW, gridH).data;

  // Quantization step controlled subtly by quality slider (higher quality = finer palette)
  const qLevel = settings.quality && settings.quality >= 85 ? 24 : 32;
  const quantize = (v: number) => Math.min(255, Math.round(v / qLevel) * qLevel);

  const toHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');

  // Group horizontal runs by quantized hex color into combined SVG path strings
  const colorPaths = new Map<string, string[]>();

  for (let y = 0; y < gridH; y++) {
    let runStart = -1;
    let runColor = '';

    for (let x = 0; x <= gridW; x++) {
      let hex = '';
      if (x < gridW) {
        const idx = (y * gridW + x) * 4;
        const a = imgData[idx + 3];
        if (a >= 64) {
          hex = toHex(
            quantize(imgData[idx]),
            quantize(imgData[idx + 1]),
            quantize(imgData[idx + 2])
          );
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

  const outW = img.width;
  const outH = img.height;
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridW} ${gridH}" width="${outW}" height="${outH}" shape-rendering="crispEdges">
  <!-- Quantized Vector Trace by Mimage Local Vector Engine (${colorPaths.size} palette paths) -->
${pathsMarkup}
</svg>
`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const dataUrl = URL.createObjectURL(blob);
  const previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `svg-vec-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}.svg`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl,
    width: outW,
    height: outH,
    textContent: svgContent,
    note: `Traced ${colorPaths.size} quantized SVG vector color layers (${gridW}×${gridH} vector grid).`
  };
}

/**
 * Tool 6: Circle Avatar & Rounded Corner PNG Maker
 */
export async function applyRoundedCornersPng(
  file: File,
  mode: 'rounded' | 'circle' = 'rounded'
): Promise<ConvertedFile> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D Canvas unavailable');

  let w = img.width;
  let h = img.height;
  let sx = 0;
  let sy = 0;

  if (mode === 'circle') {
    const minSide = Math.min(img.width, img.height);
    sx = Math.floor((img.width - minSide) / 2);
    sy = Math.floor((img.height - minSide) / 2);
    w = minSide;
    h = minSide;
  }

  canvas.width = w;
  canvas.height = h;
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
    ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  } else {
    ctx.drawImage(img, 0, 0, w, h);
  }
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
  );
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `rounded-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}-${mode}.png`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: w,
    height: h
  };
}

/**
 * Tool 7: Photo Grid & Collage Sheet Maker
 */
export async function buildImageCollageGrid(
  files: File[],
  bgColor: 'transparent' | 'white' | 'black' = 'black'
): Promise<ConvertedFile> {
  if (files.length === 0) throw new Error('Drop at least one image to build a grid.');

  const loaded = await Promise.all(files.map((f) => loadImageFromFile(f)));
  const count = loaded.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const cellW = 540;
  const cellH = 400;
  const gap = 24;

  const totalW = cols * cellW + (cols + 1) * gap;
  const totalH = rows * cellH + (rows + 1) * gap;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D Canvas unavailable');

  if (bgColor === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);
  } else if (bgColor === 'black') {
    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, totalW, totalH);
  } else {
    ctx.clearRect(0, 0, totalW, totalH);
  }

  loaded.forEach((img, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellX = gap + col * (cellW + gap);
    const cellY = gap + row * (cellH + gap);

    // Draw subtle tile card
    ctx.fillStyle = bgColor === 'white' ? '#f1f5f9' : 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(cellX, cellY, cellW, cellH);

    // Fit image inside cell preserving aspect ratio
    const scale = Math.min((cellW - 16) / img.width, (cellH - 16) / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = cellX + (cellW - drawW) / 2;
    const drawY = cellY + (cellH - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  });

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
  );

  return {
    id: `collage-grid-${Date.now()}`,
    originalName: files.map((f) => f.name).join(', '),
    convertedName: `mimage-collage-${cols}x${rows}.png`,
    originalSize: files.reduce((sum, f) => sum + f.size, 0),
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: dataUrl,
    width: totalW,
    height: totalH,
    note: `Combined ${count} image(s) into a ${cols}×${rows} (${totalW}×${totalH}px) PNG contact grid.`
  };
}

/**
 * Tool 8: PDF Blank Page Auto-Remover
 * Renders each PDF page into memory via pdfjs-dist, measures visual ink coverage,
 * and omits blank separator pages when rebuilding the PDF with pdf-lib.
 */
export async function removeBlankPdfPages(
  file: File,
  onProgress?: (pct: number, msg: string) => void
): Promise<ConvertedFile> {
  const lib = await getPdfjs();
  if (!lib) throw new Error('PDF analysis engine could not be initialized.');

  const arrayBuffer = await file.arrayBuffer();
  const pdfJsDoc = await lib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const totalPages: number = pdfJsDoc.numPages;
  if (totalPages === 0) throw new Error('The PDF contains zero pages.');

  const keptIndices: number[] = [];
  const removedPages: number[] = [];

  for (let p = 1; p <= totalPages; p++) {
    onProgress?.(Math.round((p / totalPages) * 80), `Scanning page ${p} of ${totalPages} for ink...`);
    const page = await pdfJsDoc.getPage(p);
    const viewport = page.getViewport({ scale: 0.45 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(8, Math.round(viewport.width));
    canvas.height = Math.max(8, Math.round(viewport.height));
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let inkPixels = 0;
    const totalSamples = canvas.width * canvas.height;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // Count any pixel noticeably darker than crisp paper white (246)
      if (r < 245 || g < 245 || b < 245) {
        inkPixels++;
      }
    }

    const inkRatio = inkPixels / Math.max(1, totalSamples);
    if (inkRatio >= 0.002) {
      keptIndices.push(p - 1);
    } else {
      removedPages.push(p);
    }
  }

  // Prevent outputting an invalid 0-page PDF
  const finalIndices = keptIndices.length > 0 ? keptIndices : [0];
  onProgress?.(90, 'Rebuilding clean PDF container...');

  const srcDoc = await PDFDocument.load(arrayBuffer);
  const outDoc = await PDFDocument.create();
  const copied = await outDoc.copyPages(srcDoc, finalIndices);
  copied.forEach((pg) => outDoc.addPage(pg));

  const outBytes = await outDoc.save();
  const copy = new Uint8Array(outBytes.byteLength);
  copy.set(outBytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const dataUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const convertedName = `${baseName}-no-blanks.pdf`;

  const note =
    keptIndices.length === 0
      ? `All ${totalPages} page(s) appeared blank — kept page 1 to ensure a valid PDF.`
      : removedPages.length === 0
      ? `No blank pages detected — preserved all ${totalPages} pages.`
      : `Removed ${removedPages.length} blank page(s) (p. ${removedPages.join(', ')}), kept ${keptIndices.length} of ${totalPages}.`;

  onProgress?.(100, note);

  return {
    id: `pdf-noblank-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: makeDocumentBadgePreview('PDF', convertedName, note),
    note
  };
}

function renderInlineMarkdown(text: string): string {
  let s = escapeHtml(text);
  // Inline code first
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Images
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
  // Links (block javascript:)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const safeUrl = url.toLowerCase().startsWith('javascript:') ? '#' : url;
    return `<a href="${safeUrl}">${label}</a>`;
  });
  // Bold + Italic
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s;
}

/**
 * Tool 9: Markdown to Clean HTML5 Converter
 */
export async function convertMarkdownToHtml(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
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
        codeLang = escapeHtml(trimmed.slice(3).trim());
        codeBuffer = [];
      } else {
        inCode = false;
        const cls = codeLang ? ` class="language-${codeLang}"` : '';
        htmlParts.push(`<pre><code${cls}>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
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

    // Markdown Table detection
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())
    ) {
      closeLists();
      const parseRow = (rowStr: string) =>
        rowStr
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => renderInlineMarkdown(c.trim()));

      const headers = parseRow(trimmed);
      i += 2; // Skip header & separator
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        bodyRows.push(parseRow(lines[i].trim()));
        i++;
      }
      i--; // Loop increment adjustment

      const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
      const tbody = bodyRows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('');
      htmlParts.push(`<table>${thead}<tbody>${tbody}</tbody></table>`);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      htmlParts.push('<hr />');
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<blockquote><p>${renderInlineMarkdown(trimmed.replace(/^>\s?/, ''))}</p></blockquote>`);
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
      htmlParts.push(`  <li>${renderInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ''))}</li>`);
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
      htmlParts.push(`  <li>${renderInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    closeLists();
    htmlParts.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  if (inCode && codeBuffer.length > 0) {
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  const docTitle = escapeHtml(file.name.replace(/\.[^/.]+$/, ''));
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

  return buildTextOutput(file, 'html', 'text/html;charset=utf-8', html, 'HTML5', `${htmlParts.length} semantic blocks`);
}

function xmlElementToObject(el: Element): any {
  const result: Record<string, any> = {};

  if (el.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      result['@attributes'][attr.name] = attr.value;
    }
  }

  const childElements = Array.from(el.children);
  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map((n) => n.textContent || '')
    .join('')
    .trim();

  if (childElements.length === 0) {
    if (Object.keys(result).length === 0) {
      return directText;
    }
    if (directText) result['#text'] = directText;
    return result;
  }

  if (directText) {
    result['#text'] = directText;
  }

  for (const child of childElements) {
    const tag = child.tagName;
    const val = xmlElementToObject(child);
    if (tag in result) {
      if (!Array.isArray(result[tag])) {
        result[tag] = [result[tag]];
      }
      result[tag].push(val);
    } else {
      result[tag] = val;
    }
  }

  return result;
}

/**
 * Tool 10: XML to JSON Parser & Converter
 */
export async function convertXmlToJson(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  if (!raw.trim()) throw new Error('The XML file is empty.');

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(raw, 'application/xml');
  const parseErr = xmlDoc.querySelector('parsererror');
  if (parseErr) {
    throw new Error(`Malformed XML syntax in "${file.name}": ${(parseErr.textContent || '').slice(0, 180)}`);
  }

  const root = xmlDoc.documentElement;
  const outputObj = {
    [root.tagName]: xmlElementToObject(root)
  };

  const json = JSON.stringify(outputObj, null, 2);
  return buildTextOutput(
    file,
    'json',
    'application/json;charset=utf-8',
    json,
    'JSON',
    `Root <${root.tagName}> parsed`
  );
}

function sanitizeXmlTag(tag: string): string {
  const cleaned = tag.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `n_${cleaned}`;
}

function jsonValueToXml(key: string, val: any, indentLevel: number): string {
  const pad = '  '.repeat(indentLevel);
  const tag = sanitizeXmlTag(key);

  if (val === null || val === undefined) {
    return `${pad}<${tag} />`;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return `${pad}<${tag} />`;
    return val.map((item) => jsonValueToXml(tag, item, indentLevel)).join('\n');
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val);
    if (entries.length === 0) return `${pad}<${tag} />`;

    let attrsStr = '';
    const innerParts: string[] = [];

    for (const [childKey, childVal] of entries) {
      if (childKey === '@attributes' && childVal && typeof childVal === 'object') {
        attrsStr = Object.entries(childVal)
          .map(([ak, av]) => ` ${sanitizeXmlTag(ak)}="${escapeXml(String(av))}"`)
          .join('');
      } else if (childKey === '#text') {
        innerParts.push(`${pad}  ${escapeXml(String(childVal))}`);
      } else {
        innerParts.push(jsonValueToXml(childKey, childVal, indentLevel + 1));
      }
    }

    if (innerParts.length === 0) {
      return `${pad}<${tag}${attrsStr} />`;
    }
    return `${pad}<${tag}${attrsStr}>\n${innerParts.join('\n')}\n${pad}</${tag}>`;
  }

  return `${pad}<${tag}>${escapeXml(String(val))}</${tag}>`;
}

/**
 * Tool 11: JSON to XML Generator
 */
export async function convertJsonToXml(file: File): Promise<ConvertedFile> {
  const raw = await file.text();
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON syntax in "${file.name}". Please check quotes and braces.`);
  }

  let bodyXml = '';
  if (Array.isArray(parsed)) {
    bodyXml = `<root>\n${parsed.map((item) => jsonValueToXml('item', item, 1)).join('\n')}\n</root>`;
  } else if (parsed && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    if (keys.length === 1) {
      bodyXml = jsonValueToXml(keys[0], parsed[keys[0]], 0);
    } else {
      bodyXml = jsonValueToXml('root', parsed, 0);
    }
  } else {
    bodyXml = jsonValueToXml('root', parsed, 0);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${bodyXml}\n`;
  return buildTextOutput(file, 'xml', 'application/xml;charset=utf-8', xml, 'XML', `${xml.split('\n').length} XML lines`);
}

/**
 * Tool 12: SVG to CSS Data URI Optimizer
 */
export async function convertSvgToCssUri(file: File): Promise<ConvertedFile> {
  const rawSvg = await file.text();
  if (!rawSvg.trim()) throw new Error('The SVG file is empty.');

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(rawSvg, 'image/svg+xml');
  const parseErr = svgDoc.querySelector('parsererror');
  if (parseErr || !svgDoc.documentElement || svgDoc.documentElement.tagName.toLowerCase() !== 'svg') {
    throw new Error(`"${file.name}" does not appear to be a valid SVG document.`);
  }

  svgDoc.querySelectorAll('script').forEach((el) => el.remove());
  const svgRoot = svgDoc.documentElement;
  if (!svgRoot.getAttribute('xmlns')) {
    svgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const serialized = new XMLSerializer()
    .serializeToString(svgRoot)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  // Compact URL-encoded Data URI (much smaller than Base64 for CSS background-image)
  const compactEncoded = serialized
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');

  const classSlug = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '') || 'vector-icon';

  const cssOutput = `/* Generated by Mimage SVG to CSS Data URI Optimizer */
.icon-${classSlug} {
  background-image: url("data:image/svg+xml,${compactEncoded}");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
`;

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const blob = new Blob([cssOutput], { type: 'text/css;charset=utf-8' });
  const dataUrl = URL.createObjectURL(blob);
  const svgPreview = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;

  return {
    id: `svg-css-${file.name}-${Date.now()}`,
    originalName: file.name,
    convertedName: `${baseName}.css`,
    originalSize: file.size,
    convertedSize: blob.size,
    dataUrl,
    blob,
    previewUrl: svgPreview,
    textContent: cssOutput,
    note: `Encoded clean SVG Data URI (${compactEncoded.length} chars, smaller than Base64).`
  };
}
