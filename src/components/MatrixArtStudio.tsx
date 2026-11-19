import React, { useState, useRef } from 'react';
import { Terminal, UploadCloud, Download, X, Copy, Check, AlertCircle } from 'lucide-react';
import { generateMatrixAsciiArt } from '../services/converterEngine';
import { ConvertedFile } from '../types';

interface MatrixArtStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const MATRIX_CLASSIC_GREEN = '#00ff66';

export const MatrixArtStudio: React.FC<MatrixArtStudioProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<ConvertedFile | null>(null);
  const [asciiText, setAsciiText] = useState<string>('');
  const [density, setDensity] = useState(80);
  const [charSet, setCharSet] = useState<'katakana-binary' | 'ascii' | 'hex'>('katakana-binary');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processImage = async (
    file: File,
    d: number,
    cs: 'katakana-binary' | 'ascii' | 'hex'
  ) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const art = await generateMatrixAsciiArt(file, d, cs, MATRIX_CLASSIC_GREEN);
      setResultImage(art.renderedImage);
      setAsciiText(art.textArt);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not generate Matrix ASCII art from this image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processImage(file, density, charSet);
    }
  };

  const handleCopyText = () => {
    if (!asciiText) return;
    navigator.clipboard.writeText(asciiText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!resultImage) return;
    const url = URL.createObjectURL(resultImage.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resultImage.convertedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-studio-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#07110d] p-6 shadow-2xl text-left text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#00ff66]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="matrix-studio-title" className="text-lg font-bold text-white">
                Mimage Matrix ASCII Art Studio
              </h2>
              <span className="text-xs text-slate-400">
                Classic Matrix Green Glyph Renderer &amp; ASCII Text Generator
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Matrix Art Studio"
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 my-4 leading-relaxed">
          Convert any uploaded photo into classic glowing Matrix Green glyph art or copyable ASCII characters locally inside your browser.
        </p>

        {/* Input & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="sm:col-span-1 rounded-2xl border-2 border-dashed border-emerald-500/35 bg-[#050807] p-5 text-center cursor-pointer hover:border-[#00ff66] transition-all flex flex-col items-center justify-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-full">
              {selectedFile ? selectedFile.name : 'Choose Any Image'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              JPG, PNG, WebP, SVG
            </span>
          </div>

          <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-[#050807] border border-emerald-500/20 text-xs">
            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold">
                Character Palette
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'katakana-binary', label: 'Katakana + 01' },
                  { id: 'ascii', label: 'Classic ASCII' },
                  { id: 'hex', label: 'Hex 0x Glyphs' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCharSet(c.id as any);
                      if (selectedFile) processImage(selectedFile, density, c.id as any);
                    }}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-semibold transition-colors cursor-pointer border ${
                      charSet === c.id
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500/40'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                <span>Column Density</span>
                <span className="font-mono text-[#00ff66] tabular-nums">{density} cols</span>
              </div>
              <input
                type="range"
                min={40}
                max={120}
                step={10}
                value={density}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setDensity(val);
                  if (selectedFile) processImage(selectedFile, val, charSet);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-xs text-rose-300 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-8 text-center font-mono text-xs text-[#00ff66]">
            Rendering Matrix glyph canvas...
          </div>
        )}

        {resultImage && !isProcessing && (
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-emerald-500/25 bg-[#050807] overflow-hidden flex items-center justify-center p-4">
              <img
                src={resultImage.dataUrl}
                alt="Matrix Art Preview"
                className="max-h-80 max-w-full object-contain rounded"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#00ff66]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Raw ASCII Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Matrix PNG</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
