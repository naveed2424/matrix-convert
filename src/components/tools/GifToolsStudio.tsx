import React, { useState } from 'react';
import { UploadCloud, Download, Film, RefreshCw, Info } from 'lucide-react';
import { createAnimatedGifFromImages, compressGifFile, formatFileSize } from '../../services/advancedToolsEngine';
import { ConvertedFile } from '../../types';

interface GifToolsStudioProps {
  initialMode?: 'maker' | 'compressor';
}

export const GifToolsStudio: React.FC<GifToolsStudioProps> = ({ initialMode = 'maker' }) => {
  const [mode, setMode] = useState<'maker' | 'compressor'>(initialMode);
  const [frames, setFrames] = useState<File[]>([]);
  const [delayMs, setDelayMs] = useState(350);
  const [makerWidth, setMakerWidth] = useState(480);

  const [gifFile, setGifFile] = useState<File | null>(null);
  const [scalePercent, setScalePercent] = useState(75);
  const [maxColors, setMaxColors] = useState(96);
  const [frameDropStep, setFrameDropStep] = useState(1);

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<(ConvertedFile & { framesProcessed?: number }) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunMaker = async () => {
    if (frames.length === 0) return;
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await createAnimatedGifFromImages(frames, {
        width: makerWidth,
        delayMs,
        maxColors: 128
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to encode GIF.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCompressor = async () => {
    if (!gifFile) return;
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await compressGifFile(gifFile, {
        scalePercent,
        maxColors,
        frameDropStep
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to compress GIF.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('maker');
            setResult(null);
            setErrorMsg(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
            mode === 'maker'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          Animated GIF Maker (From Images)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('compressor');
            setResult(null);
            setErrorMsg(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
            mode === 'compressor'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          GIF Compressor (Scale, Quantize &amp; Frame Drop)
        </button>
      </div>

      {mode === 'maker' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                Frame Width: <span className="font-mono text-blue-600 dark:text-sky-400">{makerWidth}px</span>
              </label>
              <input
                type="range"
                min={240}
                max={960}
                step={40}
                value={makerWidth}
                onChange={(e) => setMakerWidth(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                Frame Delay: <span className="font-mono text-blue-600 dark:text-sky-400">{delayMs} ms</span>
              </label>
              <input
                type="range"
                min={80}
                max={1200}
                step={20}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFrames(Array.from(e.target.files));
                  setResult(null);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {frames.length > 0 ? `${frames.length} image frames selected` : 'Select 2 or more images to build an animated GIF'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Frames preserve aspect ratio without stretching</p>
          </label>

          {frames.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunMaker}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                <span>{isRunning ? 'Encoding GIF...' : 'Create Animated GIF'}</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="rounded-xl border border-blue-200 dark:border-sky-500/30 bg-blue-50/70 dark:bg-sky-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <span>
              Chromium &amp; Edge browsers preserve all animated frames natively using <code>ImageDecoder</code>. Browsers without native <code>ImageDecoder</code> automatically fall back to static first-frame optimization.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                Resolution Scale: <span className="font-mono text-blue-600">{scalePercent}%</span>
              </label>
              <input
                type="range"
                min={35}
                max={100}
                step={5}
                value={scalePercent}
                onChange={(e) => setScalePercent(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                Max Palette Colors: <span className="font-mono text-blue-600">{maxColors}</span>
              </label>
              <input
                type="range"
                min={32}
                max={256}
                step={16}
                value={maxColors}
                onChange={(e) => setMaxColors(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                Frame Sampling
              </label>
              <select
                value={frameDropStep}
                onChange={(e) => setFrameDropStep(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value={1}>Keep every frame</option>
                <option value={2}>Drop every 2nd frame (2× smaller)</option>
                <option value={3}>Keep 1 in 3 frames</option>
              </select>
            </div>
          </div>

          <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer">
            <input
              type="file"
              accept=".gif,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setGifFile(e.target.files[0]);
                  setResult(null);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {gifFile ? `${gifFile.name} (${formatFileSize(gifFile.size)})` : 'Drop a GIF file to compress & re-quantize'}
            </p>
          </label>

          {gifFile && (
            <div className="flex justify-center">
              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunCompressor}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {isRunning && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isRunning ? 'Compressing GIF...' : 'Compress GIF Now'}</span>
              </button>
            </div>
          )}
        </>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">
              <strong>{result.convertedName}</strong> · {formatFileSize(result.originalSize)} →{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">{formatFileSize(result.convertedSize)}</strong> ({result.width}×{result.height}px)
            </div>
            <a
              href={result.dataUrl}
              download={result.convertedName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download GIF</span>
            </a>
          </div>
          {result.note && (
            <p className="text-xs text-slate-600 dark:text-slate-400">{result.note}</p>
          )}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4 flex justify-center">
            <img src={result.dataUrl} alt="Processed GIF preview" className="max-h-72 w-auto object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
