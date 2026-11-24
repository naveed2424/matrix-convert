/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MatrixBackground } from './components/MatrixBackground';
import { Navbar } from './components/Navbar';
import { LanguageBanner } from './components/LanguageBanner';
import { HeroSection } from './components/HeroSection';
import { ToolsGrid } from './components/ToolsGrid';
import { DedicatedToolPage } from './components/DedicatedToolPage';
import { HowToGuidesSection } from './components/HowToGuidesSection';
import { MatrixArtStudio } from './components/MatrixArtStudio';
import { AutoDetectionModal } from './components/AutoDetectionModal';
import { LegalPagesModal, LegalPageType } from './components/LegalPagesModal';
import { CompanyPages, CompanyPageType } from './components/CompanyPages';
import { BlogHub } from './components/BlogHub';
import { BlogPostView } from './components/BlogPostView';
import { MethodologyFeedbackPage } from './components/MethodologyFeedbackPage';
import { Footer } from './components/Footer';
import { TOOLS_DATA, TOOL_CATEGORIES } from './data/toolsData';
import { PRE_SEEDED_BLOG_POSTS } from './data/blogData';
import { ToolDefinition } from './types';
import { PdfSignTool } from './components/tools/PdfSignTool';
import { PdfCropTool } from './components/tools/PdfCropTool';
import { PdfMergeTool } from './components/tools/PdfMergeTool';
import { PdfSplitTool } from './components/tools/PdfSplitTool';
import { PdfDeletePagesTool } from './components/tools/PdfDeletePagesTool';
import { PdfRotateTool } from './components/tools/PdfRotateTool';
import { PdfWatermarkTool } from './components/tools/PdfWatermarkTool';
import { PdfToTextTool } from './components/tools/PdfToTextTool';
import { initAutoTranslate, applySiteLanguage, getSavedLanguage, rescanDomTranslation } from './services/autoTranslation';
import { updatePageSeo } from './services/seoManager';
import { ArrowLeft } from 'lucide-react';

export type AppView =
  | 'home'
  | 'tool'
  | 'blog'
  | 'blog-post'
  | 'company-page'
  | 'methodology'
  | 'not-found';

const DIRECT_TOOL_PATHS = new Set([
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

const COMPANY_PAGE_PATHS = new Set<CompanyPageType>([
  'about',
  'portfolio',
  'terms',
  'disclaimer',
  'privacy',
  'privacy-center',
  'cookies',
  'contact',
  'sitemap'
]);

export default function App() {
  const [currentLang, setCurrentLang] = useState<string>(() => getSavedLanguage());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [showMatrixArtStudio, setShowMatrixArtStudio] = useState<boolean>(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showAutoDetectModal, setShowAutoDetectModal] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalPageType | null>(null);

  const [activeView, setActiveView] = useState<AppView>('home');
  const [activePostSlug, setActivePostSlug] = useState<string | null>(null);
  const [companyPageType, setCompanyPageType] = useState<CompanyPageType>('about');

  // Lock dark Matrix class on document root without client-side theme switching
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Initialize Google Translate auto-detection engine on mount
  useEffect(() => {
    initAutoTranslate((detected) => {
      setCurrentLang(detected);
    });
  }, []);

  const handleSelectLang = (code: string) => {
    setCurrentLang(code);
    applySiteLanguage(code);
  };

  // Trigger Google Translate DOM rescan whenever SPA route or language changes
  useEffect(() => {
    if (currentLang !== 'en') {
      rescanDomTranslation(currentLang, 160);
    }
  }, [currentLang, activeView, activePostSlug, activeTool?.id, companyPageType]);

  const trackPageView = (path: string) => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-ZM8R2JF6WT', {
        page_path: path
      });
    }
  };

  const resolveRouteFromUrl = useCallback(() => {
    // Normalize legacy hash URLs (e.g. #/tool/pdf-to-png) into clean pathnames
    const rawHash = window.location.hash;
    if (rawHash.startsWith('#/')) {
      const cleanPath = rawHash.slice(1) || '/';
      window.history.replaceState({}, '', cleanPath);
    }

    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const segments = pathname.split('/').filter(Boolean);

    setLegalModalType(null);

    // Home or Tools Directory
    if (pathname === '/' || pathname === '/tools') {
      setActiveView('home');
      setActiveTool(null);
      setActivePostSlug(null);
      updatePageSeo({
        title: 'Mimage — Free Online File & Image Tools | Private, Fast, No Sign-Up',
        description:
          'Free browser-local image compression, resizing, format conversion, EXIF metadata removal, PDF tools, OCR extraction, and website image auditing.',
        canonicalPath: pathname
      });
      trackPageView(pathname);
      if (pathname === '/tools') {
        setTimeout(() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
      return;
    }

    // Category direct links: /category/image-tools
    if (segments[0] === 'category' && segments[1]) {
      const cat = TOOL_CATEGORIES.find((c) => c.id === segments[1]);
      if (cat) {
        setActiveCategory(cat.id);
        setActiveView('home');
        setActiveTool(null);
        updatePageSeo({
          title: `${cat.name} | Mimage Free Online File Tools`,
          description: `Browse ${cat.count} browser-local ${cat.name.toLowerCase()} on Mimage. Private, fast, no sign-up required.`,
          canonicalPath: pathname
        });
        trackPageView(pathname);
        setTimeout(() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' }), 80);
        return;
      }
    }

    // Direct top-level tool paths (/smart-assistant, /compress-image-to-100kb, etc.)
    if (segments.length === 1 && DIRECT_TOOL_PATHS.has(segments[0])) {
      const found = TOOLS_DATA.find((t) => t.slug === segments[0] || t.id === segments[0]);
      if (found) {
        setActiveTool(found);
        setActiveView('tool');
        updatePageSeo({
          title: `${found.name} | Mimage`,
          description: found.shortDescription,
          canonicalPath: `/${found.slug}`,
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: found.categoryName, url: `/category/${found.category}` },
            { name: found.name, url: `/${found.slug}` }
          ],
          softwareApp: {
            name: found.name,
            description: found.shortDescription,
            category: found.categoryName
          }
        });
        trackPageView(pathname);
        return;
      }
    }

    // Standard /tool/:slug route
    if (segments[0] === 'tool' && segments[1]) {
      const slug = segments[1];
      const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
      if (found) {
        setActiveTool(found);
        setActiveView('tool');
        updatePageSeo({
          title: `${found.name} | Mimage`,
          description: found.shortDescription,
          canonicalPath: `/tool/${found.slug}`,
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: found.categoryName, url: `/category/${found.category}` },
            { name: found.name, url: `/tool/${found.slug}` }
          ],
          softwareApp: {
            name: found.name,
            description: found.shortDescription,
            category: found.categoryName
          }
        });
        trackPageView(pathname);
        return;
      }
    }

    // Blog hub
    if (pathname === '/blog' || pathname === '/articles' || pathname === '/guides') {
      setActiveView('blog');
      setActiveTool(null);
      setActivePostSlug(null);
      updatePageSeo({
        title: 'Guides & Educational Articles | Mimage',
        description: 'Practical guides on image optimization, PDF workflows, format comparisons, and browser privacy.',
        canonicalPath: '/blog'
      });
      trackPageView('/blog');
      return;
    }

    // Single Blog post (/blog/:slug)
    if (segments[0] === 'blog' && segments[1]) {
      const post = PRE_SEEDED_BLOG_POSTS.find((p) => p.slug === segments[1]);
      if (post) {
        setActivePostSlug(post.slug);
        setActiveView('blog-post');
        setActiveTool(null);
        updatePageSeo({
          title: `${post.metaTitle || post.title} | Mimage`,
          description: post.metaDescription,
          canonicalPath: `/blog/${post.slug}`,
          type: 'article',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Guides', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` }
          ]
        });
        trackPageView(pathname);
        return;
      }
    }

    // Diagnostics & Methodology / Feedback
    if (pathname === '/methodology' || pathname === '/feedback' || pathname === '/diagnostics') {
      setActiveView('methodology');
      setActiveTool(null);
      updatePageSeo({
        title: 'Testing Methodology, Browser Diagnostics & Feedback | Mimage',
        description: 'Live browser capability probes, verification methodology, and feedback submission for Mimage.',
        canonicalPath: pathname
      });
      trackPageView(pathname);
      return;
    }

    // Company & Legal routes
    const singleSeg = segments[0] as CompanyPageType;
    if (segments.length === 1 && COMPANY_PAGE_PATHS.has(singleSeg)) {
      setCompanyPageType(singleSeg);
      setActiveView('company-page');
      setActiveTool(null);
      const titles: Record<CompanyPageType, string> = {
        about: 'About Mimage | Free Online File & Image Tools',
        portfolio: 'Naveed Afzal — Founder & Developer Portfolio | Mimage',
        terms: 'Terms of Service | Mimage',
        disclaimer: 'Disclaimer | Mimage',
        privacy: 'Privacy Policy | Mimage',
        'privacy-center': 'Privacy Center — Local vs Network Processing | Mimage',
        cookies: 'Cookie Policy | Mimage',
        contact: 'Contact & Support | Mimage',
        sitemap: 'HTML Sitemap Directory | Mimage'
      };
      updatePageSeo({
        title: titles[singleSeg],
        description:
          singleSeg === 'portfolio'
            ? 'Founder portfolio of Naveed Afzal, creator and lead writer at Mimage — browser-local WebAssembly PDF, Canvas image optimization, and web security tools.'
            : 'Transparency, privacy architecture, terms, and support information for Mimage.',
        canonicalPath: `/${singleSeg}`
      });
      trackPageView(pathname);
      return;
    }

    // Fallback 404
    setActiveView('not-found');
    setActiveTool(null);
    setActivePostSlug(null);
    updatePageSeo({
      title: 'Page Not Found | Mimage',
      description: 'The requested page could not be found on Mimage.',
      canonicalPath: '/'
    });
  }, []);

  useEffect(() => {
    resolveRouteFromUrl();
    const handlePopOrHash = () => resolveRouteFromUrl();
    window.addEventListener('popstate', handlePopOrHash);
    window.addEventListener('hashchange', handlePopOrHash);
    return () => {
      window.removeEventListener('popstate', handlePopOrHash);
      window.removeEventListener('hashchange', handlePopOrHash);
    };
  }, [resolveRouteFromUrl]);

  const navigateTo = (path: string) => {
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== clean || window.location.hash) {
      window.history.pushState({}, '', clean);
    }
    resolveRouteFromUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    const path = DIRECT_TOOL_PATHS.has(tool.slug) ? `/${tool.slug}` : `/tool/${tool.slug}`;
    navigateTo(path);
  };

  const handleSelectToolBySlug = (slug: string) => {
    const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
    if (found) {
      handleSelectTool(found);
    }
  };

  const handleBackToAllTools = () => {
    navigateTo('/');
  };

  const handleFileDropped = (fileList: FileList) => {
    setDroppedFiles(Array.from(fileList));
    setShowAutoDetectModal(true);
  };

  const handleSelectToolForFiles = (tool: ToolDefinition) => {
    setShowAutoDetectModal(false);
    handleSelectTool(tool);
  };

  const scrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activePost = activePostSlug
    ? PRE_SEEDED_BLOG_POSTS.find((p) => p.slug === activePostSlug) || null
    : null;

  return (
    <div className="min-h-screen bg-[#050807] text-[#e0e6e3] relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Classic Falling Matrix Digital Rain Background */}
      <MatrixBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div
          id="google_translate_element"
          className="fixed -left-[9999px] top-0 w-px h-px overflow-hidden opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        <LanguageBanner currentLang={currentLang} onSelectLang={handleSelectLang} />

        <Navbar
          currentLang={currentLang}
          onSelectLang={handleSelectLang}
          onNavigateHome={handleBackToAllTools}
          onNavigateCategory={(catId) => {
            setActiveCategory(catId);
            if (activeView !== 'home') {
              navigateTo('/');
            }
            setTimeout(scrollToTools, 120);
          }}
          onSelectToolBySlug={handleSelectToolBySlug}
          onOpenMatrixArt={() => setShowMatrixArtStudio(true)}
          onNavigateBlog={() => navigateTo('/blog')}
          onNavigatePrivacyCenter={() => navigateTo('/privacy-center')}
          onNavigateMethodology={() => navigateTo('/methodology')}
          onSearchInDirectory={(q) => {
            setSearchQuery(q);
            setActiveCategory('all');
            if (activeView !== 'home') {
              navigateTo('/');
            }
            setTimeout(scrollToTools, 120);
          }}
        />

        <main className="flex-1">
          {activeView === 'tool' && activeTool && (
            <>
              {activeTool.id === 'pdf-sign' ? (
                <PdfSignTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-crop' ? (
                <PdfCropTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-merge' ? (
                <PdfMergeTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-split' ? (
                <PdfSplitTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-delete-pages' ? (
                <PdfDeletePagesTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-rotate' ? (
                <PdfRotateTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-watermark' ? (
                <PdfWatermarkTool onBack={handleBackToAllTools} />
              ) : activeTool.id === 'pdf-to-text' ? (
                <PdfToTextTool onBack={handleBackToAllTools} />
              ) : (
                <DedicatedToolPage
                  tool={activeTool}
                  allTools={TOOLS_DATA}
                  currentLang={currentLang}
                  onBack={handleBackToAllTools}
                  onSelectTool={handleSelectTool}
                  onSelectToolSlug={handleSelectToolBySlug}
                  onSelectBlogPost={(slug) => navigateTo(`/blog/${slug}`)}
                  initialFiles={droppedFiles}
                  onConsumeInitialFiles={() => setDroppedFiles([])}
                />
              )}
            </>
          )}

          {activeView === 'blog' && (
            <BlogHub
              key={`${currentLang}-blog-hub`}
              posts={PRE_SEEDED_BLOG_POSTS}
              currentLang={currentLang}
              onSelectPost={(slug) => navigateTo(`/blog/${slug}`)}
              onNavigateHome={handleBackToAllTools}
            />
          )}

          {activeView === 'blog-post' && activePost && (
            <BlogPostView
              key={`${currentLang}-blog-${activePost.slug}`}
              post={activePost}
              allPosts={PRE_SEEDED_BLOG_POSTS}
              currentLang={currentLang}
              onBackToBlog={() => navigateTo('/blog')}
              onSelectPost={(slug) => navigateTo(`/blog/${slug}`)}
              onSelectTool={handleSelectToolBySlug}
              onNavigatePath={navigateTo}
            />
          )}

          {activeView === 'company-page' && (
            <CompanyPages
              key={`${currentLang}-company-${companyPageType}`}
              pageType={companyPageType}
              onBackToHome={handleBackToAllTools}
              onSelectTool={handleSelectToolBySlug}
              onSelectPost={(slug) => navigateTo(`/blog/${slug}`)}
              onNavigateBlog={() => navigateTo('/blog')}
              onNavigateCompanyPage={(type) => navigateTo(`/${type}`)}
              onNavigatePath={navigateTo}
            />
          )}

          {activeView === 'methodology' && (
            <MethodologyFeedbackPage
              key={`${currentLang}-methodology`}
              onBackToHome={handleBackToAllTools}
              onNavigatePrivacyCenter={() => navigateTo('/privacy-center')}
            />
          )}

          {activeView === 'not-found' && (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
              <div className="text-4xl font-extrabold text-blue-600 dark:text-sky-400 font-mono">404</div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The page or tool link you opened does not exist on Mimage. Return to the full directory to launch any utility.
              </p>
              <button
                onClick={handleBackToAllTools}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Mimage Home</span>
              </button>
            </div>
          )}

          {activeView === 'home' && (
            <>
              <HeroSection
                currentLang={currentLang}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFileDropped={handleFileDropped}
                onSelectTool={handleSelectTool}
                onSelectToolSlug={handleSelectToolBySlug}
                allTools={TOOLS_DATA}
                onScrollToTools={scrollToTools}
              />

              <ToolsGrid
                tools={TOOLS_DATA}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                onSelectTool={handleSelectTool}
                onSelectToolSlug={handleSelectToolBySlug}
                currentLang={currentLang}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <HowToGuidesSection onSelectToolBySlug={handleSelectToolBySlug} currentLang={currentLang} />
            </>
          )}
        </main>

        <Footer
          onSelectTool={handleSelectTool}
          onSelectLang={handleSelectLang}
          onNavigateCompanyPage={(type) => navigateTo(`/${type}`)}
          onNavigateBlog={() => navigateTo('/blog')}
          onNavigateMethodology={() => navigateTo('/methodology')}
          currentLang={currentLang}
        />

        <MatrixArtStudio isOpen={showMatrixArtStudio} onClose={() => setShowMatrixArtStudio(false)} />

        <AutoDetectionModal
          files={droppedFiles}
          isOpen={showAutoDetectModal}
          onClose={() => setShowAutoDetectModal(false)}
          allTools={TOOLS_DATA}
          onSelectToolForFiles={handleSelectToolForFiles}
          currentLang={currentLang}
        />

        <LegalPagesModal
          pageType={legalModalType}
          onClose={() => setLegalModalType(null)}
          onSelectTool={handleSelectTool}
        />
      </div>
    </div>
  );
}
