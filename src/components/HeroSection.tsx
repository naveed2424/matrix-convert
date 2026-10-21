import React, { useState, useRef } from 'react';
import { UploadCloud, Search, ShieldCheck, Cpu, Zap, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { getTranslation, getLocalizedTool } from '../data/languages';
import { ToolDefinition } from '../types';

interface HeroSectionProps {
  currentLang: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFileDropped: (files: FileList) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  allTools: ToolDefinition[];
  onScrollToTools: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  searchQuery,
  onSearchChange,
  onFileDropped,
  onSelectTool,
  allTools,
  onScrollToTools
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Filter matching tools
  const filteredTools = searchQuery.trim()
    ? allTools.filter((tool) => {
        const localized = getLocalizedTool(tool, currentLang);
        const q = searchQuery.toLowerCase();
        return (
          localized.name.toLowerCase().includes(q) ||
          tool.name.toLowerCase().includes(q) ||
          tool.fromFormat.toLowerCase().includes(q) ||
          tool.toFormat.toLowerCase().includes(q) ||
          localized.shortDescription.toLowerCase().includes(q) ||
          tool.seoKeywords.shortTail.some((kw) => kw.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <section className="relative pt-10 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      {/* Decorative Matrix Stream indicator */}
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-950/80 px-4 py-1 text-xs font-mono text-sky-300 mb-6 backdrop-blur-md shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
        </span>
        <span className="font-bold tracking-wide">MATRIX ENGINE // 100% PRIVATE CLIENT-SIDE CONVERTER</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        {t('tagline')}
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-sky-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        {t('subTagline')}
      </p>

      {/* Primary Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3.5 font-mono text-sm font-bold text-white shadow-[0_0_25px_rgba(14,165,233,0.5)] hover:from-sky-300 hover:to-blue-500 hover:shadow-[0_0_35px_rgba(14,165,233,0.8)] transition-all cursor-pointer"
        >
          <UploadCloud className="w-5 h-5 text-white" />
          <span>{t('heroButton')}</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={onScrollToTools}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-sky-400 bg-sky-950/80 font-mono text-xs font-bold text-sky-200 hover:bg-sky-900 hover:text-white transition-colors cursor-pointer shadow-md"
        >
          {t('browseAllBelow')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.avif,.ico,.bmp"
      />

      {/* Universal Drag & Drop Area: Distinct Light Sky Blue Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer backdrop-blur-md mb-8 ${
          isDragging
            ? 'border-sky-500 bg-sky-100 shadow-[0_0_30px_rgba(14,165,233,0.5)] scale-[1.01]'
            : 'border-sky-300 bg-[#f0f9ff] hover:border-sky-500 hover:bg-sky-50 shadow-xl'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t('dropTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-mono font-medium">
              {t('dropSubtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {['PDF', 'PNG', 'SVG', 'WEBP', 'JPG', 'ICO', 'AVIF'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-sky-200/90 text-sky-900 border border-sky-300 shadow-sm"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Search & Filter Bar */}
      <div className="relative max-w-xl mx-auto mb-10">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-sky-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border-2 border-sky-300 bg-white pl-11 pr-4 py-3.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-400 shadow-xl"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 text-xs font-mono font-bold text-sky-700 hover:text-slate-900 px-2 py-1 cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown in Light Sky Blue */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border-2 border-sky-300 bg-white p-3 shadow-2xl z-30 text-left max-h-80 overflow-y-auto">
            {filteredTools.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-sky-800 font-bold tracking-wider border-b border-sky-200">
                  Matching Converters ({filteredTools.length})
                </div>
                {filteredTools.map((tool) => {
                  const localized = getLocalizedTool(tool, currentLang);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool);
                        onSearchChange('');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-sky-100 text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-2">
                          {localized.name}
                          {tool.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-semibold">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                          {localized.shortDescription}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-700 shrink-0 ml-2">
                        {tool.fromFormat} → {tool.toFormat}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center font-mono text-xs text-slate-600">
                No tools matching "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust & Guarantee Badges: Light Sky Blue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f0f9ff] border-2 border-sky-300 shadow-md">
          <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              100% Client-Side Privacy
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
              Files processed in browser sandboxed memory. Zero server uploads.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f0f9ff] border-2 border-sky-300 shadow-md">
          <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              No Limits or Watermarks
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
              Free forever for everyone. Unlimited conversions without registration.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f0f9ff] border-2 border-sky-300 shadow-md">
          <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              High-DPI & Vector Fidelity
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
              Export up to 300 DPI for print and infinite scalable vector SVG geometry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
