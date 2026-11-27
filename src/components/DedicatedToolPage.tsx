import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  ArrowLeft,
  CheckCircle,
  FileText,
  Sliders,
  Layers,
  Sparkles,
  Archive,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Zap,
  AlertTriangle,
  Copy,
  Check,
  BookOpen,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { ToolDefinition, ConvertedFile, ConversionSettings } from '../types';
import {
  convertPdf,
  convertRasterImage,
  applyImageFilter,
  generateMatrixAsciiArt,
  mergeImagesToPdf,
  createZipBundle,
  editPdfMetadata,
  numberPdfPages,
  flattenPdf,
  reorderPdfPages,
  convertPdfMonochrome,
  applyAdvancedImageFilter
} from '../services/converterEngine';
import {
  convertPdfToMarkdown,
  convertPdfToJson,
  convertPdfToHtml,
  convertPdfToWordRtf,
  convertPdfToCsv,
  convertPdfToBase64,
  createTwoUpPdf,
  convertMarkdownToPdf,
  convertHtmlToPdf,
  convertTxtToPdf,
  convertCsvToPdf,
  convertJsonToPdf,
  convertRasterOrSvgToPdf,
  convertJsonToCsv,
  convertCsvToJson,
  convertHtmlToMarkdown
} from '../services/extraConvertersEngine';
import {
  convertPngToJpg,
  convertWebpToAvif,
  convertAvifToWebp,
  convertGifToPng,
  vectorizeJpgToSvg,
  applyRoundedCornersPng,
  buildImageCollageGrid,
  removeBlankPdfPages,
  convertMarkdownToHtml,
  convertXmlToJson,
  convertJsonToXml,
  convertSvgToCssUri
} from '../services/batch12Engine';
import { formatFileSize } from '../services/advancedToolsEngine';
import {
  getTranslation,
  getLocalizedTool,
  TOOL_TRANSLATIONS,
  normalizeUiLangCode
} from '../data/languages';
import { getLocalizedToolCategory } from '../data/blogI18n';
import { rescanDomTranslation } from '../services/autoTranslation';
import { TOOL_DEEP_GUIDES } from '../data/toolDeepContent';
import { EDITORIAL_IMAGES } from '../data/editorialAssets';
import { PRE_SEEDED_BLOG_POSTS } from '../data/blogData';
import { SmartAssistantTool } from './tools/SmartAssistantTool';
import { WebsiteImageAuditTool } from './tools/WebsiteImageAuditTool';
import { ImageOptimizationStudio } from './tools/ImageOptimizationStudio';
import { ImageCompressTargetTool } from './tools/ImageCompressTargetTool';
import { SocialMediaResizerTool } from './tools/SocialMediaResizerTool';
import { ExifViewerRemoverTool } from './tools/ExifViewerRemoverTool';
import { QrCodeTool } from './tools/QrCodeTool';
import { ColorPaletteTool } from './tools/ColorPaletteTool';
import { SvgOptimizerTool } from './tools/SvgOptimizerTool';
import { ImageToBase64Tool } from './tools/ImageToBase64Tool';
import { FaviconAppIconTool } from './tools/FaviconAppIconTool';
import { GifToolsStudio } from './tools/GifToolsStudio';
import { ImageUpscalerTool } from './tools/ImageUpscalerTool';
import { OcrExtractTool } from './tools/OcrExtractTool';
import { PdfCompressTool } from './tools/PdfCompressTool';
import { PdfOrganizerTool } from './tools/PdfOrganizerTool';

import { BatchQueuePanel } from './BatchQueuePanel';
import {
  BatchQueueItem,
  BatchWorkerPool,
  createBatchQueueItem,
  getRecommendedConcurrency,
  revokeConvertedUrls
} from '../services/batchWorkerPool';

interface DedicatedToolPageProps {
  tool: ToolDefinition;
  allTools: ToolDefinition[];
  currentLang: string;
  onBack: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectToolSlug: (slug: string) => void;
  onSelectBlogPost?: (slug: string) => void;
  initialFiles?: File[];
  onConsumeInitialFiles?: () => void;
}

const SPECIALIZED_TOOL_IDS = new Set([
  'smart-assistant',
  'website-image-audit',
  'optimization-studio',
  'compress-image-to-100kb',
  'resize-image-for-instagram',
  'remove-image-metadata',
  'image-exif-stripper',
  'qr-code-generator',
  'color-palette-generator',
  'image-color-extractor',
  'svg-optimizer',
  'image-to-base64',
  'favicon-generator',
  'png-to-ico',
  'app-icon-generator',
  'gif-maker',
  'gif-compressor',
  'image-upscaler',
  'ocr-extract-text',
  'pdf-compress',
  'pdf-organizer'
]);

const MULTI_INPUT_MERGE_TOOL_IDS = new Set([
  'image-to-pdf',
  'webp-to-pdf',
  'svg-to-pdf',
  'image-collage-grid'
]);

export const DedicatedToolPage: React.FC<DedicatedToolPageProps> = ({
  tool,
  allTools,
  currentLang,
  onBack,
  onSelectTool,
  onSelectToolSlug,
  onSelectBlogPost,
  initialFiles,
  onConsumeInitialFiles
}) => {
  const [queueItems, setQueueItems] = useState<BatchQueueItem[]>([]);
  const [mergeResults, setMergeResults] = useState<ConvertedFile[]>([]);
  const [concurrency, setConcurrency] = useState<number>(() => getRecommendedConcurrency());
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [matrixTextArt, setMatrixTextArt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAscii, setCopiedAscii] = useState(false);

  const poolRef = useRef<BatchWorkerPool | null>(null);
  const queueRef = useRef<BatchQueueItem[]>([]);
  queueRef.current = queueItems;

  const isMultiMergeTool = MULTI_INPUT_MERGE_TOOL_IDS.has(tool.id);
  const files = queueItems.map((q) => q.file);
  const convertedResults: ConvertedFile[] = isMultiMergeTool
    ? mergeResults
    : queueItems.flatMap((q) => q.results);

  const deepGuide = TOOL_DEEP_GUIDES[tool.id];
  const explicitBlogPosts = deepGuide
    ? deepGuide.relatedBlogSlugs
        .map((s) => PRE_SEEDED_BLOG_POSTS.find((p) => p.slug === s))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];
  const autoMatchedBlogPosts = PRE_SEEDED_BLOG_POSTS.filter(
    (p) =>
      p.ctaLink === `/tool/${tool.slug}` ||
      p.ctaLink === `/${tool.slug}` ||
      p.ctaLink === `/tool/${tool.id}` ||
      p.internalLinks.some(
        (l) => l.url === `/tool/${tool.slug}` || l.url === `/${tool.slug}` || l.url === `/tool/${tool.id}`
      )
  );
  const linkedBlogPosts = [
    ...explicitBlogPosts,
    ...autoMatchedBlogPosts.filter((p) => !explicitBlogPosts.some((e) => e.slug === p.slug))
  ].slice(0, 3);

  useEffect(() => {
    poolRef.current?.terminateAll();
    poolRef.current = new BatchWorkerPool();
    queueRef.current.forEach((q) => revokeConvertedUrls(q.results));
    revokeConvertedUrls(mergeResults);

    const seeded =
      initialFiles && initialFiles.length > 0 && !SPECIALIZED_TOOL_IDS.has(tool.id)
        ? initialFiles.map((f, idx) => createBatchQueueItem(f, idx))
        : [];
    if (seeded.length > 0 && onConsumeInitialFiles) {
      onConsumeInitialFiles();
    }

    setQueueItems(seeded);
    setMergeResults([]);
    setMatrixTextArt('');
    setErrorMsg(null);
    setProgress(0);
    setProgressMsg('');
    setIsConverting(false);

    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';

    document.title = deepGuide ? deepGuide.seoTitle : `${tool.name} – Free Browser Tool | Mimage`;
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        deepGuide ? deepGuide.metaDescription : tool.shortDescription
      );
    }

    const scriptId = 'mimage-tool-schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const toolUrl = `https://fixpdf.org/tool/${tool.slug}`;
    const graph: any[] = [
      {
        '@type': 'SoftwareApplication',
        '@id': `${toolUrl}#app`,
        name: tool.name,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (Browser-Based)',
        url: toolUrl,
        description: deepGuide ? deepGuide.metaDescription : tool.longDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        author: {
          '@type': 'Person',
          name: 'Naveed Afzal',
          jobTitle: 'Administrator, Founder & Lead Writer at Mimage'
        }
      },
      {
        '@type': 'HowTo',
        name: `How to Convert ${tool.fromFormat} to ${tool.toFormat} with ${tool.name}`,
        step: tool.steps.map((st) => ({
          '@type': 'HowToStep',
          position: st.step,
          name: st.title,
          text: st.description
        }))
      }
    ];

    if (tool.faq.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: tool.faq.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        }))
      });
    }

    if (deepGuide) {
      graph.push({
        '@type': 'TechArticle',
        headline: deepGuide.editorialTitle,
        description: deepGuide.llmSummary,
        datePublished: deepGuide.publishedDate,
        dateModified: deepGuide.updatedDate,
        keywords: [deepGuide.primaryKeyword, ...deepGuide.longTailKeywords].join(', '),
        author: {
          '@type': 'Person',
          name: 'Naveed Afzal',
          jobTitle: 'Administrator, Founder & Lead Writer at Mimage'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Mimage',
          url: 'https://fixpdf.org/'
        }
      });
    }

    scriptEl.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      poolRef.current?.terminateAll();
    };
  }, [tool, deepGuide]);

  const [settings, setSettings] = useState<ConversionSettings>({
    dpi: 150,
    quality: 90,
    scale: 1.0,
    backgroundColor: 'transparent',
    icoSizes: [16, 32, 48, 64],
    svgMode: 'vector-trace',
    colorThreshold: 128,
    matrixDensity: 80,
    matrixCharSet: 'katakana-binary'
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = (key: string) => getTranslation(currentLang, key);
  const localized = getLocalizedTool(tool, currentLang);
  const normLang = normalizeUiLangCode(currentLang);
  const hasNativeToolTranslation = Boolean(TOOL_TRANSLATIONS[normLang]?.[tool.id]);

  useEffect(() => {
    if (normLang !== 'en') {
      rescanDomTranslation(currentLang, 180);
    }
  }, [tool.id, currentLang, normLang, convertedResults.length]);

  const enqueueFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const added = incoming.map((f, idx) => createBatchQueueItem(f, idx));
    setQueueItems((prev) => [...prev, ...added]);
    if (isMultiMergeTool) {
      revokeConvertedUrls(mergeResults);
      setMergeResults([]);
    }
    setMatrixTextArt('');
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      enqueueFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      enqueueFiles(Array.from(e.dataTransfer.files));
    }
  };

  const patchQueueItem = (itemId: string, patch: Partial<BatchQueueItem>) => {
    setQueueItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  };

  const handleRemoveQueueItem = (itemId: string) => {
    setQueueItems((prev) => {
      const target = prev.find((q) => q.id === itemId);
      if (target) revokeConvertedUrls(target.results);
      return prev.filter((q) => q.id !== itemId);
    });
  };

  const handleClearQueue = () => {
    poolRef.current?.terminateAll();
    queueItems.forEach((q) => revokeConvertedUrls(q.results));
    revokeConvertedUrls(mergeResults);
    setQueueItems([]);
    setMergeResults([]);
    setMatrixTextArt('');
    setErrorMsg(null);
    setProgress(0);
    setProgressMsg('');
  };

  const runMainThreadSingleFile = async (
    item: BatchQueueItem,
    onItemProgress: (pct: number, msg?: string) => void
  ): Promise<{ results: ConvertedFile[] }> => {
    const file = item.file;

    if (tool.id === 'pdf-2-up-handout') {
      onItemProgress(50, `Creating 2-up sheets for ${file.name}...`);
      return { results: [await createTwoUpPdf(file)] };
    }
    if (tool.id === 'pdf-to-markdown') {
      return { results: [await convertPdfToMarkdown(file, onItemProgress)] };
    }
    if (tool.id === 'pdf-to-json') {
      return { results: [await convertPdfToJson(file, onItemProgress)] };
    }
    if (tool.id === 'pdf-to-html') {
      return { results: [await convertPdfToHtml(file, onItemProgress)] };
    }
    if (tool.id === 'pdf-to-word-rtf') {
      return { results: [await convertPdfToWordRtf(file, onItemProgress)] };
    }
    if (tool.id === 'pdf-to-csv') {
      return { results: [await convertPdfToCsv(file, onItemProgress)] };
    }
    if (tool.id === 'pdf-to-base64') {
      onItemProgress(55, `Encoding ${file.name}...`);
      return { results: [await convertPdfToBase64(file)] };
    }
    if (tool.id === 'markdown-to-pdf') {
      onItemProgress(55, `Rendering Markdown PDF...`);
      return { results: [await convertMarkdownToPdf(file)] };
    }
    if (tool.id === 'html-to-pdf') {
      onItemProgress(55, `Sanitizing & paginating HTML...`);
      return { results: [await convertHtmlToPdf(file)] };
    }
    if (tool.id === 'txt-to-pdf') {
      onItemProgress(55, `Wrapping text pages...`);
      return { results: [await convertTxtToPdf(file)] };
    }
    if (tool.id === 'csv-to-pdf') {
      onItemProgress(55, `Formatting CSV table grid...`);
      return { results: [await convertCsvToPdf(file)] };
    }
    if (tool.id === 'json-to-pdf') {
      onItemProgress(55, `Formatting JSON to PDF...`);
      return { results: [await convertJsonToPdf(file)] };
    }
    if (tool.id === 'json-to-csv') {
      onItemProgress(55, `Flattening JSON to CSV...`);
      return { results: [await convertJsonToCsv(file)] };
    }
    if (tool.id === 'csv-to-json') {
      onItemProgress(55, `Parsing CSV to JSON...`);
      return { results: [await convertCsvToJson(file)] };
    }
    if (tool.id === 'html-to-markdown') {
      onItemProgress(55, `Converting HTML to Markdown...`);
      return { results: [await convertHtmlToMarkdown(file)] };
    }
    if (tool.id === 'pdf-metadata-editor') {
      onItemProgress(55, `Sanitizing PDF metadata...`);
      return {
        results: [
          await editPdfMetadata(file, {
            title: file.name.replace(/\.[^/.]+$/, ''),
            author: 'Mimage Local Engine',
            subject: 'Cleaned Document',
            keywords: 'pdf, cleaned, local'
          })
        ]
      };
    }
    if (tool.id === 'pdf-page-numberer') {
      onItemProgress(55, `Applying page numbers...`);
      return { results: [await numberPdfPages(file, 'bottom-center')] };
    }
    if (tool.id === 'pdf-flatten') {
      onItemProgress(55, `Flattening annotations & form fields...`);
      return { results: [await flattenPdf(file)] };
    }
    if (tool.id === 'pdf-page-reorder') {
      onItemProgress(55, `Reversing page order...`);
      return { results: [await reorderPdfPages(file, 'reverse')] };
    }
    if (tool.id === 'pdf-grayscale') {
      return {
        results: [await convertPdfMonochrome(file, 'grayscale', (pct) => onItemProgress(pct, 'Converting to grayscale...'))]
      };
    }
    if (tool.id === 'pdf-invert-colors') {
      return {
        results: [await convertPdfMonochrome(file, 'invert', (pct) => onItemProgress(pct, 'Generating dark-mode PDF...'))]
      };
    }
    if (tool.fromFormat === 'PDF') {
      const toFmtLower = tool.toFormat.toLowerCase();
      const targetFmt: 'png' | 'jpg' | 'svg' | 'webp' | 'bmp' =
        toFmtLower === 'svg'
          ? 'svg'
          : toFmtLower === 'jpg' || toFmtLower === 'jpeg'
          ? 'jpg'
          : toFmtLower === 'webp'
          ? 'webp'
          : toFmtLower === 'bmp'
          ? 'bmp'
          : 'png';

      const pdfPages = await convertPdf(file, targetFmt, settings, (pct, page, total) => {
        onItemProgress(Math.round(15 + pct * 0.8), `Rendering page ${page} of ${total}...`);
      });
      return { results: pdfPages };
    }
    if (tool.id === 'image-matrix-art') {
      onItemProgress(55, `Generating Matrix code art...`);
      const art = await generateMatrixAsciiArt(file, settings.matrixDensity, settings.matrixCharSet);
      return {
        results: [{ ...art.renderedImage, textContent: art.textArt }]
      };
    }
    if (tool.id === 'image-grayscale') {
      return { results: [await applyImageFilter(file, 'grayscale')] };
    }
    if (tool.id === 'image-rotate') {
      return { results: [await applyImageFilter(file, 'rotate-90')] };
    }
    if (tool.id === 'image-crop') {
      return { results: [await applyImageFilter(file, 'crop-center')] };
    }
    if (
      [
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
        'image-transparent-png-maker'
      ].includes(tool.id)
    ) {
      onItemProgress(55, `Applying ${tool.name}...`);
      return {
        results: [
          await applyAdvancedImageFilter(file, tool.id, {
            ratio: '1:1',
            threshold: settings.colorThreshold || 128
          })
        ]
      };
    }
    if (tool.id === 'png-to-jpg') return { results: [await convertPngToJpg(file, settings)] };
    if (tool.id === 'webp-to-avif') return { results: [await convertWebpToAvif(file, settings)] };
    if (tool.id === 'avif-to-webp') return { results: [await convertAvifToWebp(file, settings)] };
    if (tool.id === 'gif-to-png') return { results: [await convertGifToPng(file, settings)] };
    if (tool.id === 'jpg-to-svg') return { results: [await vectorizeJpgToSvg(file, settings)] };
    if (tool.id === 'image-round-corners') return { results: [await applyRoundedCornersPng(file, 'rounded')] };
    if (tool.id === 'pdf-blank-page-remover') {
      return { results: [await removeBlankPdfPages(file, onItemProgress)] };
    }
    if (tool.id === 'markdown-to-html') return { results: [await convertMarkdownToHtml(file)] };
    if (tool.id === 'xml-to-json') return { results: [await convertXmlToJson(file)] };
    if (tool.id === 'json-to-xml') return { results: [await convertJsonToXml(file)] };
    if (tool.id === 'svg-to-css-uri') return { results: [await convertSvgToCssUri(file)] };

    return { results: [await convertRasterImage(file, tool.toFormat, settings)] };
  };

  const executeBatchItems = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    if (!poolRef.current) poolRef.current = new BatchWorkerPool();

    setIsConverting(true);
    setErrorMsg(null);
    setProgress(10);
    setProgressMsg(`Processing ${targetIds.length} file(s) across ${Math.min(concurrency, targetIds.length)} Worker(s)...`);

    try {
      const summary = await poolRef.current.runBatch({
        itemIdsToProcess: targetIds,
        getItemsSnapshot: () => queueRef.current,
        concurrency,
        buildRequest: (item) => ({
          toolId: tool.id,
          toFormat: tool.toFormat,
          fileName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type || '',
          settings
        }),
        mainThreadFallback: runMainThreadSingleFile,
        onItemPatch: patchQueueItem
      });

      if (summary.cancelled) {
        setProgressMsg('Batch stopped by user');
      } else {
        setProgress(100);
        setProgressMsg('Completed');
      }

      const latestResults = queueRef.current.flatMap((q) => q.results);
      const firstTextResult = latestResults.find((r) => typeof r.textContent === 'string' && r.textContent.length > 0);
      if (firstTextResult?.textContent) {
        const txt = firstTextResult.textContent;
        setMatrixTextArt(
          tool.id !== 'image-matrix-art' && txt.length > 120000
            ? `${txt.slice(0, 120000)}\n\n... [Preview truncated at 120 KB — click Download to save complete file]`
            : txt
        );
      }

      if (summary.failedCount > 0 && summary.completedCount === 0 && !summary.cancelled) {
        const firstErr = queueRef.current.find((q) => q.status === 'failed')?.error;
        if (firstErr) setErrorMsg(firstErr);
      }
    } catch (err: any) {
      console.error('Batch conversion error:', err);
      setErrorMsg(
        err?.message ||
          'Conversion could not complete. Please verify that your file is valid and matches the accepted format.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvert = async () => {
    if (queueItems.length === 0) return;

    if (isMultiMergeTool) {
      setIsConverting(true);
      setProgress(25);
      setProgressMsg(`Packaging ${files.length} file(s)...`);
      setErrorMsg(null);
      revokeConvertedUrls(mergeResults);
      setMergeResults([]);

      try {
        const started = performance.now();
        setQueueItems((prev) =>
          prev.map((q) => ({ ...q, status: 'processing', progress: 50, progressMessage: 'Packaging...' }))
        );

        let packaged: ConvertedFile;
        if (tool.id === 'image-to-pdf') {
          packaged = await mergeImagesToPdf(files);
        } else if (tool.id === 'webp-to-pdf' || tool.id === 'svg-to-pdf') {
          packaged = await convertRasterOrSvgToPdf(files, tool.id === 'svg-to-pdf');
        } else {
          packaged = await buildImageCollageGrid(files, settings.backgroundColor);
        }

        const durationMs = Math.max(1, Math.round(performance.now() - started));
        setMergeResults([packaged]);
        setQueueItems((prev) =>
          prev.map((q) => ({ ...q, status: 'completed', progress: 100, progressMessage: 'Included', durationMs }))
        );
        setProgress(100);
        setProgressMsg('Completed');
      } catch (err: any) {
        setQueueItems((prev) =>
          prev.map((q) => ({ ...q, status: 'failed', progress: 0, error: err?.message || 'Packaging failed' }))
        );
        setErrorMsg(err?.message || 'Could not combine selected files.');
      } finally {
        setIsConverting(false);
      }
      return;
    }

    const pendingIds = queueItems
      .filter((q) => q.status === 'queued' || q.status === 'failed' || q.status === 'cancelled')
      .map((q) => q.id);

    if (pendingIds.length > 0) {
      await executeBatchItems(pendingIds);
    } else {
      // Re-run entire queue cleanly (e.g., if user tweaked Quality or DPI settings)
      const allIds = queueItems.map((q) => q.id);
      setQueueItems((prev) =>
        prev.map((q) => {
          revokeConvertedUrls(q.results);
          return { ...q, status: 'queued', progress: 0, results: [], error: undefined };
        })
      );
      await executeBatchItems(allIds);
    }
  };

  const handleRetrySingleItem = async (itemId: string) => {
    patchQueueItem(itemId, { status: 'queued', progress: 0, error: undefined });
    await executeBatchItems([itemId]);
  };

  const handleRetryAllFailed = async () => {
    const failedIds = queueRef.current
      .filter((q) => q.status === 'failed' || q.status === 'cancelled')
      .map((q) => q.id);
    if (failedIds.length === 0) return;
    setQueueItems((prev) =>
      prev.map((q) => (failedIds.includes(q.id) ? { ...q, status: 'queued', progress: 0, error: undefined } : q))
    );
    await executeBatchItems(failedIds);
  };

  const handleCancelBatch = () => {
    poolRef.current?.terminateAll();
    poolRef.current = new BatchWorkerPool();
    setQueueItems((prev) =>
      prev.map((q) =>
        q.status === 'processing' || q.status === 'queued'
          ? { ...q, status: 'cancelled', progress: 0, progressMessage: 'Stopped' }
          : q
      )
    );
    setIsConverting(false);
    setProgressMsg('Batch stopped');
  };

  const handleDownloadSingle = (file: ConvertedFile) => {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.convertedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleDownloadAllZip = async () => {
    if (convertedResults.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await createZipBundle(convertedResults);
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${tool.slug}-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to package ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const renderSpecializedStudio = () => {
    switch (tool.id) {
      case 'smart-assistant':
        return <SmartAssistantTool onSelectToolSlug={onSelectToolSlug} />;
      case 'website-image-audit':
        return <WebsiteImageAuditTool onSelectToolSlug={onSelectToolSlug} />;
      case 'optimization-studio':
        return (
          <ImageOptimizationStudio
            initialFiles={initialFiles}
            onConsumeInitialFiles={onConsumeInitialFiles}
          />
        );
      case 'compress-image-to-100kb':
        return (
          <ImageCompressTargetTool
            initialFiles={initialFiles}
            onConsumeInitialFiles={onConsumeInitialFiles}
          />
        );
      case 'resize-image-for-instagram':
        return <SocialMediaResizerTool />;
      case 'remove-image-metadata':
      case 'image-exif-stripper':
        return <ExifViewerRemoverTool />;
      case 'qr-code-generator':
        return <QrCodeTool />;
      case 'color-palette-generator':
      case 'image-color-extractor':
        return <ColorPaletteTool />;
      case 'svg-optimizer':
        return <SvgOptimizerTool />;
      case 'image-to-base64':
        return <ImageToBase64Tool />;
      case 'favicon-generator':
      case 'png-to-ico':
        return <FaviconAppIconTool initialMode="favicon" />;
      case 'app-icon-generator':
        return <FaviconAppIconTool initialMode="app-icons" />;
      case 'gif-maker':
        return <GifToolsStudio initialMode="maker" />;
      case 'gif-compressor':
        return <GifToolsStudio initialMode="compressor" />;
      case 'image-upscaler':
        return <ImageUpscalerTool />;
      case 'ocr-extract-text':
        return <OcrExtractTool />;
      case 'pdf-compress':
        return <PdfCompressTool />;
      case 'pdf-organizer':
        return <PdfOrganizerTool />;
      default:
        return null;
    }
  };

  const relatedTools = allTools
    .filter((x) => x.id !== tool.id && (x.fromFormat === tool.fromFormat || x.toFormat === tool.toFormat || x.category === tool.category))
    .slice(0, 3);

  const processingLabel =
    tool.processingMode === 'network-fetch' || tool.processingMode === 'optional-network'
      ? 'Network URL Fetch (SSRF-Protected)'
      : tool.processingMode === 'browser-local-plus-cdn'
      ? 'Local WASM + Language Dictionary Fetch'
      : 'Browser-Local (Zero Upload)';

  return (
    <article className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">
        <button
          onClick={onBack}
          className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          <span className="notranslate" translate="no">{t('backToAll')}</span>
        </button>
        <span>/</span>
        <span className="notranslate" translate="no">
          {getLocalizedToolCategory(tool.category, currentLang, tool.categoryName)}
        </span>
        <span>/</span>
        <span
          className={`text-slate-900 dark:text-white font-semibold ${hasNativeToolTranslation ? 'notranslate' : ''}`}
          translate={hasNativeToolTranslation ? 'no' : 'yes'}
        >
          {localized.name}
        </span>
      </nav>

      {/* Main Tool Header */}
      <header className="mb-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h1
            className={`text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight ${hasNativeToolTranslation ? 'notranslate' : ''}`}
            translate={hasNativeToolTranslation ? 'no' : 'yes'}
          >
            {localized.name}
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{processingLabel}</span>
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {tool.longDescription}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span>
            Input: <strong className="text-slate-900 dark:text-white">{tool.fromFormat}</strong>
          </span>
          <span>·</span>
          <span>
            Output: <strong className="text-blue-600 dark:text-sky-400">{tool.toFormat}</strong>
          </span>
          {tool.maxRecommendedSizeMb && (
            <>
              <span>·</span>
              <span>Recommended max: {tool.maxRecommendedSizeMb} MB per batch</span>
            </>
          )}
        </div>
      </header>

      {/* Interactive Tool Workspace */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md mb-12 text-slate-900 dark:text-slate-100">
        {SPECIALIZED_TOOL_IDS.has(tool.id) ? (
          renderSpecializedStudio()
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Interactive Conversion Studio</span>
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Free · Client-Side
              </span>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Dropzone */}
            <div
              data-adsense-exclude="true"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group mb-6 ${
                isDraggingOver
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 scale-[1.01]'
                  : 'border-blue-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:border-blue-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={tool.acceptedFileTypes.join(',')}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {files.length === 0
                    ? t('dropTitle')
                    : `${files.length} file(s) staged — drop or click to add more`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Accepted: {tool.acceptedFileTypes.join(', ')} · Parallel Web Worker Queue
                </p>
              </div>
            </div>

            {/* Parallel Batch Queue */}
            <BatchQueuePanel
              items={queueItems}
              isRunning={isConverting}
              concurrency={concurrency}
              onChangeConcurrency={setConcurrency}
              onAddMoreFiles={() => fileInputRef.current?.click()}
              onRemoveItem={handleRemoveQueueItem}
              onRetryItem={handleRetrySingleItem}
              onRetryAllFailed={handleRetryAllFailed}
              onCancelBatch={handleCancelBatch}
              onClearQueue={handleClearQueue}
              onDownloadSingle={handleDownloadSingle}
              isMultiInputMergeTool={isMultiMergeTool}
              clearLabel={t('clearQueue')}
              queueTitle={t('inputQueue')}
            />

            {/* Tool Options */}
            {(tool.options.supportsDpi || tool.options.supportsBackground || tool.options.supportsQuality) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-6 text-xs font-mono">
                {tool.options.supportsDpi && (
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>{t('dpi')}:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: '72 (Web)', val: 72 },
                        { label: '150 (Med)', val: 150 },
                        { label: '300 (Print)', val: 300 }
                      ].map((dpiOpt) => (
                        <button
                          key={dpiOpt.val}
                          type="button"
                          onClick={() => setSettings({ ...settings, dpi: dpiOpt.val })}
                          className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                            settings.dpi === dpiOpt.val
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {dpiOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tool.options.supportsBackground && (
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>{t('background')}:</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, backgroundColor: 'transparent' })}
                        className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                          settings.backgroundColor === 'transparent'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t('transparent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, backgroundColor: 'white' })}
                        className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                          settings.backgroundColor === 'white'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t('white')}
                      </button>
                    </div>
                  </div>
                )}

                {tool.options.supportsQuality && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <label className="flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        <span>{t('quality')}:</span>
                      </label>
                      <span className="text-blue-600 dark:text-sky-400 font-bold tabular-nums">
                        {settings.quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: parseInt(e.target.value, 10) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Processed locally on background Web Workers ({concurrency} concurrent threads)
              </span>

              <button
                onClick={handleConvert}
                disabled={files.length === 0 || isConverting}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  files.length === 0 || isConverting
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{progressMsg || t('converting')}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {queueItems.some((q) => q.status === 'queued')
                        ? `${t('convertNow')} (${queueItems.filter((q) => q.status === 'queued').length})`
                        : convertedResults.length > 0 && !isMultiMergeTool
                        ? `Reprocess Batch (${files.length})`
                        : t('convertNow')}
                    </span>
                  </>
                )}
              </button>
            </div>

            {isConverting && isMultiMergeTool && (
              <div className="mt-4 space-y-1">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{progressMsg}</span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
              </div>
            )}

            {/* Results */}
            {convertedResults.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {t('readyForDownload')} ({convertedResults.length})
                      </span>
                    </h4>
                  </div>

                  {convertedResults.length > 1 && (
                    <button
                      onClick={handleDownloadAllZip}
                      disabled={isZipping}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-mono text-xs font-semibold cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>{isZipping ? 'Packaging ZIP...' : t('downloadAllZip')}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {convertedResults.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 flex flex-col justify-between"
                    >
                      <div className="relative aspect-video rounded-lg bg-white dark:bg-slate-900 overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1">
                        <img src={res.previewUrl} alt={res.convertedName} className="max-h-full max-w-full object-contain" />
                        {res.pageNumber && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[10px]">
                            Page {res.pageNumber}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-mono text-xs text-slate-900 dark:text-white truncate font-semibold mb-1">
                          {res.convertedName}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2 tabular-nums">
                          <span>{formatFileSize(res.convertedSize)}</span>
                          {res.width && res.height && (
                            <span>
                              {res.width} × {res.height} px
                            </span>
                          )}
                        </div>
                        {res.note && (
                          <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mb-2.5 leading-snug">
                            {res.note}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDownloadSingle(res)}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="notranslate" translate="no">{t('download')}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {matrixTextArt && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {tool.id === 'image-matrix-art'
                          ? 'Terminal ASCII Text Art'
                          : `Extracted ${tool.toFormat} Output Preview`}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(matrixTextArt);
                          setCopiedAscii(true);
                          setTimeout(() => setCopiedAscii(false), 2000);
                        }}
                        className="text-xs font-mono text-emerald-300 inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        {copiedAscii ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>
                          {copiedAscii ? 'Copied' : tool.id === 'image-matrix-art' ? 'Copy ASCII' : 'Copy Output'}
                        </span>
                      </button>
                    </div>
                    <pre
                      className={`${
                        tool.id === 'image-matrix-art' ? 'text-[7px] leading-tight' : 'text-xs leading-relaxed whitespace-pre-wrap break-words'
                      } font-mono text-emerald-300 overflow-x-auto max-h-72 p-3 bg-black/60 rounded`}
                    >
                      {matrixTextArt}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Honest Limitations & Troubleshooting Disclosures */}
      {(tool.limitations?.length || tool.troubleshooting?.length) && (
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {tool.limitations && tool.limitations.length > 0 && (
            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Known Limitations</span>
              </h2>
              <ul className="space-y-1.5 text-xs text-amber-900/90 dark:text-amber-200/90 list-disc pl-4 leading-relaxed">
                {tool.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {tool.troubleshooting && tool.troubleshooting.length > 0 && (
            <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                <span>Troubleshooting Tips</span>
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                {tool.troubleshooting.map((tip, i) => (
                  <li key={i}>
                    {typeof tip === 'string' ? (
                      tip
                    ) : (
                      <>
                        <strong>{tip.issue}:</strong> {tip.fix}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Who Can Use */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-sky-400" />
          <span>{t('whoCanUse')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tool.whoCanUse.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <h3 className="text-sm font-bold text-blue-700 dark:text-sky-400 mb-1.5">{item.persona}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.useCase}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Where To Use */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600 dark:text-sky-400" />
          <span>{t('whereToUse')}</span>
        </h2>
        <div className="space-y-3">
          {tool.whereToUse.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.scenario}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 sm:max-w-md sm:text-right">{item.benefit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {t('howToConvert')}: {tool.fromFormat} → {tool.toFormat}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.steps.map((st) => (
            <div
              key={st.step}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs mb-4">
                0{st.step}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{st.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Format Comparison */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('formatComparison')}</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold">
                <th className="p-3.5">Feature</th>
                <th className="p-3.5">Source: {tool.fromFormat}</th>
                <th className="p-3.5">Target: {tool.toFormat}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {tool.formatComparison.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{row.feature}</td>
                  <td className="p-3.5">{row.fromVal}</td>
                  <td className="p-3.5 text-blue-600 dark:text-sky-400 font-semibold">{row.toVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('faqTitle')}</h2>
        <div className="space-y-3">
          {tool.faq.map((item, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Deep E-E-A-T, SEO & LLM Reference Guide */}
      {deepGuide && (
        <section
          aria-label="In-Depth Technical Documentation"
          className="mb-12 rounded-2xl border border-emerald-500/25 bg-slate-900/95 p-6 sm:p-8 shadow-md space-y-6"
        >
          {/* E-E-A-T Author & Review Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={EDITORIAL_IMAGES.authorAvatar}
                alt="Naveed Afzal — Administrator, Founder & Lead Writer at Mimage"
                className="w-12 h-12 rounded-full object-cover border border-emerald-400/50 shrink-0"
              />
              <div>
                <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Naveed Afzal</span>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Verified Technical Guide
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Administrator, Founder &amp; Lead Writer at Mimage
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Updated: {deepGuide.updatedDate}</span>
              </span>
              <span>·</span>
              <span className="text-emerald-400">{deepGuide.primaryKeyword}</span>
            </div>
          </div>

          {/* LLM / AI Overview Direct Summary & Key Takeaways */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Quick Technical Reference &amp; Summary</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {deepGuide.llmSummary}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-xs font-mono text-slate-400 mb-2">Key Technical Takeaways:</div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5 leading-relaxed">
                {deepGuide.keyTakeaways.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full 750+ Word Deep Editorial Body */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4">
              {deepGuide.editorialTitle}
            </h2>
            <div
              className="space-y-4 text-sm text-slate-300 leading-relaxed [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-7 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-emerald-300 [&_h3]:mt-5 [&_p]:leading-relaxed [&_strong]:text-white [&_code]:font-mono [&_code]:text-xs [&_code]:bg-slate-950 [&_code]:text-emerald-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: deepGuide.content }}
            />
          </div>

          {/* Review Verification & Long-Tail Topic Tags */}
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <div className="text-xs text-slate-400 font-mono">
              <strong className="text-emerald-400">Verification Note:</strong> {deepGuide.reviewerNote}
            </div>
            <div className="flex flex-wrap gap-2">
              {deepGuide.longTailKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

        </section>
      )}

      {/* Recommended E-E-A-T Blog Guides (bidirectional internal link bridge) */}
      {linkedBlogPosts.length > 0 && (
        <section className="mb-10 p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Recommended Engineering &amp; Privacy Guides on Mimage Blog</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {linkedBlogPosts.map((bp) => (
              <button
                key={bp.slug}
                type="button"
                onClick={() => {
                  if (onSelectBlogPost) {
                    onSelectBlogPost(bp.slug);
                  } else {
                    window.history.pushState({}, '', `/blog/${bp.slug}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-left p-4 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-emerald-500/50 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 mb-1 tabular-nums">{bp.readTime}</div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {bp.title}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400">
                  <span>Read full guide</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 notranslate" translate="no">{t('relatedTools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((rt) => {
              const rLocalized = getLocalizedTool(rt, currentLang);
              const hasRelNative = Boolean(TOOL_TRANSLATIONS[normLang]?.[rt.id]);
              return (
                <div
                  key={rt.id}
                  onClick={() => onSelectTool(rt)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 transition-colors cursor-pointer group"
                >
                  <div className="font-mono text-xs text-blue-600 dark:text-sky-400 font-bold mb-1">
                    {rt.fromFormat} → {rt.toFormat}
                  </div>
                  <div
                    className={`font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1 ${hasRelNative ? 'notranslate' : ''}`}
                    translate={hasRelNative ? 'no' : 'yes'}
                  >
                    {rLocalized.name}
                  </div>
                  <p
                    className={`text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 ${hasRelNative ? 'notranslate' : ''}`}
                    translate={hasRelNative ? 'no' : 'yes'}
                  >
                    {rLocalized.shortDescription}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
