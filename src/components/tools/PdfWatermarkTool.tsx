import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  Stamp,
  RefreshCw,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { watermarkPdfDocument, renderPdfThumbnails } from '../../services/pdfAdvancedEngine';

interface PdfWatermarkToolProps {
  onBack: () => void;
}

export const PdfWatermarkTool: React.FC<PdfWatermarkToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState<'red' | 'slate' | 'sky' | 'gray'>('red');
  const [opacity, setOpacity] = useState<number>(0.35);
  const [angle, setAngle] = useState<number>(-45);
  const [fontSize, setFontSize] = useState<number>(44);
  const [isWatermarking, setIsWatermarking] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 15, 0.8);
      setPages(rendered);
    } catch (e) {
      console.error(e);
      alert('Could not render PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsWatermarking(true);
    try {
      const watermarkedBlob = await watermarkPdfDocument(file, watermarkText, {
        color: watermarkColor,
        opacity,
        angle,
        fontSize
      });
      const url = URL.createObjectURL(watermarkedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-watermarked.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error('Watermark failed:', err);
      alert(`Could not watermark PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsWatermarking(false);
    }
  };

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
          <span>Private Client-Side PDF Watermarker</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Watermark PDF</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Custom Stamp
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Stamp diagonal or horizontal text watermarks (e.g., CONFIDENTIAL, DRAFT, SAMPLE) across every page of your
            PDF.
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
              <Stamp className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Select PDF document</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Click to browse or drag and drop file here</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Rendering pages for watermark preview...</p>
          </div>
        )}

        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            {/* Watermark Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-900/80 border border-sky-400/30 font-mono text-xs">
              <div className="space-y-2">
                <span className="text-slate-300 font-bold block">Watermark Text:</span>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <span className="text-slate-300 font-bold block">Color:</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'red', label: 'Crimson Red' },
                    { id: 'sky', label: 'Sky Blue' },
                    { id: 'slate', label: 'Dark Slate' },
                    { id: 'gray', label: 'Light Gray' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setWatermarkColor(c.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] cursor-pointer ${
                        watermarkColor === c.id
                          ? 'border-sky-400 bg-sky-500/20 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Opacity:</span>
                  <span className="text-white font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Angle:</span>
                  <span className="text-white font-bold">{angle}° ({angle === 0 ? 'Horizontal' : 'Diagonal'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAngle(-45)}
                    className={`flex-1 py-1 rounded border text-[11px] cursor-pointer ${
                      angle === -45 ? 'border-sky-400 bg-sky-500/20 text-white' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Diagonal (-45°)
                  </button>
                  <button
                    onClick={() => setAngle(0)}
                    className={`flex-1 py-1 rounded border text-[11px] cursor-pointer ${
                      angle === 0 ? 'border-sky-400 bg-sky-500/20 text-white' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Horizontal (0°)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="relative select-none border border-slate-700 bg-white max-w-sm overflow-hidden shadow-2xl">
                <img src={pages[0].dataUrl} alt="Watermark Preview" className="w-full h-auto block" />
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    opacity: opacity,
                    color: watermarkColor === 'red' ? '#dc2626' : watermarkColor === 'sky' ? '#0284c7' : '#475569'
                  }}
                >
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase border-4 border-current px-4 py-1">
                    {watermarkText || 'WATERMARK'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={isWatermarking || !watermarkText.trim()}
                onClick={handleExecuteWatermark}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                {isWatermarking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Watermark...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Watermarked PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
