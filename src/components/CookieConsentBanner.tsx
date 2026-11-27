import React, { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';

export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  ads: boolean;
  updatedAt: string;
}

const CONSENT_STORAGE_KEY = 'mimage_consent_v1';

export function getStoredConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function applyGtagConsent(prefs: ConsentPreferences) {
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      ad_storage: prefs.ads ? 'granted' : 'denied',
      ad_user_data: prefs.ads ? 'granted' : 'denied',
      ad_personalization: prefs.ads ? 'granted' : 'denied',
      analytics_storage: prefs.analytics ? 'granted' : 'denied'
    });
  }
}

interface CookieConsentBannerProps {
  forceOpen?: boolean;
  onCloseForced?: () => void;
  onNavigatePrivacy: () => void;
  onNavigateCookies: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  forceOpen = false,
  onCloseForced,
  onNavigatePrivacy,
  onNavigateCookies
}) => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    } else {
      setAnalyticsEnabled(existing.analytics);
      setAdsEnabled(existing.ads);
      applyGtagConsent(existing);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      const existing = getStoredConsent();
      if (existing) {
        setAnalyticsEnabled(existing.analytics);
        setAdsEnabled(existing.ads);
      }
      setVisible(true);
      setShowCustomize(true);
    }
  }, [forceOpen]);

  const saveAndClose = (analytics: boolean, ads: boolean) => {
    const prefs: ConsentPreferences = {
      essential: true,
      analytics,
      ads,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }
    setAnalyticsEnabled(analytics);
    setAdsEnabled(ads);
    applyGtagConsent(prefs);
    setVisible(false);
    setShowCustomize(false);
    onCloseForced?.();
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Advertising Consent"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-5 sm:max-w-lg z-50 rounded-2xl border border-slate-700 bg-slate-950/95 backdrop-blur-md text-slate-200 shadow-2xl p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
            <Cookie className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">Privacy &amp; Ad Preferences</h2>
            <p className="text-[11px] font-mono text-emerald-400">fixpdf.org · GDPR &amp; CCPA Controls</p>
          </div>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setShowCustomize(false);
            onCloseForced?.();
          }}
          aria-label="Dismiss cookie notice"
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Mimage processes your images and PDFs locally in browser memory. We use strictly necessary local storage for UI preferences, plus optional Google Analytics 4 and Google AdSense cookies to keep all 108+ tools free. Read our{' '}
        <button onClick={onNavigatePrivacy} className="text-sky-400 underline hover:text-sky-300 cursor-pointer">
          Privacy Policy
        </button>{' '}
        and{' '}
        <button onClick={onNavigateCookies} className="text-sky-400 underline hover:text-sky-300 cursor-pointer">
          Cookie Policy
        </button>
        .
      </p>

      {showCustomize && (
        <div className="space-y-2.5 pt-1 border-t border-slate-800 text-xs">
          <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Essential Preferences</div>
              <div className="text-[11px] text-slate-400">Language selection &amp; consent state (always active).</div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Required</span>
          </label>

          <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-white">Google Analytics 4</div>
              <div className="text-[11px] text-slate-400">Aggregate traffic metrics; never sees uploaded files.</div>
            </div>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-white">Google AdSense Personalized Ads</div>
              <div className="text-[11px] text-slate-400">Enables relevant ad personalization; turn off for non-personalized ads.</div>
            </div>
            <input
              type="checkbox"
              checked={adsEnabled}
              onChange={(e) => setAdsEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {!showCustomize ? (
          <button
            onClick={() => setShowCustomize(true)}
            className="px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
        ) : (
          <button
            onClick={() => saveAndClose(analyticsEnabled, adsEnabled)}
            className="px-3.5 py-2 rounded-lg border border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/50 text-xs font-semibold cursor-pointer"
          >
            Save Preferences
          </button>
        )}
        <button
          onClick={() => saveAndClose(false, false)}
          className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-medium cursor-pointer"
        >
          Essential Only
        </button>
        <button
          onClick={() => saveAndClose(true, true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Accept All</span>
        </button>
      </div>
    </aside>
  );
};
