import React, { useState, useRef } from 'react';
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
  Zap
} from 'lucide-react';
import { ToolDefinition, ConvertedFile, ConversionSettings } from '../types';
import {
  convertPdf,
  convertRasterImage,
  applyImageFilter,
  generateMatrixAsciiArt,
  mergeImagesToPdf,
  createZipBundle
} from '../services/converterEngine';
import { getTranslation, getLocalizedTool } from '../data/languages';

interface DedicatedToolPageProps {
  tool: ToolDefinition;
  allTools: ToolDefinition[];
  currentLang: string;
  onBack: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

export const DedicatedToolPage: React.FC<DedicatedToolPageProps> = ({
  tool,
  allTools,
  currentLang,
  onBack,
  onSelectTool
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [convertedResults, setConvertedResults] = useState<ConvertedFile[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [matrixTextArt, setMatrixTextArt] = useState<string>('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setConvertedResults([]);
      setMatrixTextArt('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setConvertedResults([]);
      setMatrixTextArt('');
    }
  };

  // Execute Conversion
  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgress(15);
    setProgressMsg(t('converting'));
    setConvertedResults([]);

    try {
      const allResults: ConvertedFile[] = [];

      // Special Case 1: Merge multiple images to a single PDF
      if (tool.id === 'image-to-pdf') {
        setProgress(50);
        setProgressMsg('Compiling images into PDF document...');
        const mergedPdf = await mergeImagesToPdf(files);
        allResults.push(mergedPdf);
      }
      // Special Case 2: Convert PDF to PNG / SVG / JPG
      else if (tool.fromFormat === 'PDF') {
        const targetFmt =
          tool.toFormat.toLowerCase() === 'svg'
            ? 'svg'
            : tool.toFormat.toLowerCase() === 'jpg' || tool.toFormat.toLowerCase() === 'jpeg'
            ? 'jpg'
            : 'png';

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const pdfPages = await convertPdf(file, targetFmt, settings, (pct, page, total) => {
            setProgress(Math.round(20 + pct * 0.75));
            setProgressMsg(`Rendering page ${page} of ${total}...`);
          });
          allResults.push(...pdfPages);
        }
      }
      // Special Case 3: Matrix Rain / ASCII Art
      else if (tool.id === 'image-matrix-art') {
        for (const file of files) {
          const art = await generateMatrixAsciiArt(file, settings.matrixDensity, settings.matrixCharSet);
          setMatrixTextArt(art.textArt);
          allResults.push(art.renderedImage);
        }
      }
      // Special Case 4: Image Filters (Grayscale, Rotate, Crop)
      else if (tool.id === 'image-grayscale') {
        for (const file of files) {
          const filtered = await applyImageFilter(file, 'grayscale');
          allResults.push(filtered);
        }
      } else if (tool.id === 'image-rotate') {
        for (const file of files) {
          const rotated = await applyImageFilter(file, 'rotate-90');
          allResults.push(rotated);
        }
      } else if (tool.id === 'image-crop') {
        for (const file of files) {
          const cropped = await applyImageFilter(file, 'crop-center');
          allResults.push(cropped);
        }
      }
      // Special Case 5: Standard Raster & Vector Converters (PNG, JPG, WebP, SVG, AVIF, BMP, ICO, Compress)
      else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress(Math.round(20 + (i / files.length) * 70));
          const converted = await convertRasterImage(file, tool.toFormat, settings);
          allResults.push(converted);
        }
      }

      setProgress(100);
      setProgressMsg('Completed!');
      setConvertedResults(allResults);
    } catch (err: any) {
      console.error('Conversion failed:', err);
      alert(`Conversion encountered an issue: ${err.message || 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Safe Download Single File using local Blob URL
  const handleDownloadSingle = (file: ConvertedFile) => {
    try {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.convertedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      console.error('Download error:', e);
      window.open(file.dataUrl, '_blank');
    }
  };

  // Download All as ZIP
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
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const relatedTools = allTools
    .filter((t) => t.id !== tool.id && (t.fromFormat === tool.fromFormat || t.toFormat === tool.toFormat))
    .slice(0, 3);

  return (
    <article className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-6">
        <button
          onClick={onBack}
          className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-sky-900/40 px-2.5 py-1 rounded-md border border-sky-400/40"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>{t('backToAll')}</span>
        </button>
        <span className="text-sky-500">/</span>
        <span className="text-sky-200">{tool.categoryName}</span>
        <span className="text-sky-500">/</span>
        <span className="text-white font-bold">{localized.name}</span>
      </nav>

      {/* Main Tool Header Banner */}
      <header className="mb-8 p-6 rounded-2xl bg-sky-950/80 border-2 border-sky-400/40 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {localized.name}
          </h1>
          {tool.badge && (
            <span className="rounded-full border border-sky-300 bg-sky-400 text-slate-950 font-mono text-xs font-bold px-3 py-1 shadow-sm">
              {tool.badge}
            </span>
          )}
        </div>
        <p className="text-sm sm:text-base text-sky-100 max-w-3xl leading-relaxed">
          {tool.longDescription}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-300 mt-4 pt-3 border-t border-sky-800">
          <span className="bg-sky-900 px-2 py-0.5 rounded border border-sky-500/50">Input: {tool.fromFormat}</span>
          <span>•</span>
          <span className="bg-sky-900 px-2 py-0.5 rounded border border-sky-500/50">Output: {tool.toFormat}</span>
          <span>•</span>
          <span className="text-sky-200 font-semibold">{t('clientSideNotice')}</span>
        </div>
      </header>

      {/* =========================================================================
          LIGHT SKY BLUE CONVERSION STUDIO (Prominent, High-Contrast Workspace)
         ========================================================================= */}
      <section className="rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] p-6 sm:p-8 shadow-2xl mb-12 text-slate-900">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
            <Zap className="w-5 h-5 text-sky-600" />
            <span>Interactive Conversion Studio</span>
          </h2>
          <span className="text-xs font-mono font-semibold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-300">
            Free & In-Browser
          </span>
        </div>

        {/* Dropzone with Light Sky Blue Surface */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-sky-400 bg-white/90 p-8 text-center hover:border-sky-600 hover:bg-sky-50 transition-all cursor-pointer group mb-6 shadow-sm"
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
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center group-hover:scale-110 shadow-md transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {files.length === 0 ? t('dropTitle') : `${files.length} file(s) selected`}
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Accepted: {tool.acceptedFileTypes.join(', ')} • Max size: Unlimited (Client RAM)
            </p>
          </div>
        </div>

        {/* Selected Files List in Light Sky Blue */}
        {files.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-900 pb-1 border-b border-sky-200">
              <span>{t('inputQueue')} ({files.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles([]);
                  setConvertedResults([]);
                }}
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                {t('clearQueue')}
              </button>
            </div>
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-sky-200 text-xs font-mono text-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate font-semibold">{f.name}</span>
                </div>
                <span className="text-slate-500 shrink-0 ml-4 font-bold">{formatFileSize(f.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tailored Options Panel in Light Sky Blue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-sky-100/70 border border-sky-300 mb-6 text-xs font-mono">
          {tool.options.supportsDpi && (
            <div className="space-y-1.5">
              <label className="text-slate-800 flex items-center gap-1.5 font-bold">
                <Sliders className="w-3.5 h-3.5 text-sky-700" />
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
                        ? 'bg-sky-600 text-white font-bold shadow'
                        : 'bg-white text-slate-700 hover:bg-sky-200 border border-sky-200'
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
              <label className="text-slate-800 flex items-center gap-1.5 font-bold">
                <Layers className="w-3.5 h-3.5 text-sky-700" />
                <span>{t('background')}:</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, backgroundColor: 'transparent' })}
                  className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    settings.backgroundColor === 'transparent'
                      ? 'bg-sky-600 text-white font-bold shadow'
                      : 'bg-white text-slate-700 hover:bg-sky-200 border border-sky-200'
                  }`}
                >
                  {t('transparent')}
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, backgroundColor: 'white' })}
                  className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    settings.backgroundColor === 'white'
                      ? 'bg-sky-600 text-white font-bold shadow'
                      : 'bg-white text-slate-700 hover:bg-sky-200 border border-sky-200'
                  }`}
                >
                  {t('white')}
                </button>
              </div>
            </div>
          )}

          {tool.options.supportsQuality && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-800">
                <label className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                  <span>{t('quality')}:</span>
                </label>
                <span className="text-sky-700 font-bold">{settings.quality}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={settings.quality}
                onChange={(e) => setSettings({ ...settings, quality: parseInt(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Primary Convert Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-600 font-medium">
            <span>✓ No server upload • 100% Client-side sandbox</span>
          </div>

          <button
            onClick={handleConvert}
            disabled={files.length === 0 || isConverting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              files.length === 0 || isConverting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-sky-500/30'
            }`}
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{progressMsg || t('converting')}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" />
                <span>{t('convertNow')}</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <div className="mt-4 space-y-1">
            <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden border border-sky-300">
              <div
                className="bg-sky-600 h-2.5 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-600 font-bold">
              <span>{progressMsg}</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {/* Converted Results & Download Hub */}
        {convertedResults.length > 0 && (
          <div className="mt-8 pt-8 border-t border-sky-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-sky-600" />
                  <span>{t('readyForDownload')} ({convertedResults.length} files)</span>
                </h4>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  High-fidelity output generated inside your browser
                </p>
              </div>

              {convertedResults.length > 1 && (
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-600 text-white px-5 py-2.5 font-mono text-xs font-bold hover:bg-sky-700 transition-all cursor-pointer shadow-md"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isZipping ? 'Packaging ZIP...' : t('downloadAllZip')}</span>
                </button>
              )}
            </div>

            {/* Results Grid in Light Sky Blue Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedResults.map((res) => (
                <div
                  key={res.id}
                  className="rounded-xl border-2 border-sky-300 bg-white p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video rounded-lg bg-sky-50 overflow-hidden mb-3 border border-sky-200 flex items-center justify-center p-1">
                    <img
                      src={res.previewUrl}
                      alt={res.convertedName}
                      className="max-h-full max-w-full object-contain"
                    />
                    {res.pageNumber && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-sky-900 text-white font-mono text-[10px] font-bold">
                        Page {res.pageNumber}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-mono text-xs text-slate-900 truncate font-bold mb-1">
                      {res.convertedName}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-3 font-semibold">
                      <span>{formatFileSize(res.convertedSize)}</span>
                      {res.width && res.height && (
                        <span>{res.width} × {res.height} px</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadSingle(res)}
                    className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('download')}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* ASCII Text Art Preview */}
            {matrixTextArt && (
              <div className="mt-6 p-4 rounded-xl bg-slate-900 border-2 border-sky-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#00ff66] font-bold">
                    Terminal ASCII Text Art Stream:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(matrixTextArt);
                      alert('ASCII Text copied to clipboard!');
                    }}
                    className="text-xs font-mono text-[#00ff66] underline hover:text-white cursor-pointer"
                  >
                    Copy ASCII Text
                  </button>
                </div>
                <pre className="text-[6px] sm:text-[8px] font-mono text-[#00ff66] overflow-x-auto max-h-48 p-2 bg-black/60 rounded border border-[#00ff66]/20 leading-tight">
                  {matrixTextArt}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          LIGHT SKY BLUE EDUCATIONAL & EEAT GUIDE SECTIONS
         ========================================================================= */}

      {/* Section 1: Who Can Use This Tool? */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-400" />
          <span>{t('whoCanUse')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tool.whoCanUse.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] shadow-md text-slate-800"
            >
              <h3 className="text-sm font-bold text-sky-800 font-mono mb-1.5">
                {item.persona}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.useCase}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Where & When To Use This Conversion? */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-sky-400" />
          <span>{t('whereToUse')}</span>
        </h2>
        <div className="space-y-3">
          {tool.whereToUse.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border-2 border-sky-300 bg-[#f0f9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm text-slate-800"
            >
              <div className="font-bold text-sm text-slate-900">
                {item.scenario}
              </div>
              <div className="text-xs text-slate-600 sm:max-w-md sm:text-right font-medium">
                {item.benefit}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Step-by-Step How-To Guide */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {t('howToConvert')}: {tool.fromFormat} → {tool.toFormat}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.steps.map((st) => (
            <div
              key={st.step}
              className="p-6 rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] flex flex-col justify-between shadow-md text-slate-800"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-mono font-bold flex items-center justify-center text-sm mb-4 shadow">
                  0{st.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Technical Format Comparison Table */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {t('formatComparison')}
        </h2>
        <div className="overflow-x-auto rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] shadow-md">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-sky-300 bg-sky-200/90 text-sky-950 font-bold">
                <th className="p-3.5">Feature</th>
                <th className="p-3.5">Source: {tool.fromFormat}</th>
                <th className="p-3.5">Target: {tool.toFormat}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-200 text-slate-800">
              {tool.formatComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-100/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{row.feature}</td>
                  <td className="p-3.5 text-slate-600">{row.fromVal}</td>
                  <td className="p-3.5 text-sky-700 font-bold">{row.toVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {t('faqTitle')}
        </h2>
        <div className="space-y-3">
          {tool.faq.map((item, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-sky-200 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Converters */}
      {relatedTools.length > 0 && (
        <section className="pt-6 border-t border-sky-400/30">
          <h2 className="text-lg font-bold text-white mb-4">
            {t('relatedTools')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((rt) => {
              const rLocalized = getLocalizedTool(rt, currentLang);
              return (
                <div
                  key={rt.id}
                  onClick={() => onSelectTool(rt)}
                  className="p-4 rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="font-mono text-xs text-sky-700 font-bold mb-1">
                    {rt.fromFormat} → {rt.toFormat}
                  </div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                    {rLocalized.name}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
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
