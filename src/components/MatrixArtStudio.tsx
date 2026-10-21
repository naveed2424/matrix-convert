import React, { useState, useRef } from 'react';
import { Terminal, UploadCloud, Download, X, Copy, Check } from 'lucide-react';
import { generateMatrixAsciiArt } from '../services/converterEngine';
import { ConvertedFile } from '../types';

interface MatrixArtStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatrixArtStudio: React.FC<MatrixArtStudioProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<ConvertedFile | null>(null);
  const [asciiText, setAsciiText] = useState<string>('');
  const [density, setDensity] = useState(80);
  const [charSet, setCharSet] = useState<'katakana-binary' | 'ascii' | 'hex'>('katakana-binary');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processImage(file, density, charSet);
    }
  };

  const processImage = async (
    file: File,
    d: number,
    cs: 'katakana-binary' | 'ascii' | 'hex'
  ) => {
    setIsProcessing(true);
    try {
      const art = await generateMatrixAsciiArt(file, d, cs);
      setResultImage(art.renderedImage);
      setAsciiText(art.textArt);
    } catch (err) {
      console.error('Matrix Art creation error:', err);
    } finally {
      setIsProcessing(false);
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
    try {
      const url = URL.createObjectURL(resultImage.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resultImage.convertedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error('Download error:', err);
      window.open(resultImage.dataUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-sky-400 bg-[#f0f9ff] p-6 shadow-2xl text-left text-slate-900 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Matrix Rain Code Art Studio
              </h2>
              <span className="text-xs text-sky-700 font-semibold">
                Client-Side Digital Phosphor Engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 my-4 leading-relaxed font-sans font-medium">
          Transform any photo, portrait, or logo into an authentic Matrix green digital rain stream with glowing Katakana glyphs, binary 01, and hexadecimal coordinates.
        </p>

        {/* Input & Controls in Light Sky Blue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="sm:col-span-1 rounded-2xl border-2 border-dashed border-sky-400 bg-white p-5 text-center cursor-pointer hover:border-sky-600 hover:bg-sky-50 transition-all flex flex-col items-center justify-center shadow-sm"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center mb-2 shadow">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {selectedFile ? selectedFile.name : 'Choose Any Picture'}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              JPG, PNG, WebP, SVG
            </span>
          </div>

          <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-sky-100/70 border border-sky-300 text-xs text-slate-800">
            <div>
              <label className="text-slate-800 block mb-1.5 font-bold">Character Palette:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'katakana-binary', label: 'Matrix Katakana + 01' },
                  { id: 'ascii', label: 'Classic ASCII' },
                  { id: 'hex', label: 'Hex 0x Coordinates' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCharSet(c.id as any);
                      if (selectedFile) processImage(selectedFile, density, c.id as any);
                    }}
                    className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold transition-colors cursor-pointer ${
                      charSet === c.id
                        ? 'bg-sky-600 text-white shadow'
                        : 'bg-white text-slate-700 hover:bg-sky-200 border border-sky-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-800 mb-1 font-bold">
                <span>Resolution / Column Density:</span>
                <span className="text-sky-700">{density} columns</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="10"
                value={density}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDensity(val);
                  if (selectedFile) processImage(selectedFile, val, charSet);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-8 text-center font-mono text-sm text-sky-800 font-bold animate-pulse">
            Synthesizing glowing Matrix neural stream...
          </div>
        )}

        {/* Output Previews */}
        {resultImage && !isProcessing && (
          <div className="space-y-4">
            <div className="relative rounded-2xl border-2 border-slate-900 bg-[#050807] overflow-hidden flex items-center justify-center p-4 shadow-xl">
              <img
                src={resultImage.dataUrl}
                alt="Matrix Art Preview"
                className="max-h-80 max-w-full object-contain rounded border border-[#00ff66]/30 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-sky-300 bg-white font-mono text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw ASCII Text'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 font-mono text-xs font-bold text-white hover:from-sky-600 hover:to-blue-700 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Matrix HD Wallpaper (.PNG)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
