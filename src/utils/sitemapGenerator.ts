import { TOOLS_DATA, TOOL_CATEGORIES } from '../data/toolsData';
import { PRE_SEEDED_BLOG_POSTS } from '../data/blogData';

export const DEFAULT_SITE_URL = 'https://fixpdf.org';

/**
 * Canonical top-level tool paths supported directly at `/<slug>` in App.tsx
 */
export const DIRECT_TOOL_SLUGS = new Set([
  'smart-assistant',
  'website-image-audit',
  'optimization-studio',
  'compress-image-to-100kb',
  'heic-to-jpg',
  'bulk-image-converter',
  'remove-image-metadata',
  'resize-image-for-instagram',
  'pdf-to-jpg',
  'merge-pdf'
]);

export type SitemapSection = 'core' | 'category' | 'tool' | 'blog' | 'company';

export interface SitemapEntry {
  path: string;
  loc: string;
  section: SitemapSection;
  label: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  lastmod?: string;
}

export interface SitemapOptions {
  baseUrl?: string;
  includeCategories?: boolean;
  includeLastMod?: boolean;
  defaultLastMod?: string;
}

export interface SitemapStats {
  totalUrls: number;
  coreCount: number;
  categoryCount: number;
  toolCount: number;
  blogCount: number;
  companyCount: number;
  byteSize: number;
}

export interface GeneratedSitemapResult {
  xml: string;
  baseUrl: string;
  entries: SitemapEntry[];
  stats: SitemapStats;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function normalizeBaseUrl(raw?: string): string {
  const candidate = (raw || DEFAULT_SITE_URL).trim();
  if (!candidate) return DEFAULT_SITE_URL;
  let normalized = candidate;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return DEFAULT_SITE_URL;
    }
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function parseDateToIso(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

/**
 * Dynamically crawls TOOLS_DATA, TOOL_CATEGORIES, PRE_SEEDED_BLOG_POSTS,
 * and static core/company routes to build a deduplicated, valid XML sitemap.
 */
export function generateDynamicSitemap(options: SitemapOptions = {}): GeneratedSitemapResult {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const includeCategories = options.includeCategories !== false;
  const includeLastMod = options.includeLastMod !== false;
  const fallbackDate = parseDateToIso(options.defaultLastMod) || '2026-11-23';

  const entries: SitemapEntry[] = [];
  const seenPaths = new Set<string>();

  const pushEntry = (entry: Omit<SitemapEntry, 'loc'>) => {
    const cleanPath = entry.path === '/' ? '/' : `/${entry.path.replace(/^\/+/, '').replace(/\/+$/, '')}`;
    if (seenPaths.has(cleanPath)) return;
    seenPaths.add(cleanPath);
    const loc = cleanPath === '/' ? `${baseUrl}/` : `${baseUrl}${cleanPath}`;
    entries.push({
      ...entry,
      path: cleanPath,
      loc
    });
  };

  // 1. Core landing & hub routes
  pushEntry({
    path: '/',
    section: 'core',
    label: 'Mimage Home',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: fallbackDate
  });
  pushEntry({
    path: '/tools',
    section: 'core',
    label: `All ${TOOLS_DATA.length} Tools Directory`,
    changefreq: 'daily',
    priority: '0.95',
    lastmod: fallbackDate
  });
  pushEntry({
    path: '/blog',
    section: 'core',
    label: `Guides & Articles Hub (${PRE_SEEDED_BLOG_POSTS.length})`,
    changefreq: 'weekly',
    priority: '0.90',
    lastmod: fallbackDate
  });

  // 2. Dynamically crawled Tools (honors direct canonical slugs + /tool/:slug)
  for (const tool of TOOLS_DATA) {
    const isDirect = DIRECT_TOOL_SLUGS.has(tool.slug);
    const toolPath = isDirect ? `/${tool.slug}` : `/tool/${tool.slug}`;
    const priority = isDirect
      ? tool.id === 'smart-assistant' || tool.id === 'optimization-studio' || tool.id === 'website-image-audit'
        ? '0.95'
        : '0.90'
      : tool.isPopular || tool.isRecommended
      ? '0.90'
      : '0.85';

    pushEntry({
      path: toolPath,
      section: 'tool',
      label: tool.name,
      changefreq: 'weekly',
      priority,
      lastmod: fallbackDate
    });
  }

  // 3. Dynamically crawled Category landing routes (/category/:id)
  if (includeCategories) {
    for (const cat of TOOL_CATEGORIES) {
      if (cat.id === 'all') continue;
      pushEntry({
        path: `/category/${cat.id}`,
        section: 'category',
        label: `${cat.name} (${cat.count})`,
        changefreq: 'weekly',
        priority: '0.85',
        lastmod: fallbackDate
      });
    }
  }

  // 4. Dynamically crawled Blog Posts (/blog/:slug)
  for (const post of PRE_SEEDED_BLOG_POSTS) {
    const postDate = parseDateToIso(post.publishedDate) || fallbackDate;
    pushEntry({
      path: `/blog/${post.slug}`,
      section: 'blog',
      label: post.title,
      changefreq: 'monthly',
      priority: '0.85',
      lastmod: postDate
    });
  }

  // 5. Company, E-E-A-T & Legal Pages
  const companyRoutes: Array<{ path: string; label: string; priority: string }> = [
    { path: '/portfolio', label: 'Founder Portfolio (Naveed Afzal)', priority: '0.80' },
    { path: '/privacy-center', label: 'Privacy Center', priority: '0.80' },
    { path: '/methodology', label: 'Diagnostics & Methodology', priority: '0.75' },
    { path: '/about', label: 'About Mimage', priority: '0.70' },
    { path: '/privacy', label: 'Privacy Policy', priority: '0.70' },
    { path: '/terms', label: 'Terms of Service', priority: '0.70' },
    { path: '/cookies', label: 'Cookie Policy', priority: '0.70' },
    { path: '/disclaimer', label: 'Disclaimer', priority: '0.65' },
    { path: '/contact', label: 'Contact & Support', priority: '0.70' },
    { path: '/sitemap', label: 'HTML & XML Sitemap Generator', priority: '0.65' }
  ];

  for (const page of companyRoutes) {
    pushEntry({
      path: page.path,
      section: 'company',
      label: page.label,
      changefreq: 'monthly',
      priority: page.priority,
      lastmod: fallbackDate
    });
  }

  const urlBlocks = entries
    .map((entry) => {
      const lastmodTag =
        includeLastMod && entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmodTag}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks}\n</urlset>\n`;

  const stats: SitemapStats = {
    totalUrls: entries.length,
    coreCount: entries.filter((e) => e.section === 'core').length,
    categoryCount: entries.filter((e) => e.section === 'category').length,
    toolCount: entries.filter((e) => e.section === 'tool').length,
    blogCount: entries.filter((e) => e.section === 'blog').length,
    companyCount: entries.filter((e) => e.section === 'company').length,
    byteSize: new TextEncoder().encode(xml).length
  };

  return { xml, baseUrl, entries, stats };
}
