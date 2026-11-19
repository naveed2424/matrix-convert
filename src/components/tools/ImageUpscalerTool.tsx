import React, { useState, useEffect } from 'react';
import { UploadCloud, Download, Maximize2, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { upscaleImageLocally, formatFileSize } from '../../services/advancedToolsEngine';
import { ConvertedFile } from '../../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export const ImageUpscalerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [factor, setFactor] = useState<2 | 3 | 4>(2);
  const [sharpen, setSharpen] = useState<number>(0.35);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ConvertedFile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  const handleSelectFile = (f: File) => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    setResult(null);
    setErrorMsg(null);
  };

  const handleUpscale = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const upscaled = await upscaleImageLocally(file, factor, sharpen);
      setResult(upscaled);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not upscale image cleanly in browser memory.');
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
          <strong>Transparent capability disclosure:</strong> This tool uses high-quality browser bicubic resampling paired with unsharp edge contrast sharpening (capped at 6000 px max dimension to prevent browser tab crashes). It enlarges dimensions cleanly for print or UI layouts without inventing synthetic AI facial or photographic textures.
        </p>
      </div>

      {/* Dropzone */}
      <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500 dark:hover:border-sky-400 p-8 text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Select an image to upscale (2x, 3x, or 4x)'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          PNG, JPG, WebP, or BMP · Processed 100% locally
        </p>
      </label>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {file && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Scale Multiplier
              </span>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFactor(f)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                      factor === f
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {f}× Resolution
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Edge Contrast Sharpening</span>
                <span className="font-mono text-blue-600 dark:text-sky-400 tabular-nums">
                  {Math.round(sharpen * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={sharpen}
                onChange={(e) => setSharpen(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleUpscale}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Upscaling & Sharpening...</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Run {factor}× Upscale</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && originalUrl && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upscaled Output: {result.width} × {result.height} px
              </h3>
              {result.note && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.note}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG ({formatFileSize(result.convertedSize)})</span>
            </button>
          </div>

          <BeforeAfterSlider
            originalUrl={originalUrl}
            processedUrl={result.previewUrl}
            originalSize={result.originalSize}
            processedSize={result.convertedSize}
            originalLabel="Original"
            processedLabel={`Upscaled ${factor}×`}
          />
        </div>
      )}
    </div>
  );
};
