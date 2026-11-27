import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Info,
  Mail,
  Map,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cookie,
  Cpu,
  Globe,
  Lock,
  ChevronRight,
  Code2,
  BookOpen,
  User
} from 'lucide-react';
import { TOOLS_DATA, TOOL_CATEGORIES } from '../data/toolsData';
import { PRE_SEEDED_BLOG_POSTS } from '../data/blogData';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { EDITORIAL_IMAGES } from '../data/editorialAssets';
import { SitemapGeneratorPanel } from './SitemapGeneratorPanel';
import { SitemapEntry } from '../utils/sitemapGenerator';

export type CompanyPageType =
  | 'about'
  | 'portfolio'
  | 'terms'
  | 'disclaimer'
  | 'privacy'
  | 'privacy-center'
  | 'cookies'
  | 'contact'
  | 'sitemap';

interface CompanyPagesProps {
  pageType: CompanyPageType;
  onBackToHome: () => void;
  onSelectTool: (slug: string) => void;
  onSelectPost?: (slug: string) => void;
  onNavigateBlog?: () => void;
  onNavigateCompanyPage?: (type: CompanyPageType) => void;
  onNavigatePath?: (path: string) => void;
  onOpenCookieSettings?: () => void;
}

export const CompanyPages: React.FC<CompanyPagesProps> = ({
  pageType,
  onBackToHome,
  onSelectTool,
  onSelectPost,
  onNavigateBlog,
  onNavigateCompanyPage,
  onNavigatePath,
  onOpenCookieSettings
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Feedback',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
    const mailtoUrl = `mailto:Afzal460@gmail.com,support@fixpdf.org?subject=${encodeURIComponent(
      `[Mimage Contact] ${formData.subject}`
    )}&body=${encodeURIComponent(`From: ${formData.name} <${formData.email}>\n\n${formData.message}`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-800 dark:text-slate-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>

        <a
          href="https://fixpdf.org/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1"
        >
          <span>fixpdf.org</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm space-y-8">
        {/* PRIVACY CENTER */}
        {pageType === 'privacy-center' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Mimage Privacy Center
                </h1>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Honest breakdown of browser-local vs network processing
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We believe users deserve exact honesty rather than sweeping marketing slogans. Here is how each group of utilities on Mimage handles your files and URLs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  <Cpu className="w-4 h-4" />
                  <span>Browser-Local Tools (0 bytes uploaded)</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                  Image Compression, Exact-Size Compressor, Social Resizer, Image Optimization Studio, EXIF Viewer &amp; Remover, Color Extractor, SVG Optimizer, Base64 Converter, QR Code Generator, Favicon/App Icon Builder, GIF Maker/Compressor, Image Upscaler, Merge/Split/Rotate/Organize/Compress/Sign PDF, and Smart File Assistant execute inside your browser sandbox using Canvas 2D, pdf-lib, pdfjs-dist, and Web Workers.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
                  <Globe className="w-4 h-4" />
                  <span>Network &amp; Hybrid Requests</span>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  <strong>1. OCR Text Extraction:</strong> Recognition runs locally in WebAssembly, but your browser fetches Tesseract traineddata language dictionaries from jsDelivr CDN on first use unless cached.
                  <br />
                  <strong>2. Website Image Audit:</strong> When auditing a live public HTTPS URL (rather than pasting HTML locally), Mimage validates the hostname against SSRF private IP blocks and fetches public page HTML via direct browser request or public CORS proxy fallback (e.g. AllOrigins / corsproxy). No results or URLs are stored by Mimage.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Lock className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Retention, Storage &amp; Execution Safeguards</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>No server database or user file storage:</strong> Mimage operates as a static client application with no backend file upload bucket.</li>
                <li><strong>SVG &amp; XSS protection:</strong> Uploaded SVGs are inspected and sanitized against embedded <code>&lt;script&gt;</code>, event handlers, and unsafe entities.</li>
                <li><strong>SSRF URL checks:</strong> Website Image Audit blocks <code>localhost</code>, loopback IPs, link-local metadata endpoints (<code>169.254.169.254</code>), and RFC1918 private LAN ranges.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ABOUT US */}
        {pageType === 'about' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <Info className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">About Mimage</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">
                  Free Online File &amp; Image Tools — Private, Fast, No Sign-Up
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Mimage (<a href="https://fixpdf.org/" className="text-blue-600 dark:text-sky-400 underline">https://fixpdf.org/</a>)</strong> is a browser-first workspace built for everyday internet users, bloggers, web designers, ecommerce sellers, students, and developers.
              </p>
              <p>
                Our focus is practical utility without account walls, deceptive download buttons, fabricated testimonials, or needless server uploads. Image compression, EXIF metadata removal, social media presets, PDF organization, QR code creation, and smart file signature detection run cleanly inside your own device memory.
              </p>

              {/* Editorial Standards & Sustainability */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Editorial Policy &amp; Site Sustainability
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every technical guide published on <strong>fixpdf.org</strong> is authored and verified by <strong>Naveed Afzal</strong> against working client-side implementations in Mimage, ISO/W3C format specifications, and reproducible browser behavior. To keep all {TOOLS_DATA.length}+ utilities and {PRE_SEEDED_BLOG_POSTS.length}+ engineering guides completely free without paywalls, Mimage displays non-intrusive advertising via Google AdSense clearly separated from tool action controls.
                </p>
              </div>

              {/* Founder Card */}
              <div className="my-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <img
                    src={EDITORIAL_IMAGES.authorAvatar}
                    alt="Naveed Afzal - Mimage Administrator, Founder & Writer"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Naveed Afzal</h2>
                    <span className="text-xs font-mono text-blue-600 dark:text-sky-400 font-semibold">
                      Administrator, Founder &amp; Lead Writer
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Administrator, software developer, and technical writer focused on lightweight browser-local utilities, accessible web workflows, and transparent engineering standards.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono pt-1">
                    <a href="mailto:Afzal460@gmail.com" className="text-blue-600 dark:text-sky-400 hover:underline font-semibold">
                      Afzal460@gmail.com
                    </a>
                    {onNavigateCompanyPage && (
                      <>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <button
                          onClick={() => onNavigateCompanyPage('portfolio')}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>View Founder Portfolio</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOUNDER PORTFOLIO (/portfolio) */}
        {pageType === 'portfolio' && (
          <div className="space-y-10">
            {/* Hero Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    <span>Naveed Afzal</span>
                    <span aria-hidden="true">·</span>
                    <span>Administrator, Founder &amp; Lead Technical Writer</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Browser-First Software Engineering &amp; Technical Documentation
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Creator and maintainer of <strong>Mimage</strong> (
                    <a
                      href="https://fixpdf.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-sky-400 underline underline-offset-2"
                    >
                      fixpdf.org
                    </a>
                    ), building client-side WebAssembly, HTML5 Canvas, PDF engineering, and web-standards utilities alongside reproducible technical documentation designed for clarity, zero account friction, and transparent privacy disclosures.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={onBackToHome}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Explore {TOOLS_DATA.length} Tools</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href="mailto:Afzal460@gmail.com"
                    className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-emerald-500 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Afzal460@gmail.com</span>
                  </a>
                  {onNavigateBlog && (
                    <button
                      onClick={onNavigateBlog}
                      className="px-4 py-2.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read {PRE_SEEDED_BLOG_POSTS.length} Guides</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="h-64 sm:h-80 lg:h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                  <img
                    src={EDITORIAL_IMAGES.authorAvatar}
                    alt="Naveed Afzal working in modern multi-display technical workspace"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Full-Width Verified Platform Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-500">
                  {TOOLS_DATA.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Browser-local &amp; client utilities
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {TOOL_CATEGORIES.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Functional tool categories
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {PRE_SEEDED_BLOG_POSTS.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authored technical guides
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {SUPPORTED_LANGUAGES.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Supported languages (incl. RTL)
                </div>
              </div>
            </div>

            {/* 01. Engineering Focus & Technical Stack */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  01. Core Engineering Domains
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Capabilities shipped directly inside the live Mimage application runtime.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Canvas &amp; Raster Pipelines</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    HTML5 Canvas pixel transforms, exact-KB binary search JPEG/WebP convergence, EXIF orientation preservation, metadata scrubbing, and batch ZIP bundling via JSZip.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Code2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>WebAssembly PDF &amp; OCR</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Multi-DPI vector rasterization with <code>pdfjs-dist</code>, binary PDF assembly and flattening with <code>pdf-lib</code>, structured extraction to Markdown/CSV/JSON, and Web Worker Tesseract OCR.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Security &amp; Web Standards</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Binary magic-byte file inspection, DOM-based SVG XSS payload removal, SSRF hostname/RFC1918 guardrails on web image audits, and ISO/IEC 18004 QR synthesis.
                  </p>
                </div>
              </div>
            </div>

            {/* 02. Selected Live Systems Built on Mimage */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  02. Selected Live Systems Built
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interactive browser utilities available live on Mimage—click any system to launch.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    slug: 'smart-assistant',
                    meta: 'Format Forensics · Magic Bytes',
                    title: 'Smart File Assistant',
                    summary:
                      'Reads raw binary file signatures locally in ArrayBuffer memory rather than trusting extensions, identifying mismatched files and routing to verified actions.'
                  },
                  {
                    slug: 'optimization-studio',
                    meta: 'Batch Pipeline · WebP / AVIF / EXIF',
                    title: 'Image Optimization Studio',
                    summary:
                      'Multi-file browser pipeline combining proportional resizing, EXIF stripping, WebP/AVIF transcoding, exact savings reporting, and clean ZIP packaging.'
                  },
                  {
                    slug: 'website-image-audit',
                    meta: 'Web Performance · SSRF Guarded',
                    title: 'Website Image Audit',
                    summary:
                      'Inspects public URL or pasted HTML media payloads, surfacing missing alt text, dimension attributes, lazy-loading flags, and measured vs. estimated savings.'
                  },
                  {
                    slug: 'pdf-to-png',
                    meta: 'WebAssembly · pdfjs-dist & pdf-lib',
                    title: 'PDF Conversion & Organization Suite',
                    summary:
                      'Covers multi-page PNG/JPG/WebP rendering at 72–300 DPI alongside page merging, splitting, margin trimming, grayscale conversion, compression, and Markdown export.'
                  },
                  {
                    slug: 'svg-optimizer',
                    meta: 'OWASP Hygiene · Vector XML',
                    title: 'SVG Optimizer & Security Sanitizer',
                    summary:
                      'Scrubs active script nodes, inline onload handlers, and editor metadata bloat from SVG markup while preserving responsive viewBox geometry.'
                  },
                  {
                    slug: 'qr-code-generator',
                    meta: 'ISO/IEC 18004 · Print SVG & PNG',
                    title: 'QR Code Engineering Generator',
                    summary:
                      'Synthesizes direct payload QR matrices (URLs, Wi-Fi WPA3, vCard 3.0) with selectable ECC levels and clean quiet-zone vector exports—zero intermediary tracking.'
                  }
                ].map((project) => (
                  <button
                    key={project.slug}
                    onClick={() => onSelectTool(project.slug)}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 transition-colors text-left flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {project.meta}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 pt-1">
                      <span>Launch Tool</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 03. Technical Publications & Guides */}
            <div className="space-y-5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    03. Selected Technical Writing
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Long-form engineering references documenting browser codecs, PDF compression, SVG sanitization, and Core Web Vitals.
                  </p>
                </div>
                {onNavigateBlog && (
                  <button
                    onClick={onNavigateBlog}
                    className="text-xs font-mono text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>View All {PRE_SEEDED_BLOG_POSTS.length} Guides</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                {PRE_SEEDED_BLOG_POSTS.slice(0, 6).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onSelectPost && onSelectPost(article.slug)}
                    className="w-full p-4 text-left hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span>{article.primaryKeyword}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">{article.readTime}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                        {article.title}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TERMS */}
        {pageType === 'terms' && (
          <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">Effective: November 2026</p>
              </div>
            </div>
            <p>
              By accessing Mimage (<a href="https://fixpdf.org/" className="text-blue-600 dark:text-sky-400 underline">https://fixpdf.org/</a>), you agree to use our utilities lawfully and responsibly.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Intellectual Property &amp; Ownership</h2>
            <p>
              You retain 100% ownership of all input and output files processed through Mimage tools. Because local conversion runs on your own hardware, Mimage claims zero license or right over your documents or artwork.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Tool Disclosures &amp; No Legal Guarantee on PDF Signatures</h2>
            <p>
              Tools are provided &quot;AS IS&quot; without warranty of fitness for a particular regulatory or legal purpose. Placing a drawn or typed signature stamp onto a PDF embeds an image visually—it is not a digital certificate signature and is not a legal guarantee of electronic signature validity.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Acceptable Use</h2>
            <p>
              Do not use the Website Image Audit tool to scan unauthorized internal hosts, perform denial-of-service floods, or bypass access controls.
            </p>
          </div>
        )}

        {/* DISCLAIMER */}
        {pageType === 'disclaimer' && (
          <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Disclaimer</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">Accuracy, Advertising &amp; Professional Advice Notices · Updated November 2026</p>
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. General Information &amp; Technical Accuracy</h2>
            <p>
              All tools, compression benchmarks, format converters, and educational guides published on <strong>Mimage (https://fixpdf.org/)</strong> are provided in good faith for general informational and productivity purposes. While every article is technically reviewed prior to publication, browser codec behavior may vary across operating systems and device hardware.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Estimates vs. Exact Measurements</h2>
            <p>
              Website Image Audit distinguishes measured asset sizes (where response headers expose <code>Content-Length</code>) from format conversion estimates. Target KB image compression may adjust quality or optional resolution downscaling, and highly detailed photographs may not reach tiny KB targets without visible quality trade-offs.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. No Legal, Financial, or Compliance Advice</h2>
            <p>
              Guides covering legal Bates numbering, invoice templates, HIPAA/GDPR privacy workflows, or e-signature placement do not constitute formal legal or regulatory counsel. Visual signatures embedded in PDFs are graphical stamps rather than cryptographic PKI certificates.
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Google AdSense &amp; External Links Disclosure</h2>
            <p>
              Mimage displays Google AdSense advertisements (Publisher ID <code>ca-pub-8358033803354457</code>) to fund free access to all utilities. External standards references (ISO, W3C, IETF, MDN) are cited strictly for educational attribution; Mimage is not responsible for external third-party website content.
            </p>
          </div>
        )}

        {/* PRIVACY POLICY */}
        {pageType === 'privacy' && (
          <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">Effective: November 2026 · Mimage (fixpdf.org) GDPR, CCPA &amp; Google AdSense Compliance</p>
              </div>
            </div>
            <p>
              <strong>Mimage</strong> (accessible at <a href="https://fixpdf.org/" className="text-blue-600 dark:text-sky-400 underline">https://fixpdf.org/</a>, operated by Naveed Afzal) respects your privacy. This Privacy Policy documents what information is processed locally on your device versus what limited telemetry or advertising cookies are handled by third-party partners.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Zero-Upload File Processing &amp; Account-Free Architecture</h2>
            <p>
              Mimage requires no account registration, login, or passwords. Uploaded images, PDFs, CSVs, JSON/XML documents, and SVGs are processed directly inside your browser&apos;s RAM using HTML5 Canvas, Web Workers, and WebAssembly. Your source files and converted outputs are never stored on Mimage servers. Tools explicitly labeled <strong>Local + Dict</strong> (OCR dictionary downloads from jsDelivr CDN) or <strong>Network Fetch</strong> (Website Image Audit for user-entered public HTTPS URLs) only initiate network requests when triggered by your action.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Google AdSense, DoubleClick Cookie &amp; Personalized Advertising</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Third-party vendors, including <strong>Google</strong>, use cookies (such as the DoubleClick / AdSense cookie) to serve ads based on your prior visits to <strong>fixpdf.org</strong> or other websites on the internet.</li>
              <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads tailored to your interests, or non-personalized contextual ads where consent is declined.</li>
              <li>
                You may opt out of personalized advertising anytime by visiting{' '}
                <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 underline">
                  Google Ads Settings
                </a>{' '}
                or the{' '}
                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 underline">
                  Digital Advertising Alliance opt-out page
                </a>
                , or by adjusting your preferences inside our{' '}
                {onOpenCookieSettings ? (
                  <button onClick={onOpenCookieSettings} className="text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer">
                    Cookie &amp; Ad Preferences Panel
                  </button>
                ) : (
                  'Cookie Preferences panel'
                )}
                .
              </li>
            </ul>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Google Analytics 4 (Aggregate Traffic Measurement)</h2>
            <p>
              We use Google Analytics 4 (Measurement ID <code>G-ZM8R2JF6WT</code>) to measure anonymous page views, language usage, and tool popularity so we can improve performance. Google Analytics never inspects the contents of files processed inside Mimage tools.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. GDPR (EEA / UK) &amp; CCPA / CPRA Rights</h2>
            <p>
              Under the EU/UK General Data Protection Regulation (GDPR), we process non-essential analytics and personalized advertising cookies strictly on the basis of your explicit consent via our Google Consent Mode v2 banner. Under the California Consumer Privacy Act (CCPA/CPRA), Mimage does not sell personal information or uploaded document data. Residents may exercise access, deletion, or consent-withdrawal rights anytime by clearing local browser preferences or contacting us directly.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Children&apos;s Information (COPPA)</h2>
            <p>
              Mimage does not knowingly collect personally identifiable information from children under the age of 13. If you believe a minor has submitted personal contact correspondence, contact <a href="mailto:support@fixpdf.org" className="text-blue-600 dark:text-sky-400 underline">support@fixpdf.org</a> or <a href="mailto:Afzal460@gmail.com" className="text-blue-600 dark:text-sky-400 underline">Afzal460@gmail.com</a> for immediate removal.
            </p>
          </div>
        )}

        {/* COOKIE POLICY */}
        {pageType === 'cookies' && (
          <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <Cookie className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Cookie Policy</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">Local Storage, Analytics &amp; Google AdSense Cookie Controls · Updated November 2026</p>
              </div>
            </div>
            <p>
              This Cookie Policy explains how <strong>Mimage (fixpdf.org)</strong> and our advertising/analytics partners use browser storage and cookies when you visit our web tools.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-xl">
                <thead className="bg-slate-100 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400">
                  <tr>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700">Category</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700">Provider / Key</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold">Essential Storage</td>
                    <td className="p-3"><code>mimage_consent_v1</code>, language key</td>
                    <td className="p-3">Remembers your chosen interface language and cookie consent preferences.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Analytics</td>
                    <td className="p-3">Google Analytics 4 (<code>_ga</code>)</td>
                    <td className="p-3">Measures aggregate page traffic and tool popularity without accessing local files.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Advertising</td>
                    <td className="p-3">Google AdSense (<code>ca-pub-8358033803354457</code>)</td>
                    <td className="p-3">Delivers contextual or personalized ads and measures ad frequency capping.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {onOpenCookieSettings && (
                <button
                  onClick={onOpenCookieSettings}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Open Cookie &amp; Ad Preferences
                </button>
              )}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 dark:text-sky-400 underline"
              >
                Manage Google Ads Personalization →
              </a>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {pageType === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <Mail className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Contact &amp; Support</h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">Reach the Mimage Team</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  <div className="text-slate-500 uppercase font-mono">Founder Direct</div>
                  <div className="text-slate-900 dark:text-white font-bold text-sm">Naveed Afzal</div>
                  <a href="mailto:Afzal460@gmail.com" className="text-blue-600 dark:text-sky-400 font-mono font-bold hover:underline block">
                    Afzal460@gmail.com
                  </a>
                  {onNavigateCompanyPage && (
                    <button
                      onClick={() => onNavigateCompanyPage('portfolio')}
                      className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] hover:underline inline-flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <User className="w-3 h-3" />
                      <span>Open Founder Portfolio</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  <div className="text-slate-500 uppercase font-mono">General Support</div>
                  <a href="mailto:support@fixpdf.org" className="text-blue-600 dark:text-sky-400 font-mono font-bold hover:underline block">
                    support@fixpdf.org
                  </a>
                  <p className="text-slate-500">Bug reports, format compatibility questions, and partnership inquiries.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Send a Message</h2>

                {formSubmitted ? (
                  <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm">Email Client Triggered</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Your email draft has been opened addressed to support@fixpdf.org.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-mono text-xs font-semibold cursor-pointer"
                    >
                      Compose Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-3 text-xs">
                    {formError && (
                      <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name *"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Your Email Address *"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                    />
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="General Feedback">General Feedback</option>
                      <option value="Bug Report / Tool Issue">Bug Report / Tool Issue</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="AdSense / Legal Inquiry">AdSense / Legal Inquiry</option>
                    </select>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question or issue..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Open Email Draft</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SITEMAP */}
        {pageType === 'sitemap' && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400">
                <Map className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Mimage HTML Sitemap &amp; Dynamic XML Generator
                </h1>
                <p className="text-xs font-mono text-blue-600 dark:text-sky-400">
                  Index of all {TOOLS_DATA.length} tools, {PRE_SEEDED_BLOG_POSTS.length} guides &amp; site endpoints
                </p>
              </div>
            </div>

            <SitemapGeneratorPanel
              onNavigateEntry={(entry: SitemapEntry) => {
                if (onNavigatePath) {
                  onNavigatePath(entry.path);
                  return;
                }
                if (entry.section === 'tool') {
                  const slug = entry.path.replace(/^\/tool\//, '').replace(/^\//, '');
                  onSelectTool(slug);
                } else if (entry.section === 'blog' && onSelectPost) {
                  const slug = entry.path.replace(/^\/blog\//, '');
                  onSelectPost(slug);
                } else if (entry.path === '/blog' && onNavigateBlog) {
                  onNavigateBlog();
                } else if (entry.path === '/' || entry.path === '/tools') {
                  onBackToHome();
                } else if (entry.section === 'company' && onNavigateCompanyPage) {
                  const slug = entry.path.replace(/^\//, '') as CompanyPageType;
                  if (slug) onNavigateCompanyPage(slug);
                }
              }}
            />

            {/* All Tools HTML Links */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>All Converter &amp; Utility Pages ({TOOLS_DATA.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {TOOLS_DATA.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.slug)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-400 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-mono text-blue-600 dark:text-sky-400 font-bold">
                      {tool.fromFormat} → {tool.toFormat}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{tool.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Blog Guides HTML Links */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                All Educational Guides &amp; Blog Posts ({PRE_SEEDED_BLOG_POSTS.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRE_SEEDED_BLOG_POSTS.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => onSelectPost && onSelectPost(post.slug)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-mono text-emerald-500 font-semibold mb-0.5">
                      /blog/{post.slug}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {post.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
