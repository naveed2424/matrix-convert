/**
 * Mimage Automatic Translation Service
 * Synchronizes React i18n dictionaries + Google Translate SPA DOM translation bridge
 * across all 16 supported languages (including BlogHub, all 66 full blog posts, and all 108 tools).
 */

export interface SupportedLang {
  code: string;
  googleCode: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const AUTO_TRANSLATE_LANGUAGES: SupportedLang[] = [
  { code: 'en', googleCode: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', googleCode: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', googleCode: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', googleCode: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', googleCode: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', googleCode: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', googleCode: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ur', googleCode: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'nl', googleCode: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', googleCode: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', googleCode: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', googleCode: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', googleCode: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', googleCode: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'tr', googleCode: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', googleCode: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' }
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    __matrixAutoTranslateInit?: boolean;
  }
}

export function fromGoogleLangCode(raw: string | null | undefined): string {
  if (!raw) return 'en';
  const low = raw.toLowerCase();
  if (low === 'zh-cn' || low === 'zh-hans' || low.startsWith('zh')) return 'zh';
  const primary = low.split('-')[0];
  const matched = AUTO_TRANSLATE_LANGUAGES.find(
    (l) => l.code.toLowerCase() === low || l.code.toLowerCase() === primary
  );
  return matched ? matched.code : 'en';
}

export function toGoogleLangCode(langCode: string): string {
  const normalized = fromGoogleLangCode(langCode);
  const entry = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === normalized);
  return entry ? entry.googleCode : 'en';
}

/**
 * Detect the browser's preferred language code
 */
export function detectBrowserLanguage(): string {
  try {
    const navLangs = navigator.languages || [navigator.language || 'en'];
    for (const rawLang of navLangs) {
      if (!rawLang) continue;
      const primary = rawLang.split('-')[0].toLowerCase();
      const match = AUTO_TRANSLATE_LANGUAGES.find(
        (l) =>
          l.code.toLowerCase() === rawLang.toLowerCase() ||
          l.code.toLowerCase() === primary ||
          (rawLang.toLowerCase().startsWith('zh') && l.code === 'zh')
      );
      if (match) return match.code;
    }
  } catch {
    // fallback
  }
  return 'en';
}

/**
 * Get current active translation language (normalized to SUPPORTED_LANGUAGES code e.g. 'zh', 'fr', 'en')
 */
export function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('matrix_preferred_lang');
  if (saved) return fromGoogleLangCode(saved);

  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z_-]+)/);
  if (match && match[1]) {
    return fromGoogleLangCode(match[1]);
  }

  return detectBrowserLanguage();
}

/**
 * Set or clear Google Translate cookie across all domain scopes
 */
function setGoogleTransCookie(googleTargetLang: string) {
  const isEnglish = !googleTargetLang || googleTargetLang === 'en';
  const cookieVal = isEnglish ? '' : `/en/${googleTargetLang}`;
  const expires = isEnglish
    ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    : 'max-age=31536000; SameSite=Lax;';

  document.cookie = `googtrans=${cookieVal}; path=/; ${expires}`;

  const host = window.location.hostname;
  if (host && host.includes('.')) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${host}; ${expires}`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host}; ${expires}`;
  }
}

let activePollTimer: number | null = null;
let activeRescanTimer: number | null = null;

function dispatchComboValue(combo: HTMLSelectElement, gCode: string): boolean {
  const options = Array.from(combo.options);
  const matchedOption = options.find((opt) => opt.value === gCode);
  if (!matchedOption && gCode !== '') {
    return false;
  }
  combo.value = gCode;
  combo.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/**
 * Trigger Google Translate combo element; waits briefly if Google Translate script is still initializing
 */
function triggerGoogleComboWithRetry(googleLangCode: string, forceRetranslate = false, retriesLeft = 20) {
  if (activePollTimer !== null) {
    window.clearTimeout(activePollTimer);
    activePollTimer = null;
  }

  const attempt = (remaining: number) => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo && combo.options && combo.options.length > 1) {
      if (forceRetranslate && combo.value === googleLangCode && googleLangCode !== 'en') {
        // Briefly nudge to source language or empty reset option so newly mounted SPA nodes translate
        const resetVal = Array.from(combo.options).some((o) => o.value === 'en') ? 'en' : '';
        combo.value = resetVal;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
        window.setTimeout(() => {
          dispatchComboValue(combo, googleLangCode);
        }, 45);
      } else {
        dispatchComboValue(combo, googleLangCode);
      }
      return;
    }

    if (remaining > 0) {
      activePollTimer = window.setTimeout(() => attempt(remaining - 1), 160);
    }
  };

  attempt(retriesLeft);
}

/**
 * Reset DOM cleanly back to English when user switches back from another language
 */
function restoreEnglishDom() {
  if (activePollTimer !== null) {
    window.clearTimeout(activePollTimer);
    activePollTimer = null;
  }

  try {
    // 1. Try clicking Google Translate banner restore button if accessible
    const bannerFrame = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement | null;
    const innerDoc = bannerFrame?.contentDocument || bannerFrame?.contentWindow?.document;
    const restoreBtn = innerDoc?.querySelector('[id*="restore"], button[id*="restore"]') as HTMLElement | null;
    if (restoreBtn) {
      restoreBtn.click();
    }
  } catch {
    // Cross-origin frame access ignored cleanly
  }

  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    const hasEmpty = Array.from(combo.options).some((o) => o.value === '');
    const hasEn = Array.from(combo.options).some((o) => o.value === 'en');
    if (hasEn) {
      dispatchComboValue(combo, 'en');
    } else if (hasEmpty) {
      dispatchComboValue(combo, '');
    }
  }

  // Clear translated classes if stuck
  window.setTimeout(() => {
    const rootClass = document.documentElement.className;
    if (rootClass.includes('translated-')) {
      window.location.reload();
    }
  }, 220);
}

/**
 * Apply a language change site-wide (React UI dictionaries + Google Translate DOM bridge)
 */
export function applySiteLanguage(langCode: string) {
  try {
    const uiCode = fromGoogleLangCode(langCode);
    const gCode = toGoogleLangCode(uiCode);
    const langObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === uiCode);

    localStorage.setItem('matrix_preferred_lang', uiCode);
    setGoogleTransCookie(gCode);

    document.documentElement.lang = uiCode;
    document.documentElement.dir = langObj?.dir || 'ltr';

    if (uiCode === 'en') {
      restoreEnglishDom();
    } else {
      triggerGoogleComboWithRetry(gCode, true, 24);
    }
  } catch (err) {
    console.error('Translation switch failed:', err);
  }
}

/**
 * Re-scan newly mounted SPA DOM views (e.g., opening BlogHub, opening a BlogPostView article, filtering/switching tools)
 * when an active non-English language is selected.
 */
export function rescanDomTranslation(langCode: string, delayMs = 140) {
  if (typeof window === 'undefined') return;
  const uiCode = fromGoogleLangCode(langCode);
  if (uiCode === 'en') return;

  if (activeRescanTimer !== null) {
    window.clearTimeout(activeRescanTimer);
  }

  activeRescanTimer = window.setTimeout(() => {
    const gCode = toGoogleLangCode(uiCode);
    setGoogleTransCookie(gCode);
    triggerGoogleComboWithRetry(gCode, true, 16);
  }, delayMs);
}

/**
 * Initialize Google Translate Script & Auto-translation engine
 */
export function initAutoTranslate(onLanguageDetected?: (lang: string) => void) {
  if (typeof window === 'undefined' || window.__matrixAutoTranslateInit) return;
  window.__matrixAutoTranslateInit = true;

  window.googleTranslateElementInit = function () {
    try {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: AUTO_TRANSLATE_LANGUAGES.map((l) => l.googleCode).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0
          },
          'google_translate_element'
        );

        const currentSaved = getSavedLanguage();
        if (currentSaved && currentSaved !== 'en') {
          const gCode = toGoogleLangCode(currentSaved);
          window.setTimeout(() => {
            triggerGoogleComboWithRetry(gCode, false, 20);
          }, 280);
        }
      }
    } catch (e) {
      console.warn('Google Translate initialization notice:', e);
    }
  };

  const savedRaw = localStorage.getItem('matrix_preferred_lang');
  const savedNormalized = savedRaw ? fromGoogleLangCode(savedRaw) : null;
  const browserLang = detectBrowserLanguage();
  const targetInitialLang = savedNormalized || (browserLang !== 'en' ? browserLang : 'en');

  if (targetInitialLang !== 'en') {
    const gCode = toGoogleLangCode(targetInitialLang);
    setGoogleTransCookie(gCode);
    document.documentElement.lang = targetInitialLang;
    const lObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === targetInitialLang);
    document.documentElement.dir = lObj?.dir || 'ltr';
    if (onLanguageDetected) {
      onLanguageDetected(targetInitialLang);
    }
  } else {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
  }
}
