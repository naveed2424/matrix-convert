import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  RotateCw,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { rotatePdfPages, renderPdfThumbnails } from '../../services/pdfAdvancedEngine';

interface PdfRotateToolProps {
  onBack: () => void;
}

export const PdfRotateTool: React.FC<PdfRotateToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRotating, setIsRotating] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 30, 0.9);
      setPages(rendered);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      alert('Could not render PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteRotate = async () => {
    if (!file) return;
    setIsRotating(true);
    try {
      const rotatedBlob = await rotatePdfPages(file, rotationAngle, applyToAll, currentPage);
      const url = URL.createObjectURL(rotatedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-rotated-${rotationAngle}deg.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error('Rotate failed:', err);
      alert(`Could not rotate PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRotating(false);
    }
  };

  const activePageData = pages.find((p) => p.pageNumber === currentPage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
          <span>100% Client-Side PDF Orientation Fix</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Rotate PDF Pages</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              90° / 180° / 270°
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Permanently straighten upside-down scans and sideways documents without losing original resolution or text
            layers.
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
              <RotateCw className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Select PDF document to rotate</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Click to browse or drag and drop file here</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Rendering pages for orientation preview...</p>
          </div>
        )}

        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-sky-400/30">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setRotationAngle(90)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer ${
                    rotationAngle === 90 ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90° Clockwise</span>
                </button>
                <button
                  onClick={() => setRotationAngle(180)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer ${
                    rotationAngle === 180 ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>180° Flip</span>
                </button>
                <button
                  onClick={() => setRotationAngle(270)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer ${
                    rotationAngle === 270 ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>270° Counter-CW</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 font-mono text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={(e) => setApplyToAll(e.target.checked)}
                    className="accent-sky-400"
                  />
                  <span>Apply to all pages</span>
                </label>

                <button
                  disabled={isRotating}
                  onClick={handleExecuteRotate}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  {isRotating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Rotating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Rotated PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="relative select-none border border-slate-700 bg-white max-w-sm transition-transform duration-300"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                {activePageData && (
                  <img src={activePageData.dataUrl} alt={`Page ${currentPage}`} className="w-full h-auto block" />
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-6 text-center">
                Preview of Page {currentPage} at +{rotationAngle}° rotation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
