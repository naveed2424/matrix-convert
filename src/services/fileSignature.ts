/**
 * Real Binary File Signature & EXIF Header Inspector for Mimage
 * Validates magic bytes so files are never trusted by extension alone.
 */

export interface CompatibleSuggestion {
  slug: string;
  label: string;
  reason: string;
}

export interface FileInspectionResult {
  detectedFormat: string;
  formatLabel: string;
  detectedMime: string;
  mimeType: string;
  extension: string;
  extensionMatchesSignature: boolean;
  extensionMismatch: boolean;
  isUnsafeSvg: boolean;
  category: 'image' | 'pdf' | 'vector' | 'animation' | 'video' | 'unknown';
  magicHex: string;
  signatureHex: string;
  summary: string;
  explanation: string;
  warnings: string[];
  recommendedToolSlugs: string[];
  suggestions: CompatibleSuggestion[];
}

export type DetectedFileFormat = FileInspectionResult;

export interface ExifInspectionReport {
  hasExifSegment: boolean;
  hasGpsTag: boolean;
  hasGpsIfd: boolean;
  cameraMake?: string;
  cameraModel?: string;
  software?: string;
  dateTime?: string;
  orientation?: number;
  width?: number;
  height?: number;
  note: string;
  rawTags: { tag: string; value: string }[];
  fields: { label: string; value: string }[];
}

export type ParsedExifInfo = ExifInspectionReport;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function bytesToAscii(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
    .join('');
}

export async function inspectFileSignature(file: File): Promise<FileInspectionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const slice = await file.slice(0, 1024).arrayBuffer();
  const bytes = new Uint8Array(slice);
  const magicHex = bytesToHex(bytes.slice(0, 12));
  const asciiHeader = bytesToAscii(bytes.slice(0, 512));

  const warnings: string[] = [];

  if (file.size === 0) {
    const msg = 'This file is 0 bytes and appears empty or corrupted.';
    return {
      detectedFormat: 'EMPTY',
      formatLabel: 'Empty File (0 Bytes)',
      detectedMime: 'application/octet-stream',
      mimeType: 'application/octet-stream',
      extension: ext,
      extensionMatchesSignature: false,
      extensionMismatch: true,
      isUnsafeSvg: false,
      category: 'unknown',
      magicHex,
      signatureHex: magicHex,
      summary: msg,
      explanation: msg,
      warnings: ['File size is 0 bytes.'],
      recommendedToolSlugs: [],
      suggestions: []
    };
  }

  // 1. PDF (%PDF-)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    const matches = ext === 'pdf';
    if (!matches) warnings.push(`File extension is .${ext || 'none'}, but binary header matches PDF (%PDF).`);
    const summary = 'Portable Document Format (PDF) verified via %PDF magic header.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'pdf-to-png', label: 'PDF to PNG Converter', reason: 'Render pages as crisp lossless PNGs up to 300 DPI.' },
      { slug: 'pdf-to-jpg', label: 'PDF to JPG Converter', reason: 'Export lightweight slide/page photos.' },
      { slug: 'pdf-to-webp', label: 'PDF to WebP Converter', reason: 'Export ultra-compact web-optimized WebP page renders.' },
      { slug: 'pdf-to-markdown', label: 'PDF to Markdown (LLM Ready)', reason: 'Extract structured Markdown headings and lists locally.' },
      { slug: 'pdf-to-word-rtf', label: 'PDF to Word (RTF)', reason: 'Export editable rich text document for Word and Google Docs.' },
      { slug: 'pdf-to-csv', label: 'PDF to CSV Extractor', reason: 'Extract tabular rows from PDF reports into spreadsheets.' },
      { slug: 'pdf-compress', label: 'PDF Compressor', reason: 'Reduce PDF byte weight with structural or raster optimization.' },
      { slug: 'pdf-organizer', label: 'PDF Page Organizer', reason: 'Reorder, rotate, or delete individual pages visually.' }
    ];
    return {
      detectedFormat: 'PDF',
      formatLabel: 'Portable Document (PDF)',
      detectedMime: 'application/pdf',
      mimeType: 'application/pdf',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'pdf',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 2. PNG (\x89PNG\r\n\x1a\n)
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const matches = ext === 'png';
    if (!matches) warnings.push(`Extension is .${ext || 'none'}, but binary header is PNG.`);
    const summary = 'Lossless PNG image (supports alpha transparency) verified via 89 50 4E 47 header.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'optimization-studio', label: 'Image Optimization Studio', reason: 'Convert to WebP/AVIF, resize, rename, and batch export.' },
      { slug: 'compress-image-to-100kb', label: 'Compress Under Target KB', reason: 'Hit exact 100 KB / 200 KB portal upload ceilings.' },
      { slug: 'png-to-webp', label: 'PNG to WebP', reason: 'Shrink web asset size while keeping alpha transparency.' },
      { slug: 'png-to-jpg', label: 'PNG to JPG', reason: 'Flatten transparency to compact JPEG.' },
      { slug: 'resize-image-for-instagram', label: 'Social Media Resizer', reason: 'Resize cleanly for Instagram, LinkedIn, or YouTube.' },
      { slug: 'favicon-generator', label: 'Favicon Package Generator', reason: 'Build favicon.ico, 180px Apple Touch & manifest bundle.' }
    ];
    return {
      detectedFormat: 'PNG',
      formatLabel: 'PNG Raster Image',
      detectedMime: 'image/png',
      mimeType: 'image/png',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'image',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 3. JPEG (\xFF\xD8\xFF)
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    const matches = ext === 'jpg' || ext === 'jpeg' || ext === 'jpe';
    if (!matches) warnings.push(`Extension is .${ext || 'none'}, but binary header is JPEG.`);
    const summary = 'JPEG photograph verified via FF D8 FF signature. May contain EXIF camera or GPS metadata.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'remove-image-metadata', label: 'EXIF Viewer & Remover', reason: 'Inspect embedded camera/GPS tags and strip them locally.' },
      { slug: 'compress-image-to-100kb', label: 'Compress Under Target KB', reason: 'Shrink photo under 100 KB, 200 KB, or 500 KB.' },
      { slug: 'optimization-studio', label: 'Image Optimization Studio', reason: 'Resize, convert to WebP/AVIF, and strip headers.' },
      { slug: 'jpg-to-png', label: 'JPG to PNG', reason: 'Convert to lossless PNG bitmap.' },
      { slug: 'resize-image-for-instagram', label: 'Social Media Resizer', reason: 'Aspect-safe crops for Instagram, TikTok, or Pinterest.' },
      { slug: 'ocr-extract-text', label: 'OCR Text Extraction', reason: 'Extract printed text from document photos.' }
    ];
    return {
      detectedFormat: 'JPG',
      formatLabel: 'JPEG Photograph',
      detectedMime: 'image/jpeg',
      mimeType: 'image/jpeg',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'image',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 4. WebP (RIFF....WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    const matches = ext === 'webp';
    if (!matches) warnings.push(`Extension is .${ext || 'none'}, but binary header is WebP.`);
    const summary = 'Modern WebP image verified via RIFF/WEBP container header.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'webp-to-png', label: 'WebP to PNG', reason: 'Convert WebP for older software or lossless editing.' },
      { slug: 'webp-to-jpg', label: 'WebP to JPG', reason: 'Flatten transparency onto crisp white paper as universal JPG.' },
      { slug: 'webp-to-pdf', label: 'WebP to PDF', reason: 'Compile WebP graphics cleanly into a printable PDF document.' },
      { slug: 'optimization-studio', label: 'Image Optimization Studio', reason: 'Resize and batch export WebP/AVIF/JPG.' },
      { slug: 'compress-image-to-100kb', label: 'Compress Under Target KB', reason: 'Meet strict KB file limits cleanly.' }
    ];
    return {
      detectedFormat: 'WEBP',
      formatLabel: 'WebP Image',
      detectedMime: 'image/webp',
      mimeType: 'image/webp',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'image',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 5. GIF (GIF87a / GIF89a)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    const matches = ext === 'gif';
    if (!matches) warnings.push(`Extension is .${ext || 'none'}, but binary header is GIF.`);
    const summary = 'Graphics Interchange Format (GIF) verified via GIF87a/89a header.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'gif-compressor', label: 'GIF Compressor', reason: 'Downscale width, quantize colors, or drop frames to cut size.' },
      { slug: 'gif-maker', label: 'GIF Maker', reason: 'Combine frames into a fresh animated GIF loop.' },
      { slug: 'image-to-base64', label: 'Image to Base64', reason: 'Generate Data URI snippet for inline CSS/HTML.' }
    ];
    return {
      detectedFormat: 'GIF',
      formatLabel: 'GIF Animation / Graphic',
      detectedMime: 'image/gif',
      mimeType: 'image/gif',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'animation',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 6. ISO Base Media Container (HEIC / HEIF / AVIF / MP4)
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = asciiHeader.slice(8, 12).toLowerCase();
    if (brand === 'avif' || brand === 'avis') {
      const matches = ext === 'avif';
      const summary = 'AVIF image verified via ftypavif container box.';
      const suggestions: CompatibleSuggestion[] = [
        { slug: 'avif-to-png', label: 'AVIF to PNG Converter', reason: 'Decode AVIF into universally supported lossless PNG.' },
        { slug: 'avif-to-jpg', label: 'AVIF to JPG Converter', reason: 'Export AVIF images into universal compressed JPG.' },
        { slug: 'optimization-studio', label: 'Image Optimization Studio', reason: 'Resize, compress, and batch export.' }
      ];
      return {
        detectedFormat: 'AVIF',
        formatLabel: 'AVIF Next-Gen Image',
        detectedMime: 'image/avif',
        mimeType: 'image/avif',
        extension: ext,
        extensionMatchesSignature: matches,
        extensionMismatch: !matches,
        isUnsafeSvg: false,
        category: 'image',
        magicHex,
        signatureHex: magicHex,
        summary,
        explanation: summary,
        warnings,
        recommendedToolSlugs: suggestions.map((s) => s.slug),
        suggestions
      };
    }
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) {
      const matches = ext === 'heic' || ext === 'heif';
      const summary =
        'Apple HEIC/HEIF container verified via ftyp box. Note: Safari decodes HEIC natively; Chrome/Firefox on Windows or Linux may require OS codecs or iOS Photos compatibility export.';
      const suggestions: CompatibleSuggestion[] = [
        { slug: 'heic-to-jpg', label: 'HEIC to JPG Converter', reason: 'Convert Apple HEIC photos to universal JPG where browser decoding is supported.' },
        { slug: 'heic-to-png', label: 'HEIC to PNG Converter', reason: 'Convert Apple HEIC photos to lossless PNG on Safari/macOS.' },
        { slug: 'compress-image-to-100kb', label: 'Compress Under Target KB', reason: 'Compress once decoded to fit web form uploads.' },
        { slug: 'remove-image-metadata', label: 'EXIF Privacy Stripper', reason: 'Strip iPhone GPS/camera metadata upon export.' }
      ];
      return {
        detectedFormat: 'HEIC',
        formatLabel: 'Apple HEIC Container',
        detectedMime: 'image/heic',
        mimeType: 'image/heic',
        extension: ext,
        extensionMatchesSignature: matches,
        extensionMismatch: !matches,
        isUnsafeSvg: false,
        category: 'image',
        magicHex,
        signatureHex: magicHex,
        summary,
        explanation: summary,
        warnings,
        recommendedToolSlugs: suggestions.map((s) => s.slug),
        suggestions
      };
    }
    if (['isom', 'mp41', 'mp42', 'qt  '].includes(brand)) {
      const matches = ext === 'mp4' || ext === 'mov';
      const summary = 'MP4 / QuickTime video container detected. Video files cannot be edited with image compressors.';
      return {
        detectedFormat: 'MP4',
        formatLabel: 'MP4 / MOV Video Container',
        detectedMime: 'video/mp4',
        mimeType: 'video/mp4',
        extension: ext,
        extensionMatchesSignature: matches,
        extensionMismatch: !matches,
        isUnsafeSvg: false,
        category: 'video',
        magicHex,
        signatureHex: magicHex,
        summary,
        explanation: summary,
        warnings: ['Use video frames or still screenshots if you want to create an animated GIF via GIF Maker.'],
        recommendedToolSlugs: ['gif-maker'],
        suggestions: [{ slug: 'gif-maker', label: 'GIF Maker', reason: 'Create GIFs from exported frame sequences.' }]
      };
    }
  }

  // 7. BMP (BM)
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    const matches = ext === 'bmp';
    const summary = 'Uncompressed Windows Bitmap (BMP) verified via BM header.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'bmp-to-png', label: 'BMP to PNG Converter', reason: 'Shrink uncompressed BMP images 70%+ with zero quality loss.' },
      { slug: 'bmp-to-jpg', label: 'BMP to JPG Converter', reason: 'Convert heavy BMP captures to lightweight shareable JPG.' },
      { slug: 'compress-image-to-100kb', label: 'Compress Under Target KB', reason: 'Significantly shrink uncompressed BMP payloads.' },
      { slug: 'optimization-studio', label: 'Image Optimization Studio', reason: 'Convert BMP into compact WebP, JPG, or PNG.' }
    ];
    return {
      detectedFormat: 'BMP',
      formatLabel: 'Windows Bitmap (BMP)',
      detectedMime: 'image/bmp',
      mimeType: 'image/bmp',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'image',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  // 8. ICO (00 00 01 00)
  if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
    const matches = ext === 'ico';
    const summary = 'Windows / Website Favicon ICO icon container detected.';
    return {
      detectedFormat: 'ICO',
      formatLabel: 'ICO Favicon Container',
      detectedMime: 'image/x-icon',
      mimeType: 'image/x-icon',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: false,
      category: 'image',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: ['ico-to-png', 'favicon-generator'],
      suggestions: [
        { slug: 'ico-to-png', label: 'ICO to PNG Converter', reason: 'Extract editable transparent PNG frames from favicon/icon files.' },
        { slug: 'favicon-generator', label: 'Favicon Generator', reason: 'Build a complete multi-size website favicon package.' }
      ]
    };
  }

  // 9. SVG (textual XML / <svg check — inspect for active script security risks)
  const lowerText = asciiHeader.toLowerCase();
  if (lowerText.includes('<svg') || (lowerText.includes('<?xml') && ext === 'svg')) {
    const hasScript = lowerText.includes('<script') || lowerText.includes('onload=') || lowerText.includes('onerror=');
    if (hasScript) {
      warnings.push('Potential active script detected inside SVG XML. Run SVG Optimizer to sanitize before publishing.');
    }
    const matches = ext === 'svg';
    const summary = 'Scalable Vector Graphics (SVG XML) detected.';
    const suggestions: CompatibleSuggestion[] = [
      { slug: 'svg-optimizer', label: 'SVG Sanitizer & Optimizer', reason: 'Strip unsafe scripts, comments, and editor bloat cleanly.' },
      { slug: 'svg-to-png', label: 'SVG to PNG Converter', reason: 'Rasterize vector artwork at crisp dimensions.' },
      { slug: 'svg-to-webp', label: 'SVG to WebP Converter', reason: 'Export high-density transparent WebP for fast websites.' },
      { slug: 'svg-to-pdf', label: 'SVG to PDF Converter', reason: 'Compile sanitized vector artwork cleanly into PDF.' },
      { slug: 'image-to-base64', label: 'Image to Base64', reason: 'Encode vector data into inline CSS or Data URI.' }
    ];
    return {
      detectedFormat: 'SVG',
      formatLabel: 'Scalable Vector Graphics (SVG)',
      detectedMime: 'image/svg+xml',
      mimeType: 'image/svg+xml',
      extension: ext,
      extensionMatchesSignature: matches,
      extensionMismatch: !matches,
      isUnsafeSvg: hasScript,
      category: 'vector',
      magicHex,
      signatureHex: magicHex,
      summary,
      explanation: summary,
      warnings,
      recommendedToolSlugs: suggestions.map((s) => s.slug),
      suggestions
    };
  }

  const unknownSummary = 'File signature does not match supported PDF, PNG, JPG, WebP, GIF, AVIF, HEIC, BMP, ICO, or SVG formats.';
  warnings.push('Unrecognized binary header. Mimage blocks execution of unknown binary payloads.');
  return {
    detectedFormat: ext ? ext.toUpperCase() : 'UNKNOWN',
    formatLabel: 'Unrecognized File Format',
    detectedMime: file.type || 'application/octet-stream',
    mimeType: file.type || 'application/octet-stream',
    extension: ext,
    extensionMatchesSignature: false,
    extensionMismatch: false,
    isUnsafeSvg: false,
    category: 'unknown',
    magicHex,
    signatureHex: magicHex,
    summary: unknownSummary,
    explanation: unknownSummary,
    warnings,
    recommendedToolSlugs: [],
    suggestions: []
  };
}

/**
 * Lightweight, safe in-browser binary EXIF parser for JPEG files.
 * Reads APP1 (FFE1) TIFF IFD0 tags without any external dependencies.
 */
export async function parseExifMetadata(file: File): Promise<ExifInspectionReport> {
  const info: ExifInspectionReport = {
    hasExifSegment: false,
    hasGpsTag: false,
    hasGpsIfd: false,
    note: 'Inspected binary header in browser.',
    rawTags: [],
    fields: []
  };

  try {
    const url = URL.createObjectURL(file);
    try {
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });
      if (dims.w > 0) {
        info.width = dims.w;
        info.height = dims.h;
        info.fields.push({ label: 'Pixel Dimensions', value: `${dims.w} × ${dims.h} px` });
      }
    } finally {
      URL.revokeObjectURL(url);
    }

    const buffer = await file.slice(0, 131072).arrayBuffer();
    const view = new DataView(buffer);

    if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) {
      info.note = 'Not a JPEG file with APP1 EXIF segment (PNG/WebP/re-encoded files stripped via canvas contain zero EXIF blocks).';
      return info;
    }

    let offset = 2;
    while (offset + 4 < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        if (offset + 8 < view.byteLength && view.getUint32(offset + 2, false) === 0x45786966) {
          info.hasExifSegment = true;
          const tiffStart = offset + 8;
          const endianVal = view.getUint16(tiffStart, false);
          const littleEndian = endianVal === 0x4949;
          const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
          const dirStart = tiffStart + ifdOffset;

          if (dirStart + 2 < view.byteLength) {
            const entries = Math.min(view.getUint16(dirStart, littleEndian), 60);
            for (let i = 0; i < entries; i++) {
              const entryOffset = dirStart + 2 + i * 12;
              if (entryOffset + 12 > view.byteLength) break;

              const tagId = view.getUint16(entryOffset, littleEndian);
              const type = view.getUint16(entryOffset + 2, littleEndian);
              const count = view.getUint32(entryOffset + 4, littleEndian);

              if (tagId === 0x8825) {
                info.hasGpsTag = true;
                info.hasGpsIfd = true;
                info.rawTags.push({ tag: 'GPSInfoIFD', value: 'Present (Location coordinates embedded)' });
                info.fields.push({ label: 'GPS IFD', value: 'Embedded Location Pointer Detected' });
              }

              if (type === 2 && count > 0 && count < 128) {
                const strOffset =
                  count <= 4
                    ? entryOffset + 8
                    : tiffStart + view.getUint32(entryOffset + 8, littleEndian);
                if (strOffset + count <= view.byteLength) {
                  let text = '';
                  for (let c = 0; c < count - 1; c++) {
                    const ch = view.getUint8(strOffset + c);
                    if (ch === 0) break;
                    if (ch >= 32 && ch <= 126) text += String.fromCharCode(ch);
                  }
                  text = text.trim();
                  if (text) {
                    if (tagId === 0x010f) {
                      info.cameraMake = text;
                      info.rawTags.push({ tag: 'Camera Make', value: text });
                      info.fields.push({ label: 'Camera Make', value: text });
                    } else if (tagId === 0x0110) {
                      info.cameraModel = text;
                      info.rawTags.push({ tag: 'Camera Model', value: text });
                      info.fields.push({ label: 'Camera Model', value: text });
                    } else if (tagId === 0x0131) {
                      info.software = text;
                      info.rawTags.push({ tag: 'Software', value: text });
                      info.fields.push({ label: 'Software / Firmware', value: text });
                    } else if (tagId === 0x0132) {
                      info.dateTime = text;
                      info.rawTags.push({ tag: 'Timestamp', value: text });
                      info.fields.push({ label: 'Original Timestamp', value: text });
                    }
                  }
                }
              } else if (tagId === 0x0112 && type === 3) {
                const orient = view.getUint16(entryOffset + 8, littleEndian);
                info.orientation = orient;
                info.rawTags.push({ tag: 'Orientation', value: String(orient) });
                info.fields.push({ label: 'Orientation Tag', value: String(orient) });
              }
            }
          }
          info.note = info.hasGpsIfd
            ? 'APP1 EXIF block + GPS location pointer found. Use Strip Metadata below before sharing online.'
            : 'APP1 EXIF camera/software header found in JPEG.';
        }
        break;
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        const segLen = view.getUint16(offset, false);
        if (segLen < 2) break;
        offset += segLen;
      }
    }

    if (!info.hasExifSegment) {
      info.note = 'Verified clean JPEG stream — zero APP1 EXIF or GPS metadata segments found.';
    }
  } catch (err) {
    console.warn('EXIF inspection stopped safely:', err);
  }

  return info;
}
