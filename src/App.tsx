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
import { Footer } from './components/Footer';
import { TOOLS_DATA } from './data/toolsData';
import { ToolDefinition } from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [showMatrixArtStudio, setShowMatrixArtStudio] = useState<boolean>(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showAutoDetectModal, setShowAutoDetectModal] = useState<boolean>(false);
  const [legalPageType, setLegalPageType] = useState<LegalPageType | null>(null);

  // Sync with URL Hash for dedicated tool page URLs and compliance pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tool/')) {
        const slug = hash.replace('#/tool/', '');
        const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
        if (found) {
          setActiveTool(found);
          setLegalPageType(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else if (
        hash === '#/privacy' ||
        hash === '#/terms' ||
        hash === '#/about' ||
        hash === '#/contact' ||
        hash === '#/sitemap'
      ) {
        const pType = hash.replace('#/', '') as LegalPageType;
        setLegalPageType(pType);
        return;
      }

      if (hash === '' || hash === '#' || hash === '#/') {
        setActiveTool(null);
        setLegalPageType(null);
      }

      // Track pageview in Google Analytics G-HLZBZ86RYL
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('config', 'G-HLZBZ86RYL', {
          page_path: window.location.hash || '/'
        });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    setLegalPageType(null);
    window.location.hash = `#/tool/${tool.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllTools = () => {
    setActiveTool(null);
    setLegalPageType(null);
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectToolBySlug = (slug: string) => {
    const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
    if (found) {
      handleSelectTool(found);
    }
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
    setLegalPageType(type);
    window.location.hash = `#/${type}`;
  };

  const handleCloseLegalPage = () => {
    setLegalPageType(null);
    if (activeTool) {
      window.location.hash = `#/tool/${activeTool.slug}`;
    } else {
      window.location.hash = '#/';
    }
  };

  const scrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050807] text-[#e0e6e3] relative selection:bg-sky-500/30 selection:text-sky-300">
      {/* Falling Matrix Digital Rain Canvas Background */}
      <MatrixBackground opacity={0.25} speedMultiplier={1.0} />

      {/* Main Content Wrap */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Smart International Banner */}
        <LanguageBanner currentLang={currentLang} onSelectLang={setCurrentLang} />

        {/* Top Navigation Bar adhering to 3-zone design constitution */}
        <Navbar
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onNavigateHome={handleBackToAllTools}
          onNavigateCategory={(catId) => {
            setActiveCategory(catId);
            if (activeTool) handleBackToAllTools();
            setTimeout(scrollToTools, 100);
          }}
          onOpenMatrixArt={() => setShowMatrixArtStudio(true)}
        />

        {/* Dynamic Route: Dedicated Tool Page vs Directory Overview */}
        <main className="flex-1">
          {activeTool ? (
            <DedicatedToolPage
              tool={activeTool}
              allTools={TOOLS_DATA}
              currentLang={currentLang}
              onBack={handleBackToAllTools}
              onSelectTool={handleSelectTool}
            />
          ) : (
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

        {/* Global Footer with AdSense & Legal Links */}
        <Footer
          onSelectTool={handleSelectTool}
          onSelectLang={setCurrentLang}
          onOpenLegalPage={handleOpenLegalPage}
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

        {/* Google AdSense Compliance Modal (Privacy, Terms, About, Contact, Sitemap) */}
        <LegalPagesModal
          pageType={legalPageType}
          onClose={handleCloseLegalPage}
          onSelectTool={handleSelectTool}
        />
      </div>
    </div>
  );
}
