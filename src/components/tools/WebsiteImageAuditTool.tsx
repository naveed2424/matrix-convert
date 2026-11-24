import React, { useState } from 'react';
import {
  Globe,
  ShieldAlert,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import { formatFileSize } from '../../services/advancedToolsEngine';

interface WebsiteImageAuditToolProps {
  onSelectToolSlug: (slug: string) => void;
}

interface AuditedImageItem {
  src: string;
  alt: string | null;
  hasAltAttribute: boolean;
  declaredWidth?: string | null;
  declaredHeight?: string | null;
  naturalWidth?: number;
  naturalHeight?: number;
  measuredBytes?: number;
  estimatedSavingsPercent: number;
  format: string;
  issues: string[];
  measurementStatus: 'measured' | 'estimated';
}

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[::1\]$/,
  /^\[fe80:/i,
  /^\[fc00:/i,
  /^\[fd/i
];

function validatePublicHttpUrl(rawInput: string): { valid: true; url: URL } | { valid: false; error: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter a public https:// website URL to audit.' };
  }
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: 'Invalid URL syntax. Provide a valid https:// domain.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, error: 'Only public http:// and https:// URLs are permitted.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (PRIVATE_HOSTNAME_PATTERNS.some((re) => re.test(host))) {
    return {
      valid: false,
      error: 'Blocked for SSRF safety: localhost, private IP ranges, link-local, and cloud metadata addresses cannot be queried.'
    };
  }

  return { valid: true, url: parsed };
}

function detectImageFormatFromSrc(src: string): string {
  const clean = src.split('?')[0].split('#')[0].toLowerCase();
  if (clean.startsWith('data:image/')) {
    const m = clean.match(/^data:image\/([a-z0-9+.-]+)/);
    return m ? m[1].toUpperCase() : 'DATA-URI';
  }
  const ext = clean.split('.').pop() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    return ext === 'jpeg' ? 'JPG' : ext.toUpperCase();
  }
  return 'UNKNOWN';
}

export const WebsiteImageAuditTool: React.FC<WebsiteImageAuditToolProps> = ({ onSelectToolSlug }) => {
  const [mode, setMode] = useState<'url' | 'html'>('url');
  const [urlInput, setUrlInput] = useState('https://fixpdf.org');
  const [htmlInput, setHtmlInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://example.com');
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [corsNotice, setCorsNotice] = useState<string | null>(null);
  const [results, setResults] = useState<AuditedImageItem[]>([]);

  const parseHtmlAndInspect = async (html: string, baseOrigin?: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img')).slice(0, 60);

    if (imgs.length === 0) {
      setErrorMsg('No <img> elements were found in the supplied HTML markup.');
      setResults([]);
      return;
    }

    const items: AuditedImageItem[] = await Promise.all(
      imgs.map(async (img) => {
        const rawSrc = img.getAttribute('src') || img.getAttribute('data-src') || '';
        let resolvedSrc = rawSrc;
        if (rawSrc && baseOrigin && !rawSrc.startsWith('data:') && !/^https?:\/\//i.test(rawSrc)) {
          try {
            resolvedSrc = new URL(rawSrc, baseOrigin).toString();
          } catch {
            resolvedSrc = rawSrc;
          }
        }

        const hasAltAttribute = img.hasAttribute('alt');
        const alt = img.getAttribute('alt');
        const declaredWidth = img.getAttribute('width');
        const declaredHeight = img.getAttribute('height');
        const format = detectImageFormatFromSrc(resolvedSrc);
        const issues: string[] = [];

        if (!hasAltAttribute) {
          issues.push('Missing ALT attribute (accessibility & image SEO)');
        } else if (alt !== null && alt.trim().length === 0) {
          issues.push('Empty alt="" (okay only if purely decorative)');
        }

        if (!declaredWidth || !declaredHeight) {
          issues.push('Missing width/height attributes (CLS risk)');
        }

        if (format === 'PNG' || format === 'JPG' || format === 'BMP') {
          issues.push(`Legacy ${format} format — consider WebP/AVIF`);
        }

        let naturalWidth: number | undefined;
        let naturalHeight: number | undefined;
        let measuredBytes: number | undefined;
        let measurementStatus: 'measured' | 'estimated' = 'estimated';

        // Probe natural image size safely in browser if HTTP/HTTPS
        if (resolvedSrc && (/^https?:\/\//i.test(resolvedSrc) || resolvedSrc.startsWith('data:image/'))) {
          try {
            const probed = await new Promise<{ w: number; h: number } | null>((resolve) => {
              const probeImg = new Image();
              const timer = window.setTimeout(() => resolve(null), 3500);
              probeImg.onload = () => {
                window.clearTimeout(timer);
                resolve({ w: probeImg.naturalWidth, h: probeImg.naturalHeight });
              };
              probeImg.onerror = () => {
                window.clearTimeout(timer);
                resolve(null);
              };
              probeImg.src = resolvedSrc;
            });

            if (probed) {
              naturalWidth = probed.w;
              naturalHeight = probed.h;
              if (probed.w > 1920 || probed.h > 1920) {
                issues.push(`Oversized dimensions (${probed.w}×${probed.h}px)`);
              }
            }

            if (/^https?:\/\//i.test(resolvedSrc)) {
              const controller = new AbortController();
              const t = window.setTimeout(() => controller.abort(), 3500);
              const res = await fetch(resolvedSrc, { method: 'HEAD', signal: controller.signal }).catch(() => null);
              window.clearTimeout(t);
              const cl = res?.headers.get('content-length');
              if (cl && Number(cl) > 0) {
                measuredBytes = Number(cl);
                measurementStatus = 'measured';
                if (measuredBytes > 250 * 1024) {
                  issues.push(`Heavy payload (${formatFileSize(measuredBytes)})`);
                }
              }
            } else if (resolvedSrc.startsWith('data:image/')) {
              measuredBytes = Math.round(resolvedSrc.length * 0.75);
              measurementStatus = 'measured';
            }
          } catch {
            // Leave as estimated if CORS blocks HEAD
          }
        }

        const estimatedSavingsPercent =
          format === 'PNG' ? 60 : format === 'JPG' ? 35 : format === 'BMP' ? 85 : format === 'GIF' ? 40 : 0;

        return {
          src: resolvedSrc || '(missing src)',
          alt,
          hasAltAttribute,
          declaredWidth,
          declaredHeight,
          naturalWidth,
          naturalHeight,
          measuredBytes,
          estimatedSavingsPercent,
          format,
          issues,
          measurementStatus
        };
      })
    );

    setResults(items);
  };

  const handleRunUrlAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCorsNotice(null);

    const check = validatePublicHttpUrl(urlInput);
    if (!check.valid) {
      setErrorMsg(check.error);
      return;
    }

    setIsAuditing(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(check.url.toString(), {
        method: 'GET',
        signal: controller.signal,
        credentials: 'omit'
      });
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        setErrorMsg(`Remote server returned HTTP ${response.status} ${response.statusText}.`);
        setResults([]);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        setErrorMsg(`URL returned "${contentType || 'unknown content type'}" instead of HTML markup.`);
        setResults([]);
        return;
      }

      const text = await response.text();
      await parseHtmlAndInspect(text.slice(0, 1_500_000), check.url.origin);
    } catch (err: any) {
      window.clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        setErrorMsg('Request timed out after 8 seconds.');
      } else {
        setCorsNotice(
          'This website blocks cross-origin browser fetches (CORS), which is standard security behavior on most public domains. To audit it without using a remote server, copy the page HTML (View Page Source) and switch to "Paste HTML Source" below.'
        );
        setMode('html');
      }
      setResults([]);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunHtmlAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCorsNotice(null);
    if (!htmlInput.trim()) {
      setErrorMsg('Paste HTML markup containing <img> tags to run the audit.');
      return;
    }
    setIsAuditing(true);
    try {
      await parseHtmlAndInspect(htmlInput.slice(0, 1_500_000), baseUrlInput.trim() || undefined);
    } finally {
      setIsAuditing(false);
    }
  };

  const missingAltCount = results.filter((r) => !r.hasAltAttribute).length;
  const legacyFormatCount = results.filter((r) => ['PNG', 'JPG', 'BMP'].includes(r.format)).length;
  const oversizedCount = results.filter((r) => (r.naturalWidth || 0) > 1920 || (r.measuredBytes || 0) > 250 * 1024).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 dark:border-sky-500/30 bg-blue-50/70 dark:bg-sky-950/20 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
          <p>
            <strong className="text-slate-900 dark:text-white">Focused Image Asset Audit:</strong> Inspects image dimensions, ALT text, legacy formats, and payload sizes. This is specifically an image asset audit—not a full technical SEO or multi-page crawl.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Blocks localhost, private IPv4/IPv6 ranges, and cloud metadata hosts. Actual HTTP Content-Length measurements are marked <em>Measured</em>; potential format savings are marked <em>Estimated</em>.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            mode === 'url'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public URL</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('html')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            mode === 'html'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Paste HTML Source</span>
        </button>
      </div>

      {mode === 'url' ? (
        <form onSubmit={handleRunUrlAudit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isAuditing}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer shrink-0"
          >
            {isAuditing ? 'Auditing...' : 'Run Image Audit'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRunHtmlAudit} className="space-y-3">
          <input
            type="url"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="Optional base URL (e.g. https://example.com) for relative image paths"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <textarea
            rows={6}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder='Paste page HTML snippet here, e.g. <img src="hero.png" />'
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isAuditing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isAuditing ? 'Inspecting HTML...' : 'Inspect Images in HTML'}
          </button>
        </form>
      )}

      {corsNotice && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>{corsNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-5">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Images Found</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{results.length}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Missing ALT</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{missingAltCount}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Legacy Formats</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-sky-400 tabular-nums">{legacyFormatCount}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Oversized Assets</span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">{oversizedCount}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Image Source</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">Size / Est. Savings</th>
                  <th className="p-3">Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {results.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 max-w-xs truncate font-mono text-[11px] text-slate-800 dark:text-slate-200" title={item.src}>
                      {item.src}
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">{item.format}</td>
                    <td className="p-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {item.naturalWidth
                        ? `${item.naturalWidth}×${item.naturalHeight}px`
                        : item.declaredWidth || item.declaredHeight
                        ? `${item.declaredWidth || '?'}×${item.declaredHeight || '?'} (attr)`
                        : 'Unavailable (CORS)'}
                    </td>
                    <td className="p-3 tabular-nums">
                      <div className="space-y-0.5">
                        <span className="block font-mono text-slate-800 dark:text-slate-200">
                          {item.measuredBytes ? `${formatFileSize(item.measuredBytes)} (Measured)` : 'Size hidden by CORS'}
                        </span>
                        {item.estimatedSavingsPercent > 0 && (
                          <span className="block text-[11px] text-blue-600 dark:text-sky-400">
                            Est. ~{item.estimatedSavingsPercent}% WebP/AVIF reduction
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {item.issues.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Clean</span>
                        </span>
                      ) : (
                        <ul className="space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                          {item.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Ready to resize, strip metadata, and convert flagged assets to WebP or AVIF?
            </span>
            <button
              onClick={() => onSelectToolSlug('optimization-studio')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              <span>Open Image Optimization Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
