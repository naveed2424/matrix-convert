import React, { useState } from 'react';
import { UploadCloud, Download, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { sanitizeAndOptimizeSvg, formatFileSize } from '../../services/advancedToolsEngine';

export const SvgOptimizerTool: React.FC = () => {
  const [rawSvg, setRawSvg] = useState('');
  const [fileName, setFileName] = useState('vector-graphic.svg');
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [roundDecimals, setRoundDecimals] = useState(2);
  const [result, setResult] = useState<{
    optimizedSvg: string;
    originalBytes: number;
    optimizedBytes: number;
    removedUnsafeTags: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runOptimize = (sourceText: string) => {
    setErrorMsg(null);
    if (!sourceText.trim()) {
      setResult(null);
      return;
    }
    try {
      const res = sanitizeAndOptimizeSvg(sourceText, {
        removeComments,
        removeMetadata,
        roundDecimals
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse SVG markup.');
      setResult(null);
    }
  };

  const handleFile = async (file: File) => {
    setFileName(file.name.replace(/\.svg$/i, '-optimized.svg'));
    const text = await file.text();
    setRawSvg(text);
    runOptimize(text);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.optimizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const savingsPct =
    result && result.originalBytes > 0
      ? Math.round(((result.originalBytes - result.optimizedBytes) / result.originalBytes) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 dark:border-sky-500/30 bg-blue-50/70 dark:bg-sky-950/20 p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-900 dark:text-white">XSS-Hardened SVG Sanitization:</strong> Removes embedded <code>&lt;script&gt;</code>, <code>&lt;foreignObject&gt;</code>, <code>on*</code> event handlers, and <code>javascript:</code> URIs while stripping editor metadata and minifying coordinate precision.
        </span>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={removeComments}
            onChange={(e) => setRemoveComments(e.target.checked)}
            className="accent-blue-600"
          />
          <span>Strip XML comments</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={removeMetadata}
            onChange={(e) => setRemoveMetadata(e.target.checked)}
            className="accent-blue-600"
          />
          <span>Strip Illustrator / Inkscape metadata</span>
        </label>
        <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span>Decimal Precision:</span>
          <select
            value={roundDecimals}
            onChange={(e) => setRoundDecimals(Number(e.target.value))}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value={1}>1 decimal</option>
            <option value={2}>2 decimals (Recommended)</option>
            <option value={3}>3 decimals</option>
          </select>
        </label>
      </div>

      {/* Dropzone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-7 text-center cursor-pointer"
      >
        <input
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-7 h-7 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">Upload an SVG file or paste raw SVG XML below</p>
      </label>

      <div className="space-y-2">
        <textarea
          rows={5}
          value={rawSvg}
          onChange={(e) => setRawSvg(e.target.value)}
          placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
          className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => runOptimize(rawSvg)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
        >
          Sanitize &amp; Optimize SVG
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs space-y-0.5 tabular-nums">
              <div className="font-bold text-slate-900 dark:text-white">
                {formatFileSize(result.originalBytes)} → {formatFileSize(result.optimizedBytes)} ({savingsPct >= 0 ? `-${savingsPct}% reduction` : `+${Math.abs(savingsPct)}%`})
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Unsafe script nodes / event handlers stripped: <strong>{result.removedUnsafeTags}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.optimizedSvg);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SVG'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Clean SVG</span>
              </button>
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-48 overflow-auto whitespace-pre-wrap break-all">
            {result.optimizedSvg}
          </pre>
        </div>
      )}
    </div>
  );
};
