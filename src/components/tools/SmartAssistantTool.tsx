import React, { useState } from 'react';
import {
  FileSearch,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { inspectFileSignature, FileInspectionResult } from '../../services/fileSignature';
import { formatFileSize } from '../../services/advancedToolsEngine';

interface SmartAssistantToolProps {
  onSelectToolSlug: (slug: string) => void;
}

export const SmartAssistantTool: React.FC<SmartAssistantToolProps> = ({ onSelectToolSlug }) => {
  const [inspection, setInspection] = useState<FileInspectionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; ext: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileInspect = async (file: File) => {
    setIsScanning(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    try {
      const result = await inspectFileSignature(file);
      setInspection(result);
      setFileInfo({
        name: file.name,
        size: file.size,
        ext: file.name.split('.').pop()?.toUpperCase() || 'NONE'
      });
      if (file.type.startsWith('image/') && !result.isUnsafeSvg) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 dark:border-sky-500/30 bg-blue-50/70 dark:bg-sky-950/20 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">How Smart File Assistant works:</strong> Mimage reads the binary header signature (magic bytes) directly in your browser rather than trusting file extensions. Nothing is uploaded, and only actions compatible with the detected signature are recommended.
        </div>
      </div>

      {/* Dropzone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFileInspect(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-900/50 p-10 text-center cursor-pointer transition-colors"
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileInspect(e.target.files[0]);
          }}
        />
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {isScanning ? 'Reading file signature...' : 'Drop any file to inspect its true format'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Works with JPG, PNG, WebP, HEIC, AVIF, GIF, PDF, SVG, BMP, ICO, or mystery files
        </p>
      </label>

      {/* Inspection Report */}
      {inspection && fileInfo && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={fileInfo.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <FileCode className="w-7 h-7 text-blue-600 dark:text-sky-400" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{inspection.formatLabel}</h3>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 text-xs font-mono font-semibold">
                    {inspection.detectedFormat}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1.5">{inspection.explanation}</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>{fileInfo.name}</span>
                  <span>·</span>
                  <span>{formatFileSize(fileInfo.size)}</span>
                  <span>·</span>
                  <span>MIME: {inspection.mimeType}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {inspection.extensionMismatch || inspection.isUnsafeSvg ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Attention Needed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Signature Verified</span>
                </span>
              )}
            </div>
          </div>

          {/* Hex signature detail */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 text-xs font-mono text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong className="text-slate-900 dark:text-white">Header Magic Bytes:</strong>{' '}
              {inspection.signatureHex || 'Text/XML'}
            </span>
            <span>
              <strong className="text-slate-900 dark:text-white">Filename Extension:</strong> .{fileInfo.ext}
            </span>
          </div>

          {/* Warnings */}
          {inspection.warnings.length > 0 && (
            <div className="space-y-2">
              {inspection.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggested compatible tools */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Compatible Actions for {inspection.detectedFormat}</span>
            </h4>
            {inspection.suggestions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No compatible browser conversion tools match this binary signature. Mimage refuses to guess unsupported formats.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inspection.suggestions.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => onSelectToolSlug(s.slug)}
                    className="group text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400">
                        {s.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{s.reason}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
