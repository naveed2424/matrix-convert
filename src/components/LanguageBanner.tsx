import React, { useState, useEffect } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { AUTO_TRANSLATE_LANGUAGES, detectBrowserLanguage, fromGoogleLangCode } from '../services/autoTranslation';

interface LanguageBannerProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
}

export const LanguageBanner: React.FC<LanguageBannerProps> = ({ currentLang, onSelectLang }) => {
  const [dismissed, setDismissed] = useState(false);
  const [browserLang, setBrowserLang] = useState<string>('en');

  useEffect(() => {
    setBrowserLang(detectBrowserLanguage());
  }, []);

  if (dismissed) return null;

  const normalizedCurrent = fromGoogleLangCode(currentLang);
  const detectedObj =
    AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === browserLang) || AUTO_TRANSLATE_LANGUAGES[0];
  const isTranslated = normalizedCurrent !== 'en';
  const currentLangObj =
    AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === normalizedCurrent) || AUTO_TRANSLATE_LANGUAGES[0];

  if (normalizedCurrent === 'en' && browserLang === 'en') {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 px-4 py-2 text-xs text-slate-700 dark:text-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 mx-auto sm:mx-0">
          <Globe className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />

          {isTranslated ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium notranslate" translate="no">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {currentLangObj.nativeName} ({currentLangObj.flag})
                </span>
              </span>
              <span>·</span>
              <button
                onClick={() => onSelectLang('en')}
                className="text-blue-600 dark:text-sky-400 underline font-medium cursor-pointer notranslate"
                translate="no"
              >
                English
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>
                Browser language detected: <strong className="notranslate" translate="no">{detectedObj.nativeName} {detectedObj.flag}</strong>
              </span>
              <button
                onClick={() => onSelectLang(browserLang)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer text-[11px]"
              >
                <span>Translate to <span className="notranslate" translate="no">{detectedObj.nativeName}</span></span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss language notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
