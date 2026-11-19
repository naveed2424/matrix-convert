import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Trash2,
  Undo2,
  RefreshCw,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { renderPdfThumbnails } from '../../services/pdfAdvancedEngine';
import { formatFileSize } from '../../services/advancedToolsEngine';

interface PageItem {
  originalPageNumber: number;
  dataUrl: string;
  rotation: number;
  deleted: boolean;
}

export const PdfOrganizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoadPdf = async (f: File) => {
    setFile(f);
    setIsLoading(true);
    setErrorMsg(null);
    setPages([]);
    try {
      const thumbs = await renderPdfThumbnails(f, 40, 0.45);
      setPages(
        thumbs.map((t) => ({
          originalPageNumber: t.pageNumber,
          dataUrl: t.dataUrl,
          rotation: 0,
          deleted: false
        }))
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not render PDF pages. Verify the document is valid and unencrypted.');
    } finally {
      setIsLoading(false);
    }
  };

  const movePage = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const rotatePage = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const toggleDelete = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, deleted: !p.deleted } : p))
    );
  };

  const reverseAll = () => {
    setPages((prev) => [...prev].reverse());
  };

  const resetAll = () => {
    setPages((prev) =>
      [...prev]
        .sort((a, b) => a.originalPageNumber - b.originalPageNumber)
        .map((p) => ({ ...p, rotation: 0, deleted: false }))
    );
  };

  const activeCount = pages.filter((p) => !p.deleted).length;

  const handleExportPdf = async () => {
    if (!file || activeCount === 0) return;
    setIsExporting(true);
    setErrorMsg(null);
    try {
      const sourceBytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(sourceBytes);
      const outDoc = await PDFDocument.create();

      const kept = pages.filter((p) => !p.deleted);
      const indices = kept.map((p) => p.originalPageNumber - 1);
      const copied = await outDoc.copyPages(srcDoc, indices);

      copied.forEach((copiedPage, idx) => {
        const addedRot = kept[idx].rotation;
        if (addedRot !== 0) {
          const existing = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((existing + addedRot) % 360));
        }
        outDoc.addPage(copiedPage);
      });

      const bytes = await outDoc.save();
      const safeBuf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([safeBuf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}-organized.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to rebuild organized PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500 dark:hover:border-sky-400 p-8 text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleLoadPdf(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Select a PDF document to reorder, rotate, or delete pages'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visual thumbnail preview up to 40 pages · Rebuilt losslessly in your browser
        </p>
      </label>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="w-7 h-7 text-blue-600 dark:text-sky-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Rendering page thumbnails locally...</p>
        </div>
      )}

      {pages.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums mr-2">
                {activeCount} of {pages.length} pages kept
              </span>
              <button
                type="button"
                onClick={reverseAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Reverse Order</span>
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>

            <button
              type="button"
              disabled={isExporting || activeCount === 0}
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Organized PDF ({activeCount})</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((p, idx) => (
              <div
                key={`${p.originalPageNumber}-${idx}`}
                className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  p.deleted
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/20 opacity-65'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="relative aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-2">
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.originalPageNumber}`}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                  />
                  {p.deleted && (
                    <div className="absolute inset-0 bg-rose-950/70 flex items-center justify-center text-white text-[11px] font-bold uppercase">
                      Removed
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <span>#{idx + 1} (Src p.{p.originalPageNumber})</span>
                    {p.rotation > 0 && <span className="text-blue-600 dark:text-sky-400">{p.rotation}°</span>}
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePage(idx, -1)}
                      title="Move Left"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => movePage(idx, 1)}
                      title="Move Right"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rotatePage(idx)}
                      title="Rotate +90°"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-sky-400 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDelete(idx)}
                      title={p.deleted ? 'Restore page' : 'Delete page'}
                      className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer ${
                        p.deleted
                          ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      }`}
                    >
                      {p.deleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
