import React, { useState, useEffect } from 'react';
import { Globe, X, Sparkles, Check } from 'lucide-react';
import { AUTO_TRANSLATE_LANGUAGES, detectBrowserLanguage } from '../services/autoTranslation';

interface LanguageBannerProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
}

export const LanguageBanner: React.FC<LanguageBannerProps> = ({ currentLang, onSelectLang }) => {
  const [dismissed, setDismissed] = useState(false);
  const [browserLang, setBrowserLang] = useState<string>('en');

  useEffect(() => {
    const detected = detectBrowserLanguage();
    setBrowserLang(detected);
  }, []);

  if (dismissed) return null;

  const detectedObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === browserLang) || AUTO_TRANSLATE_LANGUAGES[0];
  const isTranslated = currentLang !== 'en';
  const currentLangObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === currentLang) || AUTO_TRANSLATE_LANGUAGES[0];

  // If user is already on detected language and it's english, don't show prompt
  if (currentLang === 'en' && browserLang === 'en') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-sky-950/80 via-[#06141c] to-cyan-950/80 border-b border-sky-400/30 px-4 py-2 text-xs font-mono text-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 mx-auto sm:mx-0">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          
          {isTranslated ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-300 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Page auto-translated to {currentLangObj.nativeName} ({currentLangObj.flag})</span>
              </span>
              <span>•</span>
              <button
                onClick={() => onSelectLang('en')}
                className="text-sky-400 underline hover:text-white transition-colors cursor-pointer"
              >
                Show Original English
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>
                Browser language detected: <strong>{detectedObj.nativeName} {detectedObj.flag}</strong>.
              </span>
              <button
                onClick={() => onSelectLang(browserLang)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow cursor-pointer text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Translate Site to {detectedObj.nativeName}</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 transition-colors shrink-0 cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
