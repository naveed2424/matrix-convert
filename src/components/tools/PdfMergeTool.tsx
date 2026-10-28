import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  FileCheck,
  Plus
} from 'lucide-react';
import { mergePdfDocuments } from '../../services/pdfAdvancedEngine';

interface PdfMergeToolProps {
  onBack: () => void;
}

export const PdfMergeTool: React.FC<PdfMergeToolProps> = ({ onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleAddFiles = (newFiles: FileList) => {
    const valid = Array.from(newFiles).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    setFiles((prev) => [...prev, ...valid]);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= files.length) return;
    const copy = [...files];
    const [removed] = copy.splice(index, 1);
    copy.splice(newIdx, 0, removed);
    setFiles(copy);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleExecuteMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsMerging(true);
    try {
      const mergedBlob = await mergePdfDocuments(files);
      const url = URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged-document-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err: any) {
      console.error(err);
      alert(`Could not merge PDFs: ${err.message || 'Unknown error'}`);
    } finally {
      setIsMerging(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
          <span>100% Client-Side PDF Merger</span>
        </span>
      </div>

      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Merge PDF Files</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Unlimited
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Combine multiple PDF files in any order you want. Fast, completely private, and free without any file
            limits.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-sky-400/40 hover:border-sky-300 rounded-2xl p-8 text-center bg-sky-950/20 transition-all cursor-pointer group mb-6"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf';
            input.multiple = true;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) handleAddFiles(target.files);
            };
            input.click();
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Click to select PDF files</h3>
          <p className="text-xs text-slate-400 font-mono">or drag and drop multiple PDF files here</p>
        </div>

        {/* File Queue List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-slate-300 px-1">
              <span>Selected PDFs ({files.length} files) — Drag or use arrows to reorder:</span>
              <button
                onClick={() => setFiles([])}
                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-sky-400/20 bg-slate-900/60 font-mono text-xs text-white"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="truncate font-bold">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveFile(idx, 'up')}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button
                      disabled={idx === files.length - 1}
                      onClick={() => moveFile(idx, 'down')}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Merge Action Button */}
            <div className="pt-4 flex justify-end">
              <button
                disabled={isMerging || files.length < 2}
                onClick={handleExecuteMerge}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Merging {files.length} PDFs...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Merge {files.length} PDFs & Download</span>
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
