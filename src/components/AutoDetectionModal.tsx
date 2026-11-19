import React, { useEffect, useState } from 'react';
import { X, ArrowRight, FileSearch, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ToolDefinition } from '../types';
import { getLocalizedTool } from '../data/languages';
import { inspectFileSignature, FileInspectionResult } from '../services/fileSignature';

interface AutoDetectionModalProps {
  files: File[];
  isOpen: boolean;
  onClose: () => void;
  allTools: ToolDefinition[];
  onSelectToolForFiles: (tool: ToolDefinition, files: File[]) => void;
  currentLang?: string;
}

export const AutoDetectionModal: React.FC<AutoDetectionModalProps> = ({
  files,
  isOpen,
  onClose,
  allTools,
  onSelectToolForFiles,
  currentLang = 'en'
}) => {
  const [inspection, setInspection] = useState<FileInspectionResult | null>(null);

  useEffect(() => {
    if (!isOpen || files.length === 0) {
      setInspection(null);
      return;
    }
    let cancelled = false;
    inspectFileSignature(files[0]).then((res) => {
      if (!cancelled) setInspection(res);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, files]);

  if (!isOpen || files.length === 0) return null;

  const firstFile = files[0];
  const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';
  const detectedSlugMatches = inspection?.recommendedToolSlugs || [];

  let candidateTools = allTools.filter((t) => {
    if (detectedSlugMatches.includes(t.slug) || detectedSlugMatches.includes(t.id)) return true;
    const fmt = inspection?.detectedFormat.toLowerCase() || ext;
    return (
      t.fromFormat.toLowerCase() === fmt ||
      t.acceptedFileTypes.some((a) => a.toLowerCase().includes(fmt))
    );
  });

  if (files.length > 1) {
    const imgToPdf = allTools.find((t) => t.id === 'image-to-pdf');
    if (imgToPdf && !candidateTools.some((t) => t.id === 'image-to-pdf')) {
      candidateTools.unshift(imgToPdf);
    }
  }

  const assistantTool = allTools.find((t) => t.id === 'smart-assistant');
  if (assistantTool && !candidateTools.some((t) => t.id === 'smart-assistant')) {
    candidateTools = [assistantTool, ...candidateTools];
  }

  if (candidateTools.length === 0) {
    candidateTools = allTools.slice(0, 5);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-left text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detected {files.length} File{files.length > 1 ? 's' : ''} (
              {inspection ? inspection.detectedFormat : `.${ext.toUpperCase()}`})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
          Verified locally for <strong className="text-slate-900 dark:text-white">"{firstFile.name}"</strong>
          {files.length > 1 ? ` and ${files.length - 1} other file(s)` : ''}. Choose a compatible workflow:
        </p>

        {inspection?.extensionMismatch && (
          <div className="mb-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Extension (.{ext.toUpperCase()}) differs from binary header ({inspection.detectedFormat}). Compatible tools below target the true signature.
            </span>
          </div>
        )}

        {inspection?.isUnsafeSvg && (
          <div className="mb-3 p-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>SVG contains active script or event markup. Open SVG Optimizer to strip unsafe tags before publishing.</span>
          </div>
        )}

        <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
          {candidateTools.slice(0, 6).map((tool) => {
            const localized = getLocalizedTool(tool, currentLang);
            return (
              <button
                key={tool.id}
                onClick={() => onSelectToolForFiles(tool, files)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-400 transition-all text-left cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {localized.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {localized.shortDescription}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero files uploaded</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
