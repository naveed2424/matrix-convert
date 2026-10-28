import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  Undo
} from 'lucide-react';
import { deletePdfPages, renderPdfThumbnails } from '../../services/pdfAdvancedEngine';

interface PdfDeletePagesToolProps {
  onBack: () => void;
}

export const PdfDeletePagesTool: React.FC<PdfDeletePagesToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setPagesToDelete([]);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 40, 0.7);
      setPages(rendered);
    } catch (e) {
      console.error(e);
      alert('Could not render PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDelete = (pageNumber: number) => {
    setPagesToDelete((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
  };

  const handleExecuteDelete = async () => {
    if (!file || pagesToDelete.length === 0) {
      alert('Please click on at least one page to delete.');
      return;
    }
    if (pagesToDelete.length === pages.length) {
      alert('You cannot delete every page in the document. At least one page must remain.');
      return;
    }

    setIsProcessing(true);
    try {
      const cleanedBlob = await deletePdfPages(file, pagesToDelete);
      const url = URL.createObjectURL(cleanedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-cleaned.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Could not delete pages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
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
          <span>Private Client-Side Page Deletion</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Delete PDF Pages</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-400/30">
              One-Click Remove
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Click any page thumbnail to mark it for deletion. Remove unwanted cover sheets, blank pages, or outdated
            sections in seconds.
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
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-400/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Upload PDF document</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Click to select or drag and drop file here</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Rendering pages for deletion review...</p>
          </div>
        )}

        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-sky-400/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  {pagesToDelete.length} of {pages.length} pages marked for deletion
                </span>
                {pagesToDelete.length > 0 && (
                  <button
                    onClick={() => setPagesToDelete([])}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Undo className="w-3 h-3" />
                    <span>Reset / Keep All</span>
                  </button>
                )}
              </div>

              <button
                disabled={isProcessing || pagesToDelete.length === 0}
                onClick={handleExecuteDelete}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing Pages...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Cleaned PDF ({pages.length - pagesToDelete.length} pages)</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p) => {
                const isMarked = pagesToDelete.includes(p.pageNumber);
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => toggleDelete(p.pageNumber)}
                    className={`relative p-2 rounded-xl border transition-all text-left cursor-pointer ${
                      isMarked
                        ? 'border-red-500/80 bg-red-500/20 shadow-lg shadow-red-500/10'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative bg-white rounded overflow-hidden mb-2">
                      <img src={p.dataUrl} alt={`Page ${p.pageNumber}`} className="w-full h-auto block" />
                      {isMarked ? (
                        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                          <Trash2 className="w-6 h-6 text-red-400 mb-1" />
                          <span className="text-[10px] font-mono font-bold text-red-300 uppercase">
                            Will Be Deleted
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-500 text-slate-300 hover:text-white flex items-center justify-center shadow transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <span className="block text-center font-mono text-xs text-slate-300">
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
