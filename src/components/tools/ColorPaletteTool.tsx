import React, { useState, useRef } from 'react';
import { UploadCloud, Copy, Check, Pipette, Palette } from 'lucide-react';
import { extractImagePalette, PaletteSwatch, rgbToHslString, formatFileSize } from '../../services/advancedToolsEngine';

export const ColorPaletteTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteSwatch[]>([]);
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = async (selected: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setPickedColor(null);
    setErrorMsg(null);
    try {
      const swatches = await extractImagePalette(selected, 8);
      setPalette(swatches);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to read image pixels.');
    }
  };

  const handleSamplePixel = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const px = Math.min(img.naturalWidth - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)));
    const py = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)));

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(px, py, 1, 1).data;
    const hex = `#${[d[0], d[1], d[2]].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    setPickedColor({
      hex,
      rgb: `rgb(${d[0]}, ${d[1]}, ${d[2]})`,
      hsl: rgbToHslString(d[0], d[1], d[2])
    });
  };

  const copyText = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 1600);
  };

  const cssVarsSnippet = palette.length
    ? `:root {\n${palette.map((p, idx) => `  --color-swatch-${idx + 1}: ${p.hex};`).join('\n')}\n}`
    : '';

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Upload any image to extract dominant colors & pick exact pixels'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generates HEX, RGB, and HSL codes plus copyable CSS variables
        </p>
      </label>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Clickable Canvas Sampler */}
          <div className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <Pipette className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Click anywhere on image to sample spot pixel</span>
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex justify-center">
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Color sampling canvas"
                onClick={handleSamplePixel}
                className="max-h-80 w-auto object-contain cursor-crosshair"
              />
            </div>

            {pickedColor && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                    style={{ backgroundColor: pickedColor.hex }}
                  />
                  <div className="text-xs font-mono space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white">{pickedColor.hex}</div>
                    <div className="text-slate-600 dark:text-slate-400">{pickedColor.rgb}</div>
                    <div className="text-slate-500 dark:text-slate-400">{pickedColor.hsl}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(pickedColor.hex)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {copiedValue === pickedColor.hex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedValue === pickedColor.hex ? 'Copied' : 'Copy HEX'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dominant Quantized Swatches */}
          <div className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Extracted Color Palette ({palette.length})</span>
              </h3>
              {cssVarsSnippet && (
                <button
                  type="button"
                  onClick={() => copyText(cssVarsSnippet)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copiedValue === cssVarsSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedValue === cssVarsSnippet ? 'CSS Copied' : 'Copy CSS Variables'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {palette.map((swatch, idx) => (
                <div
                  key={`${swatch.hex}-${idx}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="text-xs font-mono min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{swatch.hex}</span>
                        <span className="text-[11px] font-normal text-slate-500 tabular-nums">({swatch.percentage}%)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {swatch.rgb} · {swatch.hsl}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(swatch.hex)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer"
                    >
                      {copiedValue === swatch.hex ? 'Copied' : 'HEX'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(swatch.hsl)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer"
                    >
                      {copiedValue === swatch.hsl ? 'Copied' : 'HSL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
