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

  // Sync with URL Hash for dedicated tool page URLs (e.g. #/tool/pdf-to-png)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tool/')) {
        const slug = hash.replace('#/tool/', '');
        const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
        if (found) {
          setActiveTool(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      if (hash === '' || hash === '#' || hash === '#/') {
        setActiveTool(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    window.location.hash = `#/tool/${tool.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllTools = () => {
    setActiveTool(null);
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

  const scrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050807] text-[#e0e6e3] relative selection:bg-sky-500/30 selection:text-sky-300">
      {/* Falling Matrix Digital Rain Canvas Background with glowing Katakana, numbers, and tool names */}
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

              {/* Step-by-Step How-To Guides (Light Sky Blue cards) */}
              <HowToGuidesSection
                onSelectToolBySlug={handleSelectToolBySlug}
                currentLang={currentLang}
              />
            </>
          )}
        </main>

        {/* Global Footer with Extensive Multi-Language Directory */}
        <Footer
          onSelectTool={handleSelectTool}
          onSelectLang={setCurrentLang}
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
      </div>
    </div>
  );
}
