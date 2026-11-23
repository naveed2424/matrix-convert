import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Image,
  Layers,
  Sparkles,
  Maximize2,
  Crop,
  RotateCw,
  Sliders,
  Archive,
  Terminal,
  Minimize2,
  Scissors,
  ScanText,
  ShieldCheck,
  QrCode,
  Palette,
  Code2,
  Film,
  Search,
  X
} from 'lucide-react';
import { ToolDefinition } from '../types';
import { TOOL_CATEGORIES } from '../data/toolsData';
import {
  getTranslation,
  getLocalizedTool,
  TOOL_TRANSLATIONS,
  normalizeUiLangCode
} from '../data/languages';
import { getLocalizedToolCategory } from '../data/blogI18n';
import { rescanDomTranslation } from '../services/autoTranslation';
import { searchTools } from '../utils/toolSearch';

interface ToolsGridProps {
  tools: ToolDefinition[];
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectToolSlug: (slug: string) => void;
  currentLang: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const PLAIN_LANGUAGE_SHORTCUTS = [
  {
    label: 'Make an image smaller',
    detail: 'Target exact 100 KB, 200 KB, or 500 KB limits',
    slug: 'compress-image-to-100kb',
    icon: Minimize2
  },
  {
    label: 'Convert a photo to JPG',
    detail: 'Turn PNG, WebP, or HEIC shots into standard JPG',
    slug: 'png-to-jpg',
    icon: Image
  },
  {
    label: 'Resize an image for Instagram',
    detail: '1:1, 4:5 portrait, Story 9:16, YouTube & LinkedIn presets',
    slug: 'resize-image-for-instagram',
    icon: Maximize2
  },
  {
    label: 'Remove an image background',
    detail: 'Key out solid white or backdrop pixels to transparent PNG',
    slug: 'image-transparent-png-maker',
    icon: Scissors
  },
  {
    label: 'Convert PDF pages to images',
    detail: 'Export crisp PNG or JPG frames at 72, 150, or 300 DPI',
    slug: 'pdf-to-png',
    icon: FileText
  },
  {
    label: 'Extract text from a picture',
    detail: 'Run offline-capable Tesseract OCR on scans or screenshots',
    slug: 'ocr-extract-text',
    icon: ScanText
  }
];

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  tools,
  activeCategory,
  onSelectCategory,
  onSelectTool,
  onSelectToolSlug,
  currentLang,
  searchQuery = '',
  onSearchChange
}) => {
  const [sortBy, setSortBy] = useState<'recommended' | 'az' | 'category'>('recommended');
  const [localDirectoryQuery, setLocalDirectoryQuery] = useState('');
  const effectiveQuery = onSearchChange ? searchQuery : localDirectoryQuery;
  const setEffectiveQuery = onSearchChange || setLocalDirectoryQuery;

  const normLang = normalizeUiLangCode(currentLang);
  const t = (k: string) => getTranslation(currentLang, k);

  useEffect(() => {
    if (normLang !== 'en') {
      rescanDomTranslation(currentLang, 280);
    }
  }, [activeCategory, sortBy, effectiveQuery, currentLang, normLang]);

  const displayedTools = useMemo(() => {
    let list = tools;
    if (activeCategory === 'popular') {
      list = tools.filter((tool) => tool.isPopular);
    } else if (activeCategory === 'recent') {
      list = tools.filter((tool) => tool.isRecentlyAdded);
    } else if (activeCategory === 'recommended') {
      list = tools.filter((tool) => tool.isRecommended);
    } else if (activeCategory !== 'all') {
      list = tools.filter((tool) => tool.category === activeCategory);
    }

    if (effectiveQuery.trim()) {
      // Preserve relevance ranking order when searching
      return searchTools(effectiveQuery, list, currentLang);
    }

    const sorted = [...list];
    if (sortBy === 'az') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        const scoreA = (a.isRecommended ? 3 : 0) + (a.isPopular ? 2 : 0) + (a.isRecentlyAdded ? 1 : 0);
        const scoreB = (b.isRecommended ? 3 : 0) + (b.isPopular ? 2 : 0) + (b.isRecentlyAdded ? 1 : 0);
        return scoreB - scoreA;
      });
    }
    return sorted;
  }, [tools, activeCategory, sortBy, effectiveQuery, currentLang]);

  const getToolIcon = (tool: ToolDefinition) => {
    if (tool.id === 'qr-code-generator') return <QrCode className="w-5 h-5 text-white" />;
    if (tool.id.includes('palette') || tool.id.includes('color-extractor')) return <Palette className="w-5 h-5 text-white" />;
    if (tool.id.includes('base64') || tool.id.includes('svg-optimizer') || tool.id.includes('audit')) {
      return <Code2 className="w-5 h-5 text-white" />;
    }
    if (tool.id.includes('gif')) return <Film className="w-5 h-5 text-white" />;
    if (tool.id.includes('exif') || tool.id.includes('metadata')) return <ShieldCheck className="w-5 h-5 text-white" />;
    if (tool.id === 'ocr-extract-text') return <ScanText className="w-5 h-5 text-white" />;
    if (tool.id === 'image-matrix-art') return <Terminal className="w-5 h-5 text-white" />;
    if (tool.fromFormat === 'PDF' || tool.toFormat === 'PDF') return <FileText className="w-5 h-5 text-white" />;
    if (tool.toFormat === 'SVG' || tool.fromFormat === 'SVG') return <Layers className="w-5 h-5 text-white" />;
    if (tool.id.includes('compress')) return <Archive className="w-5 h-5 text-white" />;
    if (tool.id.includes('crop')) return <Crop className="w-5 h-5 text-white" />;
    if (tool.id.includes('rotate')) return <RotateCw className="w-5 h-5 text-white" />;
    if (tool.id.includes('resize')) return <Maximize2 className="w-5 h-5 text-white" />;
    if (tool.id.includes('watermark') || tool.id.includes('duotone')) return <Sparkles className="w-5 h-5 text-white" />;
    if (tool.id.includes('split')) return <Sliders className="w-5 h-5 text-white" />;
    return <Image className="w-5 h-5 text-white" />;
  };

  const quickCollectionTabs = [
    { id: 'all', name: getLocalizedToolCategory('all', currentLang, 'All Tools'), count: tools.length, isLocalizedDict: true },
    { id: 'popular', name: 'Popular', count: tools.filter((x) => x.isPopular).length, isLocalizedDict: false },
    { id: 'recent', name: 'Recently Added', count: tools.filter((x) => x.isRecentlyAdded).length, isLocalizedDict: false },
    { id: 'recommended', name: 'Recommended', count: tools.filter((x) => x.isRecommended).length, isLocalizedDict: false },
    ...TOOL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      ...c,
      name: getLocalizedToolCategory(c.id, currentLang, c.name),
      isLocalizedDict: true
    }))
  ];

  return (
    <section id="tools-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Everyday Task Shortcuts: "What do you want to do today?" */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              What do you want to do today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Plain-language shortcuts so you don&apos;t need to guess technical file formats.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">6 common tasks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PLAIN_LANGUAGE_SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.slug}
                onClick={() => onSelectToolSlug(item.slug)}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-sky-950/60 text-blue-700 dark:text-sky-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.detail}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Tools Directory */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              All Tools Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              Showing {displayedTools.length} of {tools.length} utilities across 7 categories
              {effectiveQuery.trim() ? ` matching "${effectiveQuery.trim()}"` : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Inline Directory Search Bar */}
            <div className="relative flex items-center w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="search"
                value={effectiveQuery}
                onChange={(e) => setEffectiveQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && effectiveQuery.trim() && displayedTools.length > 0) {
                    e.preventDefault();
                    onSelectTool(displayedTools[0]);
                  } else if (e.key === 'Escape') {
                    setEffectiveQuery('');
                  }
                }}
                placeholder="Filter directory (e.g. svg to png)..."
                aria-label="Filter All Tools Directory"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-8 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {effectiveQuery && (
                <button
                  type="button"
                  onClick={() => setEffectiveQuery('')}
                  aria-label="Clear directory filter"
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <label htmlFor="tool-sort-select" className="text-slate-500 dark:text-slate-400 font-medium">
                Sort:
              </label>
              <select
                id="tool-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recommended' | 'az' | 'category')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="recommended">Recommended First</option>
                <option value="az">Alphabetical (A–Z)</option>
                <option value="category">By Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          {quickCollectionTabs.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  cat.isLocalizedDict ? 'notranslate ' : ''
                }${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
                translate={cat.isLocalizedDict ? 'no' : 'yes'}
              >
                {cat.name} ({cat.count})
              </button>
            );
          })}
        </div>

        {/* Tools Cards Grid or Empty State */}
        {displayedTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedTools.map((tool) => {
              const localized = getLocalizedTool(tool, currentLang);
              const hasNativeToolTranslation = Boolean(TOOL_TRANSLATIONS[normLang]?.[tool.id]);

              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool)}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-sky-500 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-sky-600 flex items-center justify-center shrink-0">
                        {getToolIcon(tool)}
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-sky-400 notranslate" translate="no">
                          {tool.fromFormat} → {tool.toFormat}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {tool.processingMode === 'network-fetch' || tool.processingMode === 'optional-network'
                            ? 'Network URL Fetch'
                            : tool.processingMode === 'browser-local-plus-cdn'
                            ? 'Local + Dict Fetch'
                            : 'Browser-Local'}
                        </div>
                      </div>
                    </div>

                    <h3
                      className={`text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors mb-1.5 ${
                        hasNativeToolTranslation ? 'notranslate' : ''
                      }`}
                      translate={hasNativeToolTranslation ? 'no' : 'yes'}
                    >
                      {localized.name}
                    </h3>

                    <p
                      className={`text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 ${
                        hasNativeToolTranslation ? 'notranslate' : ''
                      }`}
                      translate={hasNativeToolTranslation ? 'no' : 'yes'}
                    >
                      {localized.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="notranslate" translate="no">
                        {getLocalizedToolCategory(tool.category, currentLang, tool.categoryName)}
                      </span>
                      {tool.badge ? ` · ${tool.badge}` : ''}
                    </span>
                    <span
                      className="text-blue-600 dark:text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform notranslate"
                      translate="no"
                    >
                      {t('openTool')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/60 p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-white">
              No tools matched &ldquo;{effectiveQuery}&rdquo; in this category.
            </p>
            <p className="text-xs text-slate-400">
              Try clearing your filter or switching to &ldquo;All Tools&rdquo; to search across all {tools.length} utilities.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEffectiveQuery('');
                  onSelectCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs cursor-pointer transition-colors"
              >
                Show All {tools.length} Tools
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
