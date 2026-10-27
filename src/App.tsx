/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { UgcPromoVideo } from './components/UgcPromoVideo';
import { BlogHub } from './components/BlogHub';
import { BlogPostView } from './components/BlogPostView';
import { BlogStudio } from './components/BlogStudio';
import { Footer } from './components/Footer';
import { TOOLS_DATA } from './data/toolsData';
import { PRE_SEEDED_BLOG_POSTS, BlogPost } from './data/blogData';
import { ToolDefinition } from './types';

export type AppView =
  | 'home'
  | 'tool'
  | 'ugc-video'
  | 'blog'
  | 'blog-post'
  | 'blog-studio'
  | 'company-page';

export default function App() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [showMatrixArtStudio, setShowMatrixArtStudio] = useState<boolean>(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showAutoDetectModal, setShowAutoDetectModal] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalPageType | null>(null);

  // Dynamic View & Blog state
  const [activeView, setActiveView] = useState<AppView>('home');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(PRE_SEEDED_BLOG_POSTS);
  const [activePostSlug, setActivePostSlug] = useState<string | null>(null);
  const [companyPageType, setCompanyPageType] = useState<CompanyPageType>('about');

  // Synchronize routing state with URL Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash.startsWith('#/tool/')) {
        const slug = hash.replace('#/tool/', '');
        const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
        if (found) {
          setActiveTool(found);
          setActiveView('tool');
          setLegalModalType(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          trackPageView(hash);
          return;
        }
      } else if (hash.startsWith('#/blog/')) {
        const slug = hash.replace('#/blog/', '');
        setActivePostSlug(slug);
        setActiveView('blog-post');
        setActiveTool(null);
        setLegalModalType(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(hash);
        return;
      } else if (hash === '#/blog' || hash === '#/articles') {
        setActiveView('blog');
        setActiveTool(null);
        setActivePostSlug(null);
        setLegalModalType(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(hash);
        return;
      } else if (hash === '#/blog-studio' || hash === '#/studio' || hash === '#/seo-studio') {
        setActiveView('blog-studio');
        setActiveTool(null);
        setLegalModalType(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(hash);
        return;
      } else if (hash === '#/ugc-video' || hash === '#/promo-video' || hash === '#/video') {
        setActiveView('ugc-video');
        setActiveTool(null);
        setLegalModalType(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(hash);
        return;
      } else if (
        hash === '#/about' ||
        hash === '#/terms' ||
        hash === '#/disclaimer' ||
        hash === '#/privacy' ||
        hash === '#/contact' ||
        hash === '#/sitemap'
      ) {
        const pType = hash.replace('#/', '') as CompanyPageType;
        setCompanyPageType(pType);
        setActiveView('company-page');
        setActiveTool(null);
        setLegalModalType(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(hash);
        return;
      }

      if (hash === '' || hash === '#' || hash === '#/') {
        setActiveView('home');
        setActiveTool(null);
        setActivePostSlug(null);
        setLegalModalType(null);
        trackPageView('/');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const trackPageView = (path: string) => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-HLZBZ86RYL', {
        page_path: path
      });
    }
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    setActiveView('tool');
    window.location.hash = `#/tool/${tool.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectToolBySlug = (slug: string) => {
    const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
    if (found) {
      handleSelectTool(found);
    }
  };

  const handleBackToAllTools = () => {
    setActiveTool(null);
    setActiveView('home');
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileDropped = (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    setDroppedFiles(fileArray);
    setShowAutoDetectModal(true);
  };

  const handleSelectToolForFiles = (tool: ToolDefinition, files: File[]) => {
    setShowAutoDetectModal(false);
    handleSelectTool(tool);
  };

  const handleOpenLegalPage = (type: LegalPageType) => {
    setCompanyPageType(type as CompanyPageType);
    setActiveView('company-page');
    window.location.hash = `#/${type}`;
  };

  const handlePublishNewArticle = (newPost: BlogPost) => {
    setBlogPosts((prev) => [newPost, ...prev]);
  };

  const scrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activePost = activePostSlug ? blogPosts.find((p) => p.slug === activePostSlug) || blogPosts[0] : null;

  return (
    <div className="min-h-screen bg-[#050807] text-[#e0e6e3] relative selection:bg-sky-500/30 selection:text-sky-300">
      {/* Falling Matrix Digital Rain Background */}
      <MatrixBackground opacity={0.25} speedMultiplier={1.0} />

      {/* Main Content Wrap */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Smart International Banner */}
        <LanguageBanner currentLang={currentLang} onSelectLang={setCurrentLang} />

        {/* Top Navbar */}
        <Navbar
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onNavigateHome={handleBackToAllTools}
          onNavigateCategory={(catId) => {
            setActiveCategory(catId);
            if (activeView !== 'home') {
              handleBackToAllTools();
            }
            setTimeout(scrollToTools, 100);
          }}
          onOpenMatrixArt={() => setShowMatrixArtStudio(true)}
          onNavigateUgcVideo={() => {
            window.location.hash = '#/ugc-video';
          }}
          onNavigateBlog={() => {
            window.location.hash = '#/blog';
          }}
          onNavigateStudio={() => {
            window.location.hash = '#/blog-studio';
          }}
          onNavigateAbout={() => {
            window.location.hash = '#/about';
          }}
        />

        {/* Dynamic Route View */}
        <main className="flex-1">
          {/* View 1: Dedicated Converter Tool Page */}
          {activeView === 'tool' && activeTool && (
            <DedicatedToolPage
              tool={activeTool}
              allTools={TOOLS_DATA}
              currentLang={currentLang}
              onBack={handleBackToAllTools}
              onSelectTool={handleSelectTool}
            />
          )}

          {/* View 2: UGC Promotional Video Studio */}
          {activeView === 'ugc-video' && (
            <UgcPromoVideo onBackToApp={handleBackToAllTools} />
          )}

          {/* View 3: Blog Hub */}
          {activeView === 'blog' && (
            <BlogHub
              posts={blogPosts}
              onSelectPost={(slug) => {
                window.location.hash = `#/blog/${slug}`;
              }}
              onOpenStudio={() => {
                window.location.hash = '#/blog-studio';
              }}
              onSelectTool={handleSelectToolBySlug}
            />
          )}

          {/* View 4: Full Blog Post View */}
          {activeView === 'blog-post' && activePost && (
            <BlogPostView
              post={activePost}
              allPosts={blogPosts}
              onBackToBlog={() => {
                window.location.hash = '#/blog';
              }}
              onSelectPost={(slug) => {
                window.location.hash = `#/blog/${slug}`;
              }}
              onSelectTool={handleSelectToolBySlug}
              onOpenStudio={() => {
                window.location.hash = '#/blog-studio';
              }}
            />
          )}

          {/* View 5: Daily Trending SEO Blog Studio */}
          {activeView === 'blog-studio' && (
            <BlogStudio
              onPublishArticle={handlePublishNewArticle}
              onNavigateToPost={(slug) => {
                window.location.hash = `#/blog/${slug}`;
              }}
              onBackToBlog={() => {
                window.location.hash = '#/blog';
              }}
            />
          )}

          {/* View 6: Dedicated Company & Legal Pages (About, Terms, Privacy, Disclaimer, Contact, Sitemap) */}
          {activeView === 'company-page' && (
            <CompanyPages
              pageType={companyPageType}
              onBackToHome={handleBackToAllTools}
              onSelectTool={handleSelectToolBySlug}
            />
          )}

          {/* View 7: Home View (Hero + Tools Grid + How-To Guides) */}
          {activeView === 'home' && (
            <>
              {/* Terminal Hero Section */}
              <HeroSection
                currentLang={currentLang}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFileDropped={handleFileDropped}
                onSelectTool={handleSelectTool}
                allTools={TOOLS_DATA}
                onScrollToTools={scrollToTools}
              />

              {/* Categorized Tools Directory Grid with Light Sky Blue Cards */}
              <ToolsGrid
                tools={TOOLS_DATA}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                onSelectTool={handleSelectTool}
                currentLang={currentLang}
              />

              {/* Step-by-Step How-To Guides */}
              <HowToGuidesSection
                onSelectToolBySlug={handleSelectToolBySlug}
                currentLang={currentLang}
              />
            </>
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onSelectTool={handleSelectTool}
          onSelectLang={setCurrentLang}
          onOpenLegalPage={handleOpenLegalPage}
          onNavigateUgcVideo={() => {
            window.location.hash = '#/ugc-video';
          }}
          onNavigateBlog={() => {
            window.location.hash = '#/blog';
          }}
          onNavigateStudio={() => {
            window.location.hash = '#/blog-studio';
          }}
          currentLang={currentLang}
        />

        {/* Matrix Art Studio Modal */}
        <MatrixArtStudio
          isOpen={showMatrixArtStudio}
          onClose={() => setShowMatrixArtStudio(false)}
        />

        {/* Auto-Detection Modal for Dropped Files */}
        <AutoDetectionModal
          files={droppedFiles}
          isOpen={showAutoDetectModal}
          onClose={() => setShowAutoDetectModal(false)}
          allTools={TOOLS_DATA}
          onSelectToolForFiles={handleSelectToolForFiles}
          currentLang={currentLang}
        />

        {/* Modal for Legal Pages if requested */}
        <LegalPagesModal
          pageType={legalModalType}
          onClose={() => setLegalModalType(null)}
          onSelectTool={handleSelectTool}
        />
      </div>
    </div>
  );
}
