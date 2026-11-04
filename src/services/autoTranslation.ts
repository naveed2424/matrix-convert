/**
 * MatrixConvert Automatic Translation Service
 * Enables full-page, real-time client-side translation across 100+ languages
 * via Google Translate Engine with automated browser locale detection.
 */

export interface SupportedLang {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const AUTO_TRANSLATE_LANGUAGES: SupportedLang[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' }
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    __matrixAutoTranslateInit?: boolean;
  }
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
      // Match against supported codes
      const match = AUTO_TRANSLATE_LANGUAGES.find(
        (l) => l.code === rawLang || l.code.toLowerCase() === primary || (rawLang.toLowerCase().startsWith('zh') && l.code === 'zh-CN')
      );
      if (match) return match.code;
    }
  } catch (e) {
    // fallback
  }
  return 'en';
}

/**
 * Get current active translation language
 */
export function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  // 1. Check localStorage
  const saved = localStorage.getItem('matrix_preferred_lang');
  if (saved) return saved;

  // 2. Check googtrans cookie
  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z_-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // 3. Fallback to browser detection
  const detected = detectBrowserLanguage();
  return detected;
}

/**
 * Set Google Translate cookie across all domain scopes
 */
function setGoogleTransCookie(targetLang: string) {
  const cookieVal = targetLang === 'en' ? '' : `/en/${targetLang}`;
  const expires = targetLang === 'en' ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;' : 'max-age=31536000;';
  
  // Set root path
  document.cookie = `googtrans=${cookieVal}; path=/; ${expires}`;

  // Set host domain if not localhost
  const host = window.location.hostname;
  if (host && host.includes('.')) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${host}; ${expires}`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host}; ${expires}`;
  }
}

/**
 * Trigger translation in Google Translate DOM dropdown
 */
function triggerGoogleCombo(langCode: string) {
  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = langCode;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}

/**
 * Apply a language change site-wide
 */
export function applySiteLanguage(langCode: string, reloadIfNeeded: boolean = true) {
  try {
    localStorage.setItem('matrix_preferred_lang', langCode);
    setGoogleTransCookie(langCode);

    // Update document metadata
    const langObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = langObj?.dir || 'ltr';

    // Try triggering existing combo element
    const triggered = triggerGoogleCombo(langCode);

    if (!triggered && reloadIfNeeded) {
      // If combo not found, slight delay then reload to let googtrans cookie take effect
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  } catch (err) {
    console.error('Translation switch failed:', err);
  }
}

/**
 * Initialize Google Translate Script & Auto-translation engine
 */
export function initAutoTranslate(onLanguageDetected?: (lang: string) => void) {
  if (typeof window === 'undefined' || window.__matrixAutoTranslateInit) return;
  window.__matrixAutoTranslateInit = true;

  // Initialize callback
  window.googleTranslateElementInit = function () {
    try {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: AUTO_TRANSLATE_LANGUAGES.map((l) => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0
          },
          'google_translate_element'
        );

        // Check if an initial language needs to be triggered
        const currentSaved = getSavedLanguage();
        if (currentSaved && currentSaved !== 'en') {
          setTimeout(() => {
            triggerGoogleCombo(currentSaved);
          }, 400);
        }
      }
    } catch (e) {
      console.warn('Google Translate initialization notice:', e);
    }
  };

  // Determine initial language
  const savedLang = localStorage.getItem('matrix_preferred_lang');
  const browserLang = detectBrowserLanguage();
  const targetInitialLang = savedLang || (browserLang !== 'en' ? browserLang : 'en');

  if (targetInitialLang !== 'en') {
    setGoogleTransCookie(targetInitialLang);
    document.documentElement.lang = targetInitialLang;
    const lObj = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === targetInitialLang);
    if (lObj?.dir) {
      document.documentElement.dir = lObj.dir;
    }
    if (onLanguageDetected) {
      onLanguageDetected(targetInitialLang);
    }
  }

  // Inject Google Translate script if not already present
  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
  }
}
