import React from 'react';
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
  ArrowRight,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { ToolDefinition } from '../types';
import { TOOL_CATEGORIES } from '../data/toolsData';
import { getTranslation, getLocalizedTool } from '../data/languages';

interface ToolsGridProps {
  tools: ToolDefinition[];
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  currentLang: string;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  tools,
  activeCategory,
  onSelectCategory,
  onSelectTool,
  currentLang
}) => {
  const t = (k: string) => getTranslation(currentLang, k);

  // Category translation map
  const getCategoryLabel = (catId: string, defaultName: string) => {
    switch (catId) {
      case 'all':
        return t('allTools');
      case 'popular':
        return t('popularTools');
      case 'edit-sign':
        return 'Edit & Sign';
      case 'crop-resize':
        return 'Crop & Resize';
      case 'merge-split':
        return 'Merge & Split';
      case 'convert-pdf':
        return 'Convert from PDF';
      case 'convert-to-pdf':
        return 'Convert to PDF';
      case 'convert-svg':
        return 'Vector & SVG';
      case 'convert-webp':
        return 'WebP & Next-Gen';
      case 'icon-tools':
        return 'Icons & Art';
      case 'optimize-edit':
        return 'Optimize & Edit';
      default:
        return defaultName;
    }
  };

  const displayedTools =
    activeCategory === 'all'
      ? tools
      : activeCategory === 'popular'
      ? tools.filter((t) => t.isPopular)
      : activeCategory === 'edit-sign'
      ? tools.filter((t) => t.category === 'edit-sign')
      : activeCategory === 'crop-resize'
      ? tools.filter((t) => t.category === 'crop-resize')
      : activeCategory === 'merge-split'
      ? tools.filter((t) => t.category === 'merge-split')
      : activeCategory === 'convert-pdf'
      ? tools.filter((t) => t.categoryName === 'Convert from PDF')
      : activeCategory === 'convert-to-pdf'
      ? tools.filter((t) => t.toFormat === 'PDF' && t.fromFormat !== 'PDF')
      : activeCategory === 'convert-svg'
      ? tools.filter((t) => t.categoryName.includes('SVG'))
      : activeCategory === 'convert-webp'
      ? tools.filter((t) => t.categoryName.includes('WebP'))
      : activeCategory === 'icon-tools'
      ? tools.filter((t) => t.category === 'icon-tools')
      : activeCategory === 'optimize-edit'
      ? tools.filter((t) => t.category === 'optimize-edit')
      : tools;

  const getToolIcon = (tool: ToolDefinition) => {
    if (tool.id === 'pdf-sign') return <Sparkles className="w-5 h-5 text-sky-400" />;
    if (tool.id === 'pdf-crop') return <Crop className="w-5 h-5 text-emerald-400" />;
    if (tool.id === 'pdf-merge') return <Layers className="w-5 h-5 text-blue-400" />;
    if (tool.id === 'pdf-split') return <Sliders className="w-5 h-5 text-cyan-400" />;
    if (tool.id === 'pdf-delete-pages') return <Archive className="w-5 h-5 text-red-400" />;
    if (tool.id === 'pdf-rotate') return <RotateCw className="w-5 h-5 text-amber-400" />;
    if (tool.id === 'pdf-watermark') return <Sparkles className="w-5 h-5 text-purple-400" />;
    if (tool.id === 'pdf-to-text') return <FileText className="w-5 h-5 text-teal-400" />;
    if (tool.id === 'image-matrix-art') return <Terminal className="w-5 h-5 text-white" />;
    if (tool.fromFormat === 'PDF' || tool.toFormat === 'PDF') return <FileText className="w-5 h-5 text-white" />;
    if (tool.toFormat === 'SVG' || tool.fromFormat === 'SVG') return <Layers className="w-5 h-5 text-white" />;
    if (tool.id.includes('compress')) return <Archive className="w-5 h-5 text-white" />;
    if (tool.id.includes('crop')) return <Crop className="w-5 h-5 text-white" />;
    if (tool.id.includes('rotate')) return <RotateCw className="w-5 h-5 text-white" />;
    if (tool.id.includes('resize')) return <Maximize2 className="w-5 h-5 text-white" />;
    return <Image className="w-5 h-5 text-white" />;
  };

  return (
    <section id="tools-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Tabs: High-Contrast Light Sky Blue Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-sky-400/30 scrollbar-thin">
        {TOOL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-sky-500 text-white font-bold shadow-[0_0_16px_rgba(14,165,233,0.6)] border-2 border-sky-300'
                  : 'bg-sky-100/90 text-sky-950 hover:bg-sky-200 border border-sky-300 font-semibold'
              }`}
            >
              {getCategoryLabel(cat.id, cat.name)} ({cat.count})
            </button>
          );
        })}
      </div>

      {/* Tools Grid: Distinct Light Sky Blue Cards as requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTools.map((tool) => {
          const localized = getLocalizedTool(tool, currentLang);

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="group relative rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] p-5 shadow-xl hover:shadow-2xl hover:border-sky-500 hover:bg-sky-50 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                {/* Header inside card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getToolIcon(tool)}
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xs font-extrabold text-sky-700 bg-sky-200/80 px-2 py-0.5 rounded-md border border-sky-300">
                      {tool.fromFormat} → {tool.toFormat}
                    </span>
                    {tool.badge && (
                      <span className="text-[10px] font-mono text-sky-800 font-medium mt-1">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tool Title in Crisp Dark Slate */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-2">
                  {localized.name}
                </h3>

                {/* Tool Short Description in Readable Dark Slate */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {localized.shortDescription}
                </p>
              </div>

              {/* Bottom Card Action Bar */}
              <div className="pt-3 border-t border-sky-200 flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-sky-800 font-semibold">
                  {tool.categoryName}
                </span>
                <span className="text-sky-600 group-hover:text-sky-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t('openTool')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
