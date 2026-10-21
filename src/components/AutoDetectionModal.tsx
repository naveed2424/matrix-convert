import React from 'react';
import { X, ArrowRight, Zap, FileText } from 'lucide-react';
import { ToolDefinition } from '../types';
import { getLocalizedTool } from '../data/languages';

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
  if (!isOpen || files.length === 0) return null;

  const firstFile = files[0];
  const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';

  // Find candidate tools matching the source file extension
  let candidateTools = allTools.filter(
    (t) =>
      t.fromFormat.toLowerCase() === ext ||
      t.acceptedFileTypes.some((a) => a.toLowerCase().includes(ext))
  );

  // If multiple images are dropped, also offer Images to PDF
  if (files.length > 1 && !candidateTools.some((t) => t.id === 'image-to-pdf')) {
    const imgToPdf = allTools.find((t) => t.id === 'image-to-pdf');
    if (imgToPdf) candidateTools.unshift(imgToPdf);
  }

  // Fallback to popular tools if no exact match
  if (candidateTools.length === 0) {
    candidateTools = allTools.slice(0, 4);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-sky-400 bg-[#f0f9ff] p-6 shadow-2xl text-left font-mono text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Detected {files.length} File{files.length > 1 ? 's' : ''} (.{ext.toUpperCase()})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 my-3 leading-relaxed">
          Select how you want to convert <strong className="text-slate-900">"{firstFile.name}"</strong>{files.length > 1 ? ` and ${files.length - 1} other file(s)` : ''}:
        </p>

        {/* Suggested Tools List in Light Sky Blue Cards */}
        <div className="space-y-2 mb-4">
          {candidateTools.slice(0, 5).map((tool) => {
            const localized = getLocalizedTool(tool, currentLang);
            return (
              <button
                key={tool.id}
                onClick={() => onSelectToolForFiles(tool, files)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-sky-200 bg-white hover:border-sky-500 hover:bg-sky-50 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-2">
                    <span>{localized.name}</span>
                    {tool.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-sans">
                    {localized.shortDescription}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
