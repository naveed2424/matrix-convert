import React, { useState } from 'react';
import { UploadCloud, Download, Archive, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { compressPdfInBrowser, formatFileSize } from '../../services/advancedToolsEngine';
import { ConvertedFile } from '../../types';

type PdfCompressMode = 'lossless-structure' | 'balanced-raster' | 'compact-raster';

export const PdfCompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfCompressMode>('balanced-raster');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<(ConvertedFile & { savedPercent: number }) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await compressPdfInBrowser(file, mode);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'PDF compression failed. Verify that the file is not password-encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Compression modes explained honestly:</strong> Structural mode preserves selectable vector text but yields minimal savings on already-optimized PDFs. Balanced (144 DPI) and Compact (96 DPI) modes dramatically reduce heavy image-scanned PDFs by rasterizing pages into compressed JPEG streams, which flattens selectable text.
        </p>
      </div>

      <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500 dark:hover:border-sky-400 p-8 text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              setResult(null);
              setErrorMsg(null);
            }
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Select a PDF document to compress'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Processed entirely in browser memory with zero remote uploads
        </p>
      </label>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {file && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Choose Optimization Mode
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'lossless-structure',
                title: 'Structural Stream (Lossless)',
                desc: 'Keeps crisp selectable text & vectors; strips unused object streams.'
              },
              {
                id: 'balanced-raster',
                title: 'Balanced Scan (144 DPI)',
                desc: 'Best balance for large scanned docs & image portfolios (flattens text).'
              },
              {
                id: 'compact-raster',
                title: 'Compact Email (96 DPI)',
                desc: 'Maximum payload reduction for strict portal upload caps (flattens text).'
              }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id as PdfCompressMode)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                  mode === opt.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-sky-950/40 dark:border-sky-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-blue-400'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleCompress}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing PDF...</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Compress PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {formatFileSize(result.originalSize)} → {formatFileSize(result.convertedSize)}{' '}
              <span
                className={`ml-2 text-xs font-semibold ${
                  result.savedPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {result.savedPercent > 0 ? `(-${result.savedPercent}% saved)` : '(No reduction achieved)'}
              </span>
            </div>
            {result.note && <p className="text-xs text-slate-600 dark:text-slate-400">{result.note}</p>}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Compressed PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
