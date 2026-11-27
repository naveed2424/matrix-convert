import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Layers
} from 'lucide-react';

export interface AdSenseAutoAdsHelperProps {
  publisherId?: string;
  routeKey: string;
  activeView: string;
  scanIntervalMs?: number;
}

type ContainerStatus = 'filled' | 'unfilled' | 'pending' | 'simulated';

interface RectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface DetectedAdContainer {
  id: string;
  selectorType: string;
  status: ContainerStatus;
  rect: RectBox;
  warnings: string[];
}

interface ProtectedZoneBox {
  id: string;
  label: string;
  rect: RectBox;
}

interface PolicyAuditSnapshot {
  timestamp: string;
  metaTagValid: boolean;
  scriptTagPresent: boolean;
  scriptInitialized: boolean;
  isNoindexRoute: boolean;
  isEligiblePage: boolean;
  mainWordCount: number;
  viewportAdRatioPct: number;
  containers: DetectedAdContainer[];
  protectedZones: ProtectedZoneBox[];
  globalWarnings: string[];
}

const DEFAULT_PUBLISHER_ID = 'ca-pub-8358033803354457';
const MIN_INTERACTIVE_CLEARANCE_PX = 16;
const MIN_CONSECUTIVE_AD_GAP_PX = 120;
const MAX_VIEWPORT_AD_RATIO_PCT = 30;
const MIN_EDITORIAL_WORDS = 250;

function rectsOverlapWithMargin(a: RectBox, b: RectBox, margin: number): boolean {
  return !(
    a.left + a.width + margin <= b.left ||
    b.left + b.width + margin <= a.left ||
    a.top + a.height + margin <= b.top ||
    b.top + b.height + margin <= a.top
  );
}

function getElementDescriptor(el: Element): string {
  if (el.classList.contains('google-auto-placed')) return '.google-auto-placed';
  if (el.matches('ins.adsbygoogle')) return 'ins.adsbygoogle';
  if (el.id) return `#${el.id}`;
  return el.tagName.toLowerCase();
}

function inferContainerStatus(el: Element, rect: RectBox): ContainerStatus {
  const attrStatus = el.getAttribute('data-ad-status')?.toLowerCase();
  if (attrStatus === 'filled') return 'filled';
  if (attrStatus === 'unfilled') return 'unfilled';

  const hasIframe = el.querySelector('iframe[id^="aswift_"], iframe[id^="google_ads_iframe"]') !== null;
  if (hasIframe && rect.width > 0 && rect.height > 0) return 'filled';
  if (rect.width === 0 || rect.height === 0) return 'unfilled';
  return 'pending';
}

export const AdSenseAutoAdsHelper: React.FC<AdSenseAutoAdsHelperProps> = ({
  publisherId = DEFAULT_PUBLISHER_ID,
  routeKey,
  activeView,
  scanIntervalMs = 3500
}) => {
  const isDev = import.meta.env.DEV;

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showVisualMarkers, setShowVisualMarkers] = useState<boolean>(false);
  const [simulateZoneMarkers, setSimulateZoneMarkers] = useState<boolean>(false);
  const [audit, setAudit] = useState<PolicyAuditSnapshot | null>(null);
  const lastRouteRef = useRef<string>(routeKey);

  const runPolicyAudit = useCallback(() => {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 1. Account meta & script verification
    const accountMeta = document.querySelector<HTMLMetaElement>('meta[name="google-adsense-account"]');
    const metaTagValid = accountMeta?.content.trim() === publisherId;

    const adScript = document.querySelector<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );
    const scriptTagPresent = Boolean(adScript);
    const adsByGoogleObj = (window as unknown as { adsbygoogle?: unknown }).adsbygoogle;
    const scriptInitialized = Array.isArray(adsByGoogleObj) || Boolean(adsByGoogleObj && typeof adsByGoogleObj === 'object');

    // 2. Route eligibility & thin content checks
    const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const isNoindexRoute =
      activeView === 'not-found' ||
      Boolean(robotsMeta?.content.toLowerCase().includes('noindex'));

    const mainEl = document.querySelector('main');
    const rawText = (mainEl?.textContent || '').replace(/\s+/g, ' ').trim();
    const mainWordCount = rawText ? rawText.split(' ').length : 0;
    const isEligiblePage = !isNoindexRoute && mainWordCount > 60;

    // 3. Collect protected interactive controls (Accidental Clicks policy protection)
    const protectedZones: ProtectedZoneBox[] = [];
    const protectedCandidates = document.querySelectorAll(
      '[data-adsense-exclude="true"], main input[type="file"], main button[type="submit"], [role="dialog"], .tool-dropzone'
    );
    protectedCandidates.forEach((el, index) => {
      if (el.closest('[data-adsense-helper-ui="true"]')) return;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      protectedZones.push({
        id: `pz-${index}`,
        label: el.getAttribute('aria-label') || el.tagName.toLowerCase(),
        rect: {
          left: Math.round(r.left),
          top: Math.round(r.top),
          width: Math.round(r.width),
          height: Math.round(r.height)
        }
      });
    });

    // 4. Scan injected Auto-Ads / AdSense containers
    const adSelector =
      '.google-auto-placed, ins.adsbygoogle, [data-ad-status], iframe[id^="aswift_"], iframe[id^="google_ads_iframe"]';
    const rawNodes = Array.from(document.querySelectorAll(adSelector));

    // Deduplicate nested iframe nodes already inside .google-auto-placed or ins.adsbygoogle
    const topLevelNodes = rawNodes.filter((node) => {
      if (node.closest('[data-adsense-helper-ui="true"]')) return false;
      const parentAd = node.parentElement?.closest('.google-auto-placed, ins.adsbygoogle');
      return !parentAd;
    });

    const containers: DetectedAdContainer[] = topLevelNodes.map((el, idx) => {
      const r = el.getBoundingClientRect();
      const rect: RectBox = {
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height)
      };
      const status = inferContainerStatus(el, rect);
      const warnings: string[] = [];

      if (isNoindexRoute) {
        warnings.push('Ad container injected on noindex / 404 route');
      }
      if (rect.width > window.innerWidth + 2) {
        warnings.push(`Overflows viewport width (${rect.width}px > ${window.innerWidth}px)`);
      }
      if (status === 'unfilled' && rect.height === 0) {
        warnings.push('Unfilled collapsed slot (0px height)');
      }

      const nearInteractive = protectedZones.some((pz) =>
        rectsOverlapWithMargin(rect, pz.rect, MIN_INTERACTIVE_CLEARANCE_PX)
      );
      if (nearInteractive) {
        warnings.push(`Too close (<${MIN_INTERACTIVE_CLEARANCE_PX}px) to interactive dropzone/control`);
      }

      return {
        id: `ad-${idx}-${getElementDescriptor(el)}`,
        selectorType: getElementDescriptor(el),
        status,
        rect,
        warnings
      };
    });

    // 5. Simulate candidate editorial placement zones in DEV when requested and no live slots exist
    if (isDev && simulateZoneMarkers && containers.length === 0 && mainEl) {
      const candidateSections = mainEl.querySelectorAll('article, section');
      candidateSections.forEach((sec, idx) => {
        if (idx > 2) return;
        const r = sec.getBoundingClientRect();
        if (r.height > 180 && r.width > 240) {
          const simRect: RectBox = {
            left: Math.round(r.left + 16),
            top: Math.round(r.bottom - 106),
            width: Math.round(Math.min(728, r.width - 32)),
            height: 90
          };
          const nearInteractive = protectedZones.some((pz) =>
            rectsOverlapWithMargin(simRect, pz.rect, MIN_INTERACTIVE_CLEARANCE_PX)
          );
          containers.push({
            id: `sim-slot-${idx}`,
            selectorType: 'simulated-auto-ad-slot',
            status: 'simulated',
            rect: simRect,
            warnings: nearInteractive
              ? [`Simulated slot within ${MIN_INTERACTIVE_CLEARANCE_PX}px of interactive UI`]
              : []
          });
        }
      });
    }

    // 6. Consecutive ad stacking & initial viewport density check
    const sortedByTop = [...containers]
      .filter((c) => c.rect.height > 0)
      .sort((a, b) => a.rect.top - b.rect.top);

    for (let i = 1; i < sortedByTop.length; i += 1) {
      const prev = sortedByTop[i - 1];
      const curr = sortedByTop[i];
      const verticalGap = curr.rect.top - (prev.rect.top + prev.rect.height);
      if (verticalGap >= -10 && verticalGap < MIN_CONSECUTIVE_AD_GAP_PX) {
        curr.warnings.push(`Ad stacking risk: ${verticalGap}px gap (<${MIN_CONSECUTIVE_AD_GAP_PX}px)`);
      }
    }

    const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
    const inViewportAdArea = containers.reduce((acc, c) => {
      if (c.status === 'simulated') return acc;
      const visibleLeft = Math.max(0, c.rect.left);
      const visibleRight = Math.min(window.innerWidth, c.rect.left + c.rect.width);
      const visibleTop = Math.max(0, c.rect.top);
      const visibleBottom = Math.min(window.innerHeight, c.rect.top + c.rect.height);
      const w = Math.max(0, visibleRight - visibleLeft);
      const h = Math.max(0, visibleBottom - visibleTop);
      return acc + w * h;
    }, 0);
    const viewportAdRatioPct = Math.round((inViewportAdArea / viewportArea) * 100);

    // 7. Global compliance warnings
    const globalWarnings: string[] = [];
    if (!metaTagValid) {
      globalWarnings.push(`Missing or mismatched google-adsense-account meta (${publisherId})`);
    }
    if (!scriptTagPresent) {
      globalWarnings.push('Missing AdSense adsbygoogle.js loader script in <head>');
    }
    if (viewportAdRatioPct > MAX_VIEWPORT_AD_RATIO_PCT) {
      globalWarnings.push(`Viewport ad density (${viewportAdRatioPct}%) exceeds ${MAX_VIEWPORT_AD_RATIO_PCT}% threshold`);
    }
    if (!isNoindexRoute && activeView === 'blog-post' && mainWordCount < MIN_EDITORIAL_WORDS) {
      globalWarnings.push(`Low editorial word count (${mainWordCount} words < ${MIN_EDITORIAL_WORDS})`);
    }

    // Production safety guardrail: collapse auto-placed slots accidentally marked on noindex/404 screens
    if (isNoindexRoute) {
      document.querySelectorAll<HTMLElement>('.google-auto-placed').forEach((node) => {
        node.setAttribute('data-mimage-hidden-noindex', 'true');
        node.hidden = true;
      });
    }

    if (isDev) {
      setAudit({
        timestamp: now,
        metaTagValid,
        scriptTagPresent,
        scriptInitialized,
        isNoindexRoute,
        isEligiblePage,
        mainWordCount,
        viewportAdRatioPct,
        containers,
        protectedZones,
        globalWarnings
      });
    }
  }, [activeView, isDev, publisherId, simulateZoneMarkers]);

  // Run verification on mount, route transitions, and periodically
  useEffect(() => {
    if (lastRouteRef.current !== routeKey) {
      lastRouteRef.current = routeKey;
    }

    const initialTimer = window.setTimeout(runPolicyAudit, 250);
    const intervalId = window.setInterval(runPolicyAudit, scanIntervalMs);

    // Observe dynamic DOM injections of Google Auto-Ads containers
    const observer = new MutationObserver((mutations) => {
      const hasAdMutation = mutations.some((m) =>
        Array.from(m.addedNodes).some((node) => {
          if (!(node instanceof Element)) return false;
          return (
            node.matches('.google-auto-placed, ins.adsbygoogle, [data-ad-status]') ||
            Boolean(node.querySelector('.google-auto-placed, ins.adsbygoogle'))
          );
        })
      );
      if (hasAdMutation) {
        runPolicyAudit();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const handleViewportChange = () => {
      if (isDev && (showVisualMarkers || isDrawerOpen)) {
        runPolicyAudit();
      }
    };
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      observer.disconnect();
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isDev, isDrawerOpen, routeKey, runPolicyAudit, scanIntervalMs, showVisualMarkers]);

  // Never render developer visual markers or inspector chrome in production builds
  if (!isDev) {
    return null;
  }

  const injectedCount = audit?.containers.filter((c) => c.status !== 'simulated').length ?? 0;
  const totalWarnings =
    (audit?.globalWarnings.length ?? 0) +
    (audit?.containers.reduce((sum, c) => sum + c.warnings.length, 0) ?? 0);

  return (
    <div data-adsense-helper-ui="true">
      {/* Development-Only Visual Bounding Box Overlay (Pure SVG, Zero Inline Styles) */}
      {showVisualMarkers && audit && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-[9990]"
          aria-hidden="true"
        >
          {/* Protected Interactive Zones (Emerald/Cyan dashed clearance guardrails) */}
          {audit.protectedZones.map((pz) => (
            <g key={pz.id}>
              <rect
                x={pz.rect.left - MIN_INTERACTIVE_CLEARANCE_PX}
                y={pz.rect.top - MIN_INTERACTIVE_CLEARANCE_PX}
                width={Math.max(0, pz.rect.width + MIN_INTERACTIVE_CLEARANCE_PX * 2)}
                height={Math.max(0, pz.rect.height + MIN_INTERACTIVE_CLEARANCE_PX * 2)}
                fill="rgba(16, 185, 129, 0.04)"
                stroke="#34d399"
                strokeWidth="1.25"
                strokeDasharray="4 4"
                rx="6"
              />
            </g>
          ))}

          {/* Detected / Simulated Ad Containers */}
          {audit.containers.map((c) => {
            const hasWarning = c.warnings.length > 0;
            const strokeColor =
              hasWarning
                ? '#f43f5e'
                : c.status === 'simulated'
                  ? '#38bdf8'
                  : c.status === 'filled'
                    ? '#10b981'
                    : '#f59e0b';
            const fillColor =
              hasWarning
                ? 'rgba(244, 63, 94, 0.14)'
                : c.status === 'simulated'
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(16, 185, 129, 0.12)';
            const labelText = `${c.selectorType} [${c.status.toUpperCase()}] ${c.rect.width}x${c.rect.height}${
              hasWarning ? ' ⚠' : ' ✓'
            }`;
            const labelY = c.rect.top > 24 ? c.rect.top - 20 : c.rect.top + 4;

            return (
              <g key={c.id}>
                <rect
                  x={c.rect.left}
                  y={c.rect.top}
                  width={Math.max(2, c.rect.width)}
                  height={Math.max(2, c.rect.height)}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  strokeDasharray={c.status === 'simulated' ? '6 4' : undefined}
                  rx="4"
                />
                <rect
                  x={c.rect.left}
                  y={labelY}
                  width={Math.min(340, Math.max(150, labelText.length * 6.5))}
                  height="18"
                  fill="#090d0c"
                  stroke={strokeColor}
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={c.rect.left + 6}
                  y={labelY + 12.5}
                  fill={strokeColor}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {labelText}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Compact Floating Dev Inspector Launcher & Drawer */}
      <div className="fixed bottom-4 left-4 z-[9995] max-w-sm font-mono text-xs">
        {isDrawerOpen && audit && (
          <div className="mb-2 rounded-xl border border-slate-700 bg-[#080d0b]/95 backdrop-blur-md shadow-2xl p-3.5 text-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">AdSense Auto-Ads Verifier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={runPolicyAudit}
                  title="Rescan page now"
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  title="Collapse panel"
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Policy Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
                <div className="text-slate-400">Publisher Tag</div>
                <div className={audit.metaTagValid && audit.scriptTagPresent ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {audit.metaTagValid && audit.scriptTagPresent ? 'Verified' : 'Check Head Tags'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
                <div className="text-slate-400">Page Eligibility</div>
                <div className={audit.isEligiblePage ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                  {audit.isNoindexRoute ? 'Noindex Excluded' : `${audit.mainWordCount} words`}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
                <div className="text-slate-400">Injected Ads</div>
                <div className="text-sky-300 font-bold">{injectedCount} container(s)</div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
                <div className="text-slate-400">Viewport Ratio</div>
                <div className={audit.viewportAdRatioPct <= MAX_VIEWPORT_AD_RATIO_PCT ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {audit.viewportAdRatioPct}% (max {MAX_VIEWPORT_AD_RATIO_PCT}%)
                </div>
              </div>
            </div>

            {/* Marker Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVisualMarkers((v) => !v)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                  showVisualMarkers
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {showVisualMarkers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showVisualMarkers ? 'Markers On' : 'Show Markers'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulateZoneMarkers((v) => !v);
                  if (!showVisualMarkers) setShowVisualMarkers(true);
                }}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                  simulateZoneMarkers
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{simulateZoneMarkers ? 'Sim Slots On' : 'Simulate Slots'}</span>
              </button>
            </div>

            {/* Warnings & Detected Slots */}
            {audit.globalWarnings.length > 0 && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-2 space-y-1">
                {audit.globalWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {audit.containers.length === 0 ? (
                <div className="text-[11px] text-slate-400 bg-slate-900/70 rounded-lg p-2 border border-slate-800">
                  No Google Auto-Ads DOM containers injected yet on localhost/preview. Toggle{' '}
                  <strong className="text-sky-300">Simulate Slots</strong> to inspect clearance around interactive dropzones.
                </div>
              ) : (
                audit.containers.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-lg p-2 border text-[11px] ${
                      c.warnings.length > 0
                        ? 'border-rose-500/50 bg-rose-950/20'
                        : 'border-slate-800 bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[175px]">{c.selectorType}</span>
                      <span className="text-slate-400">
                        {c.rect.width}x{c.rect.height} ({c.status})
                      </span>
                    </div>
                    {c.warnings.map((w, idx) => (
                      <div key={idx} className="text-rose-300 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              <span>DEV ONLY · Route: {routeKey}</span>
              <span>Scanned {audit.timestamp}</span>
            </div>
          </div>
        )}

        {/* Minimized Dev Pill Trigger */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-[#080d0b]/90 backdrop-blur-md text-slate-200 hover:border-emerald-500/60 shadow-lg cursor-pointer"
        >
          {totalWarnings > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            AdSense Dev: {injectedCount} slots{totalWarnings > 0 ? ` · ${totalWarnings} warn` : ' · OK'}
          </span>
          {isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>
    </div>
  );
};
