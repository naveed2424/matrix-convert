import React, { useState } from 'react';
import { UploadCloud, Archive, Copy, Check, RefreshCw } from 'lucide-react';
import { generateIconPackageZip, formatFileSize } from '../../services/advancedToolsEngine';

interface FaviconAppIconToolProps {
  initialMode?: 'favicon' | 'app-icons';
}

export const FaviconAppIconTool: React.FC<FaviconAppIconToolProps> = ({ initialMode = 'favicon' }) => {
  const [mode, setMode] = useState<'favicon' | 'app-icons'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pkg, setPkg] = useState<{
    zipBlob: Blob;
    zipName: string;
    generatedFiles: { name: string; size: number; dataUrl: string; width: number }[];
    htmlSnippet: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (selectedFile: File, targetMode: 'favicon' | 'app-icons') => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await generateIconPackageZip(selectedFile, targetMode);
      setPkg(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to build icon bundle.');
    } finally {
      setIsRunning(false);
    }
  };

  const downloadZip = () => {
    if (!pkg) return;
    const url = URL.createObjectURL(pkg.zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pkg.zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('favicon');
            if (file) handleGenerate(file, 'favicon');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
            mode === 'favicon'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          Website Favicon Package (ICO + PNG + Webmanifest)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('app-icons');
            if (file) handleGenerate(file, 'app-icons');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
            mode === 'app-icons'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          iOS &amp; Android App Icon Bundle (48px – 1024px)
        </button>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            handleGenerate(e.dataTransfer.files[0], mode);
          }
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              handleGenerate(e.target.files[0], mode);
            }
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Drop a square logo or high-res PNG/SVG (recommended 512px+)'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generates aspect-safe icon variants inside one ZIP archive
        </p>
      </label>

      {isRunning && (
        <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-sky-400 py-4">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Generating crisp icon set...</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {pkg && !isRunning && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              Generated {pkg.generatedFiles.length} PNG sizes {mode === 'favicon' ? '+ favicon.ico + site.webmanifest' : ''} ({formatFileSize(pkg.zipBlob.size)} ZIP)
            </span>
            <button
              type="button"
              onClick={downloadZip}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Download {pkg.zipName}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {pkg.generatedFiles.map((gf) => (
              <div
                key={gf.name}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1.5"
              >
                <img src={gf.dataUrl} alt={gf.name} className="w-12 h-12 mx-auto object-contain rounded" />
                <div className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 truncate" title={gf.name}>
                  {gf.width}×{gf.width}
                </div>
                <div className="text-[10px] font-mono text-slate-500 tabular-nums">{formatFileSize(gf.size)}</div>
              </div>
            ))}
          </div>

          {mode === 'favicon' && (
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Ready-to-paste &lt;head&gt; HTML tags</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pkg.htmlSnippet);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                {pkg.htmlSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
