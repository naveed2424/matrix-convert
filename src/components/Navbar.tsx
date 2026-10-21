import React, { useState } from 'react';
import { Globe, Terminal, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/languages';

interface NavbarProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
  onOpenMatrixArt: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  onNavigateHome,
  onNavigateCategory,
  onOpenMatrixArt
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = (k: string) => getTranslation(currentLang, k);
  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 border-b border-sky-400/30 bg-[#050807]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left font-mono text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="text-sky-400 text-glow text-xl">⚡</span>
          <span>MatrixConvert</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text links with dynamic translation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-100">
          <button
            onClick={() => {
              onNavigateHome();
              onNavigateCategory('all');
            }}
            className="hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('allTools')}
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              onNavigateCategory('convert-pdf');
            }}
            className="hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('convertPdf')}
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              onNavigateCategory('convert-svg');
            }}
            className="hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('convertSvg')}
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              onNavigateCategory('convert-webp');
            }}
            className="hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('convertWebp')}
          </button>
          <button
            onClick={onOpenMatrixArt}
            className="flex items-center gap-1.5 text-sky-400 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono font-semibold"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t('matrixArtStudio')}</span>
          </button>
        </nav>

        {/* Zone 3: Language Selector + Primary Action */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-950/80 px-3 py-1.5 text-xs font-mono text-sky-200 hover:border-sky-300 hover:text-white transition-colors cursor-pointer shadow-sm"
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

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onNavigateHome();
              onNavigateCategory('all');
            }}
            className="rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 font-mono text-xs font-bold text-white hover:from-sky-300 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.6)] transition-all whitespace-nowrap cursor-pointer shadow-md"
          >
            {t('exploreAll')}
          </button>
        </div>
      </div>
    </header>
  );
};
