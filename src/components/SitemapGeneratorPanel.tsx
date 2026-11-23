import React, { useMemo, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Globe,
  FileCode2,
  ListTree,
  Search,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import {
  generateDynamicSitemap,
  DEFAULT_SITE_URL,
  SitemapSection,
  SitemapEntry
} from '../utils/sitemapGenerator';

interface SitemapGeneratorPanelProps {
  onNavigateEntry?: (entry: SitemapEntry) => void;
}

const DOMAIN_PRESETS = [
  { label: 'Default (mimage.netlify.app)', url: DEFAULT_SITE_URL },
  { label: 'Current Origin', url: typeof window !== 'undefined' ? window.location.origin : DEFAULT_SITE_URL }
];

export const SitemapGeneratorPanel: React.FC<SitemapGeneratorPanelProps> = ({ onNavigateEntry }) => {
  const [baseUrlInput, setBaseUrlInput] = useState<string>(DEFAULT_SITE_URL);
  const [includeCategories, setIncludeCategories] = useState<boolean>(true);
  const [includeLastMod, setIncludeLastMod] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'xml'>('entries');
  const [sectionFilter, setSectionFilter] = useState<'all' | SitemapSection>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadedAt, setDownloadedAt] = useState<string | null>(null);

  const generated = useMemo(
    () =>
      generateDynamicSitemap({
        baseUrl: baseUrlInput,
        includeCategories,
        includeLastMod
      }),
    [baseUrlInput, includeCategories, includeLastMod]
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return generated.entries.filter((entry) => {
      if (sectionFilter !== 'all' && entry.section !== sectionFilter) return false;
      if (!q) return true;
      return (
        entry.path.toLowerCase().includes(q) ||
        entry.label.toLowerCase().includes(q) ||
        entry.loc.toLowerCase().includes(q)
      );
    });
  }, [generated.entries, sectionFilter, searchQuery]);

  const handleDownloadXml = () => {
    const blob = new Blob([generated.xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setDownloadedAt(new Date().toLocaleTimeString());
  };

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(generated.xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const sectionBadgeClass: Record<SitemapSection, string> = {
    core: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    tool: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    blog: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    category: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    company: 'bg-slate-700/60 text-slate-300 border-slate-600'
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-5 sm:p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Dynamic XML Sitemap Crawler</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Live Crawled <code className="text-emerald-400 font-mono">sitemap.xml</code> Generator
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically indexes every entry in <code className="text-slate-300">TOOLS_DATA</code>,{' '}
            <code className="text-slate-300">PRE_SEEDED_BLOG_POSTS</code>, categories, and trust pages with zero manual edits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadXml}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download sitemap.xml</span>
          </button>

          <button
            type="button"
            onClick={handleCopyXml}
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-500/60 text-slate-200 font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-sky-400 text-sky-400 font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>/sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Live Crawl Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {generated.stats.totalUrls}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Total Indexed URLs</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-xl font-extrabold font-mono text-white tabular-nums">
            {generated.stats.toolCount}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Tools Crawled</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-xl font-extrabold font-mono text-white tabular-nums">
            {generated.stats.blogCount}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Blog Guides Crawled</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-xl font-extrabold font-mono text-white tabular-nums">
            {generated.stats.categoryCount}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Category Pages</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-xl font-extrabold font-mono text-sky-400 tabular-nums">
            {(generated.stats.byteSize / 1024).toFixed(1)} KB
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">XML Payload Size</div>
        </div>
      </div>

      {/* Domain & Output Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="lg:col-span-7 space-y-2">
          <label htmlFor="sitemap-base-url" className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Canonical Domain Base URL</span>
          </label>
          <input
            id="sitemap-base-url"
            type="url"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="https://mimage.netlify.app"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {DOMAIN_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setBaseUrlInput(preset.url)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center gap-2.5 text-xs font-mono text-slate-300">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCategories}
              onChange={(e) => setIncludeCategories(e.target.checked)}
              className="accent-emerald-500 w-4 h-4"
            />
            <span>Include /category/* landing pages</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLastMod}
              onChange={(e) => setIncludeLastMod(e.target.checked)}
              className="accent-emerald-500 w-4 h-4"
            />
            <span>Include &lt;lastmod&gt; ISO dates</span>
          </label>
          {downloadedAt && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Downloaded sitemap.xml at {downloadedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inspector View Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('entries')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'entries'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Crawled URL Table ({generated.entries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('xml')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'xml'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>XML Source Preview</span>
            </button>
          </div>

          {activeTab === 'entries' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter URLs..."
                  className="rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                />
              </div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as 'all' | SitemapSection)}
                aria-label="Filter sitemap section"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Sections ({generated.stats.totalUrls})</option>
                <option value="tool">Tools ({generated.stats.toolCount})</option>
                <option value="blog">Blogs ({generated.stats.blogCount})</option>
                <option value="category">Categories ({generated.stats.categoryCount})</option>
                <option value="core">Core ({generated.stats.coreCount})</option>
                <option value="company">Trust &amp; Pages ({generated.stats.companyCount})</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'entries' ? (
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/80">
            {filteredEntries.slice(0, 250).map((entry) => (
              <div
                key={entry.path}
                className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-900/80 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${sectionBadgeClass[entry.section]}`}
                    >
                      {entry.section}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateEntry && onNavigateEntry(entry)}
                      className="font-mono text-emerald-400 hover:underline truncate text-left cursor-pointer"
                    >
                      {entry.loc}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate pl-1">{entry.label}</div>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                  {entry.lastmod && <span>{entry.lastmod}</span>}
                  <span>{entry.changefreq}</span>
                  <span className="text-sky-400 font-semibold">P:{entry.priority}</span>
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="p-6 text-center text-xs font-mono text-slate-400">
                No indexed URLs match &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        ) : (
          <pre className="max-h-96 overflow-auto rounded-xl border border-slate-800 bg-black/70 p-4 text-[11px] font-mono text-emerald-300 leading-relaxed whitespace-pre">
            {generated.xml}
          </pre>
        )}
      </div>
    </div>
  );
};
