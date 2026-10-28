import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  Crop as CropIcon,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle,
  Scissors
} from 'lucide-react';
import { cropPdfMargins, renderPdfThumbnails, detectCanvasWhiteMargins } from '../../services/pdfAdvancedEngine';

interface PdfCropToolProps {
  onBack: () => void;
}

export const PdfCropTool: React.FC<PdfCropToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Margin percentages (0 - 45%)
  const [margins, setMargins] = useState<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  });

  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState<boolean>(false);

  // Handle PDF select
  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 30, 1.2);
      setPages(rendered);
      setCurrentPage(1);

      // Default smart margin
      setMargins({ top: 5, right: 5, bottom: 5, left: 5 });
    } catch (e) {
      console.error(e);
      alert('Could not render PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-detect white margins on current page canvas
  const handleAutoTrimWhiteMargins = () => {
    const activePage = pages.find((p) => p.pageNumber === currentPage);
    if (!activePage) return;

    setIsAutoDetecting(true);
    const img = new Image();
    img.src = activePage.dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const detected = detectCanvasWhiteMargins(canvas);
        setMargins(detected);
      }
      setIsAutoDetecting(false);
    };
  };

  // Preset quick margins
  const applyPreset = (preset: 'zero' | 'light' | 'moderate' | 'aggressive') => {
    switch (preset) {
      case 'zero':
        setMargins({ top: 0, right: 0, bottom: 0, left: 0 });
        break;
      case 'light':
        setMargins({ top: 3, right: 3, bottom: 3, left: 3 });
        break;
      case 'moderate':
        setMargins({ top: 6, right: 6, bottom: 6, left: 6 });
        break;
      case 'aggressive':
        setMargins({ top: 12, right: 12, bottom: 12, left: 12 });
        break;
    }
  };

  // Execute Crop and Download
  const handleExecuteCrop = async () => {
    if (!file) return;
    setIsCropping(true);
    try {
      const croppedBlob = await cropPdfMargins(file, margins, applyToAll, currentPage);
      const url = URL.createObjectURL(croppedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-cropped.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error('Crop failed:', err);
      alert(`Crop failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCropping(false);
    }
  };

  const activePageData = pages.find((p) => p.pageNumber === currentPage);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-mono text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 border border-sky-400/30 text-sky-300">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Lossless Client-Side PDF Margin Trimmer</span>
        </span>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Crop PDF Margins</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Auto-Trim
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Trim unnecessary white space, standardize page dimensions, or cut out printer margins from multi-page
            PDFs with instant browser-based processing.
          </p>
        </div>

        {/* Upload State */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-sky-400/40 hover:border-sky-300 rounded-2xl p-12 text-center bg-sky-950/20 transition-all cursor-pointer group"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/pdf';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files?.[0]) handleFile(target.files[0]);
              };
              input.click();
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Scissors className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Upload PDF file to crop</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">or drag and drop your document here</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF Document
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Scanning and rendering PDF pages...</p>
          </div>
        )}

        {/* Crop Studio Workspace */}
        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-sky-400/30">
              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAutoTrimWhiteMargins}
                  disabled={isAutoDetecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAutoDetecting ? 'Detecting...' : '⚡ Auto-Trim White Margins'}</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="px-2 text-slate-400">Presets:</span>
                  <button onClick={() => applyPreset('light')} className="px-2 py-1 rounded hover:bg-slate-800 cursor-pointer">Light (3%)</button>
                  <button onClick={() => applyPreset('moderate')} className="px-2 py-1 rounded hover:bg-slate-800 cursor-pointer">Medium (6%)</button>
                  <button onClick={() => applyPreset('aggressive')} className="px-2 py-1 rounded hover:bg-slate-800 cursor-pointer">Tight (12%)</button>
                  <button onClick={() => applyPreset('zero')} className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer">Reset (0%)</button>
                </div>
              </div>

              {/* Page Selector & Execution */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-sky-400/30 disabled:opacity-40 hover:bg-sky-500/20 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-white">
                    {currentPage} / {pages.length}
                  </span>
                  <button
                    disabled={currentPage >= pages.length}
                    onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                    className="p-1.5 rounded-lg border border-sky-400/30 disabled:opacity-40 hover:bg-sky-500/20 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  disabled={isCropping}
                  onClick={handleExecuteCrop}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  {isCropping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cropping PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Crop PDF & Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split View: Margin Sliders & Visual Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Numeric Sliders */}
              <div className="space-y-4 rounded-xl border border-sky-400/20 bg-slate-900/60 p-5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Margin Trim Controls</span>
                  </span>
                  <span className="text-sky-400">Values in %</span>
                </div>

                {/* Top Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Top Margin:</span>
                    <span className="text-white font-bold">{margins.top}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={margins.top}
                    onChange={(e) => setMargins({ ...margins, top: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>

                {/* Bottom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Bottom Margin:</span>
                    <span className="text-white font-bold">{margins.bottom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={margins.bottom}
                    onChange={(e) => setMargins({ ...margins, bottom: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>

                {/* Left Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Left Margin:</span>
                    <span className="text-white font-bold">{margins.left}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={margins.left}
                    onChange={(e) => setMargins({ ...margins, left: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>

                {/* Right Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Right Margin:</span>
                    <span className="text-white font-bold">{margins.right}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={margins.right}
                    onChange={(e) => setMargins({ ...margins, right: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>

                {/* Scope Selection */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-slate-400 block uppercase text-[10px]">Crop Scope</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={applyToAll}
                      onChange={() => setApplyToAll(true)}
                      className="accent-sky-400"
                    />
                    <span className="text-white">Apply to All {pages.length} Pages</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={!applyToAll}
                      onChange={() => setApplyToAll(false)}
                      className="accent-sky-400"
                    />
                    <span className="text-white">Apply Only to Current Page ({currentPage})</span>
                  </label>
                </div>
              </div>

              {/* Right Column: Visual Interactive Crop Preview */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                <div className="relative select-none shadow-2xl border border-slate-700 bg-white max-w-full">
                  {activePageData && (
                    <img
                      src={activePageData.dataUrl}
                      alt={`Page ${currentPage}`}
                      className="w-full h-auto block pointer-events-none"
                    />
                  )}

                  {/* Shaded Mask: Top */}
                  <div
                    style={{ height: `${margins.top}%` }}
                    className="absolute top-0 left-0 right-0 bg-red-500/25 border-b-2 border-red-400 backdrop-grayscale"
                  />
                  {/* Shaded Mask: Bottom */}
                  <div
                    style={{ height: `${margins.bottom}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-red-500/25 border-t-2 border-red-400 backdrop-grayscale"
                  />
                  {/* Shaded Mask: Left */}
                  <div
                    style={{
                      top: `${margins.top}%`,
                      bottom: `${margins.bottom}%`,
                      width: `${margins.left}%`
                    }}
                    className="absolute left-0 bg-red-500/25 border-r-2 border-red-400 backdrop-grayscale"
                  />
                  {/* Shaded Mask: Right */}
                  <div
                    style={{
                      top: `${margins.top}%`,
                      bottom: `${margins.bottom}%`,
                      width: `${margins.right}%`
                    }}
                    className="absolute right-0 bg-red-500/25 border-l-2 border-red-400 backdrop-grayscale"
                  />

                  {/* Active Crop Box Indicator */}
                  <div
                    style={{
                      top: `${margins.top}%`,
                      bottom: `${margins.bottom}%`,
                      left: `${margins.left}%`,
                      right: `${margins.right}%`
                    }}
                    className="absolute border-2 border-dashed border-emerald-400 pointer-events-none"
                  >
                    <span className="absolute -top-6 left-1 bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shadow">
                      Preserved Content Area
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
                  Red shaded areas will be trimmed away. The central boxed area will be preserved in the final PDF.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
