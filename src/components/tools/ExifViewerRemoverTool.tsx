import React, { useState } from 'react';
import { UploadCloud, ShieldCheck, CheckCircle2, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { parseExifMetadata, ExifInspectionReport } from '../../services/fileSignature';
import { convertRasterImage } from '../../services/converterEngine';
import { formatFileSize } from '../../services/advancedToolsEngine';

export const ExifViewerRemoverTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [beforeReport, setBeforeReport] = useState<ExifInspectionReport | null>(null);
  const [afterReport, setAfterReport] = useState<ExifInspectionReport | null>(null);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [cleanedName, setCleanedName] = useState<string>('');
  const [cleanedSize, setCleanedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInspect = async (selected: File) => {
    setFile(selected);
    setCleanedUrl(null);
    setAfterReport(null);
    const report = await parseExifMetadata(selected);
    setBeforeReport(report);
  };

  const handleStrip = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const converted = await convertRasterImage(file, outputFormat, { quality: 94 });
      const cleanFile = new File([converted.blob], converted.convertedName, { type: converted.blob.type });
      const verified = await parseExifMetadata(cleanFile);
      setAfterReport(verified);
      setCleanedUrl(converted.dataUrl);
      setCleanedName(`${file.name.replace(/\.[^/.]+$/, '')}-clean.${outputFormat}`);
      setCleanedSize(converted.convertedSize);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleInspect(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleInspect(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Upload photo to inspect & strip EXIF / GPS metadata'}
        </p>
        <p className="text-xs text-slate-500 mt-1">Binary header reader inspects JPEG APP1 TIFF/GPS tags right in your browser</p>
      </label>

      {beforeReport && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {beforeReport.hasExifSegment ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {beforeReport.hasExifSegment
                    ? 'Embedded EXIF Header Detected'
                    : 'No JPEG APP1 EXIF Segment Detected'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{beforeReport.note}</p>
              </div>
            </div>

            {beforeReport.hasGpsIfd && (
              <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                GPS Pointer Present
              </span>
            )}
          </div>

          {beforeReport.fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {beforeReport.fields.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 block">{f.label}</span>
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white break-all">{f.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Clean Export Format:</span>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="jpg">JPG (Stripped)</option>
                <option value="png">PNG (Stripped)</option>
                <option value="webp">WebP (Stripped)</option>
              </select>
            </div>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStrip}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Strip Metadata &amp; Verify Output</span>
            </button>
          </div>
        </div>
      )}

      {cleanedUrl && afterReport && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Clean Output Ready ({formatFileSize(cleanedSize)})</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Post-strip binary scan: EXIF Header Present = <strong>{afterReport.hasExifSegment ? 'Yes' : 'No'}</strong> · GPS Pointer = <strong>{afterReport.hasGpsIfd ? 'Yes' : 'No'}</strong>
            </p>
          </div>
          <a
            href={cleanedUrl}
            download={cleanedName}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Download {cleanedName}</span>
          </a>
        </div>
      )}
    </div>
  );
};
