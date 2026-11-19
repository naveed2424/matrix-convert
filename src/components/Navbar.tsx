import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  FileSearch,
  ShieldCheck,
  Terminal,
  Search,
  ArrowRight
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLocalizedTool } from '../data/languages';
import { TOOL_CATEGORIES, TOOLS_DATA } from '../data/toolsData';
import { searchTools } from '../utils/toolSearch';

interface NavbarProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
  onSelectToolBySlug: (slug: string) => void;
  onOpenMatrixArt: () => void;
  onNavigateBlog: () => void;
  onNavigatePrivacyCenter: () => void;
  onNavigateMethodology: () => void;
  onSearchInDirectory?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  onNavigateHome,
  onNavigateCategory,
  onSelectToolBySlug,
  onOpenMatrixArt,
  onNavigateBlog,
  onNavigatePrivacyCenter,
  onNavigateMethodology,
  onSearchInDirectory
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [headerQuery, setHeaderQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const matchingTools = useMemo(() => {
    if (!headerQuery.trim()) return [];
    return searchTools(headerQuery, TOOLS_DATA, currentLang);
  }, [headerQuery, currentLang]);

  const topMatches = matchingTools.slice(0, 8);

  useEffect(() => {
    setHighlightedIdx(0);
  }, [headerQuery]);

  // Global "/" hotkey focuses the header search bar cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      if (window.innerWidth >= 1024 && desktopSearchInputRef.current) {
        desktopSearchInputRef.current.focus();
      } else {
        setMobileMenuOpen(true);
        setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (slug: string) => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    setSearchFocused(false);
    setHeaderQuery('');
    onSelectToolBySlug(slug);
  };

  const handleCategoryClick = (catId: string) => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    setSearchFocused(false);
    onNavigateCategory(catId);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchFocused(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (!topMatches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev + 1) % topMatches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev - 1 + topMatches.length) % topMatches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = topMatches[highlightedIdx] || topMatches[0];
      if (chosen) {
        handleToolClick(chosen.slug);
      }
    }
  };

  const handleViewAllSearchResults = () => {
    const q = headerQuery.trim();
    setSearchFocused(false);
    setMobileMenuOpen(false);
    if (onSearchInDirectory) {
      onSearchInDirectory(q);
    } else {
      onNavigateCategory('all');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">
        {/* Left Zone: Clean Wordmark Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left font-bold text-lg tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-sm font-extrabold flex items-center justify-center shadow-xs">
            M
          </span>
          <span>Mimage</span>
        </button>

        {/* Center Zone: Single-Row Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          <div className="relative">
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolsDropdownOpen
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold'
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {toolsDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-[660px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-50"
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Mimage Tool Directory ({TOOLS_DATA.length} Utilities)
                  </span>
                  <button
                    onClick={() => handleCategoryClick('all')}
                    className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    View All Tools
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 text-xs">
                  {/* Column 1: Signature Workflows */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400 block">
                      Signature Workspaces
                    </span>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>
                        <button
                          onClick={() => handleToolClick('smart-assistant')}
                          className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1.5 text-left w-full font-semibold cursor-pointer"
                        >
                          <FileSearch className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                          <span>Smart File Assistant</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleToolClick('optimization-studio')}
                          className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1.5 text-left w-full font-semibold cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                          <span>Optimization Studio</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleToolClick('website-image-audit')}
                          className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1.5 text-left w-full font-semibold cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                          <span>Website Image Audit</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setToolsDropdownOpen(false);
                            onOpenMatrixArt();
                          }}
                          className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1.5 text-left w-full cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Matrix Art Studio</span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: 7 Categories */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      7 Categories
                    </span>
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      {TOOL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                        <li key={cat.id}>
                          <button
                            onClick={() => handleCategoryClick(cat.id)}
                            className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center justify-between w-full text-left py-0.5 cursor-pointer"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 tabular-nums">{cat.count}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Popular Tasks */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Popular Shortcuts
                    </span>
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      {[
                        { slug: 'svg-to-png', label: 'SVG to PNG Converter' },
                        { slug: 'compress-image-to-100kb', label: 'Compress to 100 KB' },
                        { slug: 'resize-image-for-instagram', label: 'Social Media Resizer' },
                        { slug: 'remove-image-metadata', label: 'EXIF Viewer & Remover' },
                        { slug: 'pdf-to-png', label: 'PDF to PNG / JPG' },
                        { slug: 'pdf-to-markdown', label: 'PDF to Markdown' },
                        { slug: 'qr-code-generator', label: 'QR Code Generator' }
                      ].map((item) => (
                        <li key={item.slug}>
                          <button
                            onClick={() => handleToolClick(item.slug)}
                            className="hover:text-blue-600 dark:hover:text-sky-400 text-left w-full py-0.5 cursor-pointer"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleToolClick('smart-assistant')}
            className="px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Assistant
          </button>

          <button
            onClick={() => handleToolClick('optimization-studio')}
            className="px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Studio
          </button>

          <button
            onClick={() => handleToolClick('website-image-audit')}
            className="px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Audit
          </button>

          <button
            onClick={onNavigateBlog}
            className="px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Guides
          </button>

          <button
            onClick={onNavigatePrivacyCenter}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy</span>
          </button>

          <button
            onClick={onNavigateMethodology}
            className="hidden xl:inline-flex px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Diagnostics
          </button>
        </nav>

        {/* Global Direct-to-Tool Search + Language + Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Global Search Combobox */}
          <div ref={searchContainerRef} className="relative hidden md:block w-56 lg:w-60 xl:w-72">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={desktopSearchInputRef}
                type="search"
                role="combobox"
                aria-expanded={searchFocused && headerQuery.trim().length > 0}
                aria-controls="navbar-tool-search-results"
                aria-label="Search all Mimage tools"
                value={headerQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setHeaderQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search ${TOOLS_DATA.length} tools (e.g. svg to png)`}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-8 pr-12 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {headerQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderQuery('');
                    desktopSearchInputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd
                  title="Press / to focus search"
                  className="hidden sm:inline-block absolute right-2.5 text-[10px] font-mono text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 pointer-events-none"
                >
                  /
                </kbd>
              )}
            </div>

            {searchFocused && headerQuery.trim().length > 0 && (
              <div
                id="navbar-tool-search-results"
                role="listbox"
                className="absolute right-0 mt-2 w-[380px] sm:w-[440px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 max-h-[420px] overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="tabular-nums">
                    {matchingTools.length} matching {matchingTools.length === 1 ? 'tool' : 'tools'}
                  </span>
                  {topMatches.length > 0 && (
                    <span className="text-[10px] text-emerald-500">Enter to open top match</span>
                  )}
                </div>

                {topMatches.length > 0 ? (
                  <div className="py-1 space-y-0.5">
                    {topMatches.map((tool, index) => {
                      const localized = getLocalizedTool(tool, currentLang);
                      const isHighlighted = index === highlightedIdx;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          role="option"
                          aria-selected={isHighlighted}
                          onMouseEnter={() => setHighlightedIdx(index)}
                          onClick={() => handleToolClick(tool.slug)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isHighlighted
                              ? 'bg-emerald-500/15 border border-emerald-500/40'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {localized.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {tool.categoryName} · {localized.shortDescription}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] font-semibold text-emerald-500">
                            <span>
                              {tool.fromFormat} → {tool.toFormat}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}

                    {matchingTools.length > topMatches.length && (
                      <button
                        type="button"
                        onClick={handleViewAllSearchResults}
                        className="w-full mt-1 px-3 py-2 rounded-xl text-center text-xs font-semibold text-blue-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Show all {matchingTools.length} matching tools in directory →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center space-y-2">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      No direct match found for &ldquo;{headerQuery}&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick('all')}
                      className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Browse all {TOOLS_DATA.length} tools in directory →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
              aria-label="Select website language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span className="hidden sm:inline font-semibold">{activeLanguage.nativeName}</span>
              <span className="sm:hidden font-semibold">{activeLanguage.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 shadow-2xl z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3.5 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  Translate Interface
                </div>
                {currentLang !== 'en' && (
                  <button
                    onClick={() => {
                      onSelectLang('en');
                      setLangMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-3.5 py-2 text-xs text-left bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 font-semibold border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Reset to English</span>
                    <span>🇺🇸</span>
                  </button>
                )}
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>
                      {lang.nativeName} ({lang.name})
                    </span>
                    <span className="text-sm ml-2">{lang.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-5 text-xs space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile Direct Tool Search */}
          <div className="space-y-2">
            <label htmlFor="mobile-tool-search" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Jump directly to any tool ({TOOLS_DATA.length})
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="mobile-tool-search"
                ref={mobileSearchInputRef}
                type="search"
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search e.g. svg to png, pdf to markdown..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {headerQuery && (
                <button
                  type="button"
                  onClick={() => setHeaderQuery('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200"
                  aria-label="Clear mobile search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {headerQuery.trim().length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/70 divide-y divide-slate-800 max-h-60 overflow-y-auto">
                {topMatches.length > 0 ? (
                  topMatches.map((tool) => {
                    const localized = getLocalizedTool(tool, currentLang);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToolClick(tool.slug)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="font-semibold text-white truncate">{localized.name}</span>
                        <span className="font-mono text-[11px] text-emerald-400 shrink-0">
                          {tool.fromFormat} → {tool.toFormat}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center font-mono text-slate-400">
                    No matching tools for &ldquo;{headerQuery}&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToolClick('smart-assistant')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-left font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              Smart Assistant
            </button>
            <button
              onClick={() => handleToolClick('optimization-studio')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-left font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              Optimization Studio
            </button>
            <button
              onClick={() => handleToolClick('website-image-audit')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-left font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              Website Image Audit
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMatrixArt();
              }}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-left font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              Matrix Art Studio
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-slate-700 dark:text-slate-300 font-medium">
            <button
              onClick={() => handleCategoryClick('all')}
              className="block w-full py-1.5 text-left font-semibold text-blue-600 dark:text-sky-400 cursor-pointer"
            >
              All Tools Directory
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateBlog();
              }}
              className="block w-full py-1.5 text-left cursor-pointer"
            >
              Guides & Articles
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigatePrivacyCenter();
              }}
              className="block w-full py-1.5 text-left cursor-pointer"
            >
              Privacy Center
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateMethodology();
              }}
              className="block w-full py-1.5 text-left cursor-pointer"
            >
              Diagnostics & Feedback
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
