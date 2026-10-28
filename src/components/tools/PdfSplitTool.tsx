import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  Scissors,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { extractPdfPages, renderPdfThumbnails } from '../../services/pdfAdvancedEngine';

interface PdfSplitToolProps {
  onBack: () => void;
}

export const PdfSplitTool: React.FC<PdfSplitToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('1-2');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 40, 0.7);
      setPages(rendered);
      setSelectedPages([1]);
      setRangeInput('1');
    } catch (e) {
      console.error(e);
      alert('Could not render PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedPages(pages.map((p) => p.pageNumber));
  };

  const selectNone = () => {
    setSelectedPages([]);
  };

  // Parse custom range e.g. "1, 3-5, 8"
  const applyRangeInput = (input: string) => {
    setRangeInput(input);
    const parts = input.split(',').map((p) => p.trim());
    const nums = new Set<number>();

    parts.forEach((part) => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= pages.length) nums.add(i);
          }
        }
      } else {
        const n = parseInt(part, 10);
        if (!isNaN(n) && n >= 1 && n <= pages.length) nums.add(n);
      }
    });

    if (nums.size > 0) {
      setSelectedPages(Array.from(nums).sort((a, b) => a - b));
    }
  };

  const handleExecuteExtract = async () => {
    if (!file || selectedPages.length === 0) {
      alert('Please select at least one page to extract.');
      return;
    }
    setIsExtracting(true);
    try {
      const extractedBlob = await extractPdfPages(file, selectedPages);
      const url = URL.createObjectURL(extractedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-extracted-pages-${selectedPages.join('_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error('Extract failed:', err);
      alert(`Could not extract pages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
          <span>Client-Side PDF Splitter & Page Extractor</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Split & Extract PDF Pages</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Visual Selector
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Extract individual pages, extract custom ranges, or separate multi-page documents entirely inside your
            browser.
          </p>
        </div>

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
            <h3 className="text-lg font-bold text-white mb-1">Upload PDF document</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Click to browse or drag and drop your file</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Rendering pages for visual selection...</p>
          </div>
        )}

        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-sky-400/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-200 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-200 cursor-pointer"
                >
                  Deselect All
                </button>
                <div className="flex items-center gap-2 pl-3 border-l border-slate-700 text-xs font-mono">
                  <span className="text-slate-400">Range:</span>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => applyRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-sky-300">
                  {selectedPages.length} of {pages.length} pages selected
                </span>
                <button
                  disabled={isExtracting || selectedPages.length === 0}
                  onClick={handleExecuteExtract}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Extract Selected ({selectedPages.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p) => {
                const isSelected = selectedPages.includes(p.pageNumber);
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => togglePage(p.pageNumber)}
                    className={`group relative p-2 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500/15 shadow-lg shadow-sky-500/10'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="relative bg-white rounded overflow-hidden mb-2">
                      <img src={p.dataUrl} alt={`Page ${p.pageNumber}`} className="w-full h-auto block" />
                      <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded bg-sky-500 text-white flex items-center justify-center shadow">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded bg-slate-900/80 border border-slate-600 flex items-center justify-center">
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="block text-center font-mono text-xs font-bold text-white">
                      Page {p.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
