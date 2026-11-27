import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  UploadCloud,
  Search,
  ShieldCheck,
  Zap,
  ArrowRight,
  FileSearch,
  Globe,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  getTranslation,
  getLocalizedTool,
  TOOL_TRANSLATIONS,
  normalizeUiLangCode
} from '../data/languages';
import { getLocalizedToolCategory } from '../data/blogI18n';
import { rescanDomTranslation } from '../services/autoTranslation';
import { ToolDefinition } from '../types';
import { searchTools } from '../utils/toolSearch';

interface HeroSectionProps {
  currentLang: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFileDropped: (files: FileList) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectToolSlug: (slug: string) => void;
  allTools: ToolDefinition[];
  onScrollToTools: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  searchQuery,
  onSearchChange,
  onFileDropped,
  onSelectTool,
  onSelectToolSlug,
  allTools,
  onScrollToTools
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normLang = normalizeUiLangCode(currentLang);
  const t = (key: string) => getTranslation(currentLang, key);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDropped(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileDropped(e.target.files);
    }
  };

  const filteredTools = useMemo(() => {
    return searchQuery.trim() ? searchTools(searchQuery, allTools, currentLang) : [];
  }, [searchQuery, allTools, currentLang]);

  const topResults = filteredTools.slice(0, 10);

  useEffect(() => {
    setHighlightedIdx(0);
    if (searchQuery.trim() && normLang !== 'en') {
      rescanDomTranslation(currentLang, 200);
    }
  }, [searchQuery, currentLang, normLang]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onSearchChange('');
      return;
    }
    if (!topResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev + 1) % topResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev - 1 + topResults.length) % topResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = topResults[highlightedIdx] || topResults[0];
      if (chosen) {
        onSelectTool(chosen);
        onSearchChange('');
      }
    }
  };

  return (
    <section className="relative pt-10 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
        Free Online File &amp; Image Tools —{' '}
        <span className="text-blue-600 dark:text-sky-400">Private, Fast, No Sign-Up.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
        <span className="notranslate" translate="no">{t('subTagline')}</span> Compress, resize, convert formats, strip hidden camera metadata, and organize PDFs right in your browser.
      </p>

      {/* Primary Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.avif,.ico,.bmp,.gif,.heic"
      />

      <div
        data-adsense-exclude="true"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer mb-6 ${
          isDragging
            ? 'border-blue-600 bg-blue-50 dark:bg-sky-950/50 scale-[1.01]'
            : 'border-blue-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 hover:border-blue-500 shadow-lg'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white notranslate" translate="no">
              {t('dropTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drop any photo, SVG, GIF, or PDF to inspect its file signature and launch compatible tools automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              PNG · JPG · WEBP · AVIF · SVG · HEIC · GIF · PDF
            </span>
          </div>
        </div>
      </div>

      {/* Live Tool Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search any tool (e.g. svg to png, pdf to markdown, 100kb)..."
            aria-label="Search tools and jump directly to converter page"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-20 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-30 text-left max-h-80 overflow-y-auto">
            {topResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="tabular-nums">Matching Tools ({filteredTools.length})</span>
                  <span className="text-[10px] text-emerald-500 normal-case">Press Enter to open top tool</span>
                </div>
                {topResults.map((tool, index) => {
                  const localized = getLocalizedTool(tool, currentLang);
                  const hasNative = Boolean(TOOL_TRANSLATIONS[normLang]?.[tool.id]);
                  const isHighlighted = index === highlightedIdx;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIdx(index)}
                      onClick={() => {
                        onSelectTool(tool);
                        onSearchChange('');
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer group ${
                        isHighlighted
                          ? 'bg-emerald-500/15 border border-emerald-500/40'
                          : 'hover:bg-blue-50 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div
                          className={`font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors truncate ${
                            hasNative ? 'notranslate' : ''
                          }`}
                          translate={hasNative ? 'no' : 'yes'}
                        >
                          {localized.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          <span className="notranslate" translate="no">
                            {getLocalizedToolCategory(tool.category, currentLang, tool.categoryName)}
                          </span>{' '}
                          ·{' '}
                          <span className={hasNative ? 'notranslate' : ''} translate={hasNative ? 'no' : 'yes'}>
                            {localized.shortDescription}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-500 shrink-0 ml-2 flex items-center gap-1 notranslate" translate="no">
                        <span>{tool.fromFormat} → {tool.toFormat}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center font-mono text-xs text-slate-500">
                No tools matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Three Signature Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
        <button
          onClick={() => onSelectToolSlug('smart-assistant')}
          className="flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm text-left cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 shrink-0">
            <FileSearch className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 flex items-center justify-between gap-2">
              <span>Smart File Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Verify binary file signatures locally and see only compatible actions.
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectToolSlug('optimization-studio')}
          className="flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm text-left cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 flex items-center justify-between gap-2">
              <span>Optimization Studio</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Resize, convert WebP/AVIF, strip EXIF, rename &amp; ZIP download.
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectToolSlug('website-image-audit')}
          className="flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm text-left cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 flex items-center justify-between gap-2">
              <span>Website Image Audit</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Spot missing ALT attributes, unoptimized formats, and oversized assets.
            </p>
          </div>
        </button>
      </div>

      {/* Honest Architecture Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Browser-Local First:</strong> Media tools execute locally in device memory.
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <Zap className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Zero Sign-Up:</strong> Open directly without accounts or watermarks.
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <Lock className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Honest Disclosures:</strong> Network tools clearly state when external fetches occur.
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onScrollToTools}
          className="text-xs font-mono font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer notranslate"
          translate="no"
        >
          {t('browseAllBelow')} ↓
        </button>
      </div>
    </section>
  );
};
