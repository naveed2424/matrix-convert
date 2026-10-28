import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { extractPdfText } from '../../services/pdfAdvancedEngine';

interface PdfToTextToolProps {
  onBack: () => void;
}

export const PdfToTextTool: React.FC<PdfToTextToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const { fullText } = await extractPdfText(selectedFile);
      setExtractedText(fullText);
    } catch (e: any) {
      console.error(e);
      alert(`Could not extract text: ${e.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'extracted-text';
    link.download = `${baseName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
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
          <span>Client-Side PDF Text Extractor</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>PDF to Text</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Instant Extract
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Extract all text, paragraphs, and formatted lines from any PDF document into clean plain text or copy
            directly.
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
              <FileText className="w-8 h-8 text-sky-400" />
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
            <p className="text-sm font-mono text-sky-300">Extracting text layers from PDF...</p>
          </div>
        )}

        {file && !isLoading && extractedText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-slate-300">
              <span>Extracted {extractedText.length.toLocaleString()} characters:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={downloadTxt}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={extractedText}
              rows={14}
              className="w-full p-4 rounded-xl border border-sky-400/30 bg-slate-950/90 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-400 select-all"
            />
          </div>
        )}
      </div>
    </div>
  );
};
