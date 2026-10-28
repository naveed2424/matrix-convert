import React, { useState } from 'react';
import {
  Globe,
  Terminal,
  ChevronDown,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  PenTool,
  Scissors,
  Layers,
  FileText,
  Archive,
  Trash2,
  RotateCw,
  Image as ImageIcon
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/languages';
import { ToolDefinition } from '../types';

interface NavbarProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
  onSelectToolBySlug: (slug: string) => void;
  onOpenMatrixArt: () => void;
  onNavigateBlog: () => void;
  onNavigateStudio: () => void;
  onNavigateAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  onNavigateHome,
  onNavigateCategory,
  onSelectToolBySlug,
  onOpenMatrixArt,
  onNavigateBlog,
  onNavigateStudio,
  onNavigateAbout
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [allToolsDropdownOpen, setAllToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (k: string) => getTranslation(currentLang, k);
  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleToolClick = (slug: string) => {
    setAllToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    onSelectToolBySlug(slug);
  };

  const handleCategoryClick = (catId: string) => {
    setAllToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigateCategory(catId);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sky-400/30 bg-[#050807]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left font-mono text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="text-sky-400 text-glow text-xl">⚡</span>
          <span>MatrixConvert</span>
        </button>

        {/* Desktop Nav - Sejda Style Tool Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-mono font-medium text-slate-200">
          {/* "All Tools" Mega Menu Button */}
          <div className="relative">
            <button
              onClick={() => setAllToolsDropdownOpen(!allToolsDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                allToolsDropdownOpen
                  ? 'bg-sky-500 text-white font-bold shadow'
                  : 'hover:bg-sky-950/60 hover:text-sky-300 text-white font-semibold'
              }`}
            >
              <span>All Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${allToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Categorized Mega Menu Dropdown (Matches Sejda's all-tools menu) */}
            {allToolsDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-[720px] rounded-2xl border border-sky-400/50 bg-[#06141c] p-6 shadow-2xl backdrop-blur-2xl z-50 max-h-[85vh] overflow-y-auto"
                onMouseLeave={() => setAllToolsDropdownOpen(false)}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-400/20">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                    All 26+ Client-Side Tools by Category
                  </span>
                  <button
                    onClick={() => handleCategoryClick('all')}
                    className="text-[11px] text-sky-300 hover:underline cursor-pointer"
                  >
                    View All Grid →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 text-xs font-mono">
                  {/* Column 1: Edit & Sign + Security */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block mb-2">
                        Edit & Sign
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('fill-and-sign-pdf')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer font-bold text-white"
                          >
                            <PenTool className="w-3 h-3 text-sky-400" />
                            <span>Fill & Sign PDF</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('delete-pdf-pages')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                            <span>Delete PDF Pages</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('watermark-pdf')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Watermark PDF</span>
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-2">
                        Merge & Split
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('merge-pdf')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer font-bold text-white"
                          >
                            <Layers className="w-3 h-3 text-blue-400" />
                            <span>Merge PDF Files</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('split-pdf')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer"
                          >
                            <Scissors className="w-3 h-3 text-cyan-400" />
                            <span>Split & Extract Pages</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Column 2: Crop & Resize + Optimize */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-2">
                        Crop & Resize
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('crop-pdf-margins')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer font-bold text-white"
                          >
                            <Scissors className="w-3 h-3 text-emerald-400" />
                            <span>Crop PDF Margins</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('rotate-pdf')}
                            className="hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3 text-amber-400" />
                            <span>Rotate PDF Pages</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('image-resize')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Image Resizer & Scaler
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('image-crop')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Image Crop Tool
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block mb-2">
                        Compress & Edit
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('image-compress')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Smart Image Compressor
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('image-grayscale')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Grayscale / B&W Filter
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Column 3: Converters & Cyber Art */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-2">
                        Convert from PDF
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('pdf-to-png')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            PDF to PNG (High DPI)
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('pdf-to-svg')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            PDF to SVG Vector
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('pdf-to-jpg')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            PDF to JPG
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('pdf-to-text')}
                            className="hover:text-sky-400 flex items-center gap-1 text-left w-full cursor-pointer font-bold text-teal-300"
                          >
                            <FileText className="w-3 h-3 text-teal-400" />
                            <span>PDF to Text</span>
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block mb-2">
                        Convert to PDF & Icons
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>
                          <button
                            onClick={() => handleToolClick('image-to-pdf')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Images to PDF
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('png-to-ico')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            PNG to ICO Favicon
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleToolClick('image-matrix-art')}
                            className="hover:text-sky-400 text-left w-full cursor-pointer"
                          >
                            Matrix Rain ASCII Art
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sejda Quick Action Links */}
          <button
            onClick={() => handleToolClick('image-compress')}
            className="px-2.5 py-1.5 rounded-lg hover:text-sky-300 hover:bg-sky-950/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            Compress
          </button>

          <button
            onClick={() => handleToolClick('fill-and-sign-pdf')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors whitespace-nowrap cursor-pointer font-bold"
          >
            <PenTool className="w-3 h-3 text-sky-400" />
            <span>Fill & Sign</span>
          </button>

          <button
            onClick={() => handleToolClick('crop-pdf-margins')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-colors whitespace-nowrap cursor-pointer font-bold"
          >
            <Scissors className="w-3 h-3 text-emerald-400" />
            <span>Crop</span>
          </button>

          <button
            onClick={() => handleToolClick('merge-pdf')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-sky-300 hover:bg-sky-950/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Merge</span>
          </button>

          <button
            onClick={() => handleToolClick('delete-pdf-pages')}
            className="px-2.5 py-1.5 rounded-lg hover:text-red-300 hover:bg-red-500/10 transition-colors whitespace-nowrap cursor-pointer"
          >
            Delete Pages
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Blog & Guides */}
          <button
            onClick={onNavigateBlog}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-sky-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-sky-400" />
            <span>Blog</span>
          </button>

          {/* Daily SEO Studio */}
          <button
            onClick={onNavigateStudio}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-cyan-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>SEO Studio</span>
          </button>

          {/* Matrix Art */}
          <button
            onClick={onOpenMatrixArt}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sky-400 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Terminal className="w-3 h-3" />
            <span>Matrix Art</span>
          </button>
        </nav>

        {/* Right Zone: Language + Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-950/80 px-2.5 py-1.5 text-xs font-mono text-sky-200 hover:border-sky-300 hover:text-white transition-colors cursor-pointer shadow-sm"
              aria-label="Select website language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline font-bold">{activeLanguage.nativeName}</span>
              <span className="sm:hidden font-bold">{activeLanguage.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-sky-300" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl border-2 border-sky-400 bg-[#06141c] py-2 shadow-2xl backdrop-blur-xl z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3.5 py-1.5 text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold border-b border-sky-500/20">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-sky-100 hover:bg-sky-900/60 hover:text-white'
                    }`}
                  >
                    <span>{lang.nativeName} ({lang.name})</span>
                    <span className="text-sm ml-2">{lang.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-sky-400/40 bg-sky-950/60 text-sky-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-400/30 bg-[#050807]/98 px-4 py-6 font-mono text-xs space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToolClick('fill-and-sign-pdf')}
              className="p-3 rounded-xl border border-sky-400/30 bg-sky-950/40 text-left font-bold text-sky-300 flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Fill & Sign PDF</span>
            </button>
            <button
              onClick={() => handleToolClick('crop-pdf-margins')}
              className="p-3 rounded-xl border border-emerald-400/30 bg-emerald-950/40 text-left font-bold text-emerald-300 flex items-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>Crop PDF</span>
            </button>
            <button
              onClick={() => handleToolClick('merge-pdf')}
              className="p-3 rounded-xl border border-blue-400/30 bg-blue-950/40 text-left font-bold text-blue-300 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Merge PDF</span>
            </button>
            <button
              onClick={() => handleToolClick('delete-pdf-pages')}
              className="p-3 rounded-xl border border-red-400/30 bg-red-950/40 text-left font-bold text-red-300 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Pages</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateHome();
                onNavigateCategory('all');
              }}
              className="block w-full py-2 text-left text-white font-bold"
            >
              Browse All 26+ Tools →
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateBlog();
              }}
              className="block w-full py-2 text-left text-slate-300"
            >
              Blog & Conversion Guides
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateStudio();
              }}
              className="block w-full py-2 text-left text-cyan-300"
            >
              Daily SEO Trending Studio
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMatrixArt();
              }}
              className="block w-full py-2 text-left text-sky-400"
            >
              Matrix Art Studio
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
