import React, { useState } from 'react';
import { UploadCloud, ScanText, Copy, Check, Download, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { renderSinglePdfPageToCanvas, formatFileSize } from '../../services/advancedToolsEngine';

const OCR_LANGUAGES = [
  { code: 'eng', label: 'English (eng)' },
  { code: 'fra', label: 'French / Français (fra)' },
  { code: 'spa', label: 'Spanish / Español (spa)' },
  { code: 'deu', label: 'German / Deutsch (deu)' },
  { code: 'ben', label: 'Bengali / বাংলা (ben)' }
];

export const OcrExtractTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [selectedPdfPage, setSelectedPdfPage] = useState(1);
  const [ocrLang, setOcrLang] = useState('eng');
  const [progressPct, setProgressPct] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFilePick = async (f: File) => {
    setFile(f);
    setExtractedText('');
    setConfidence(null);
    setErrorMsg(null);
    const pdfDetected = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    setIsPdf(pdfDetected);
    setSelectedPdfPage(1);

    if (pdfDetected) {
      try {
        const preview = await renderSinglePdfPageToCanvas(f, 1, 1.0);
        setPdfPageCount(preview.numPages);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Could not read PDF structure.');
      }
    } else {
      setPdfPageCount(1);
    }
  };

  const runOcr = async () => {
    if (!file) return;
    setIsRunning(true);
    setProgressPct(5);
    setStatusLabel('Preparing image bitmap locally...');
    setErrorMsg(null);

    try {
      let inputSource: File | HTMLCanvasElement = file;
      if (isPdf) {
        setStatusLabel(`Rendering PDF page ${selectedPdfPage} at high resolution...`);
        const rendered = await renderSinglePdfPageToCanvas(file, selectedPdfPage, 2.2);
        setPdfPageCount(rendered.numPages);
        inputSource = rendered.canvas;
      }

      setStatusLabel(`Loading Tesseract WASM & ${ocrLang} language data...`);
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(inputSource, ocrLang, {
        logger: (m: any) => {
          if (m.status) setStatusLabel(m.status);
          if (typeof m.progress === 'number') {
            setProgressPct(Math.max(5, Math.round(m.progress * 100)));
          }
        }
      });

      setExtractedText(result.data.text || '');
      setConfidence(typeof result.data.confidence === 'number' ? Math.round(result.data.confidence) : null);
      setProgressPct(100);
      setStatusLabel('OCR complete');
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          'OCR failed. Ensure language model download is not blocked by an offline firewall on first run.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'ocr-text';
    a.download = `${baseName}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-blue-200 dark:border-sky-800/60 bg-blue-50/70 dark:bg-sky-950/30 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <p>
          <strong>How privacy & language data work:</strong> Your photo or PDF stays strictly in local browser memory. On the first run for a language, Tesseract.js fetches the trained OCR dictionary (~10–15 MB) from the public jsDelivr CDN into your browser cache.
        </p>
      </div>

      {/* Dropzone */}
      <label className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500 dark:hover:border-sky-400 p-8 text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFilePick(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Drop a photo, screenshot, or scanned PDF'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports PNG, JPG, WebP, BMP, and single-page scans inside PDFs
        </p>
      </label>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {file && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Document Language
              </label>
              <select
                value={ocrLang}
                onChange={(e) => setOcrLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              >
                {OCR_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {isPdf && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  PDF Page to Scan (1 – {pdfPageCount})
                </label>
                <input
                  type="number"
                  min={1}
                  max={pdfPageCount}
                  value={selectedPdfPage}
                  onChange={(e) => setSelectedPdfPage(Math.max(1, Math.min(pdfPageCount, Number(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={runOcr}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Recognizing Text ({progressPct}%)...</span>
                </>
              ) : (
                <>
                  <ScanText className="w-4 h-4" />
                  <span>Extract Text via OCR</span>
                </>
              )}
            </button>
          </div>

          {isRunning && (
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {statusLabel} · {progressPct}%
              </p>
            </div>
          )}
        </div>
      )}

      {extractedText && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              Extracted {extractedText.length.toLocaleString()} characters
              {confidence !== null && ` · Mean confidence: ${confidence}%`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>
          </div>

          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={12}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};
