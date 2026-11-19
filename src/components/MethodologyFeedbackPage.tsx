import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ShieldCheck,
  Send,
  Copy,
  Check
} from 'lucide-react';

interface CapabilityProbe {
  name: string;
  supported: boolean;
  detail: string;
}

interface MethodologyFeedbackPageProps {
  onBackToHome: () => void;
  onNavigatePrivacyCenter: () => void;
}

export const MethodologyFeedbackPage: React.FC<MethodologyFeedbackPageProps> = ({
  onBackToHome,
  onNavigatePrivacyCenter
}) => {
  const [capabilities, setCapabilities] = useState<CapabilityProbe[]>([]);
  const [subject, setSubject] = useState('Tool Feedback / Bug Report');
  const [toolArea, setToolArea] = useState('Image Tools');
  const [message, setMessage] = useState('');
  const [submittedNote, setSubmittedNote] = useState(false);
  const [copiedDiag, setCopiedDiag] = useState(false);

  useEffect(() => {
    const probes: CapabilityProbe[] = [];

    // 1. Canvas 2D
    const canvas = document.createElement('canvas');
    const has2d = Boolean(canvas.getContext && canvas.getContext('2d'));
    probes.push({
      name: 'HTML5 Canvas 2D API',
      supported: has2d,
      detail: has2d ? 'Available for resizing, cropping, filtering & EXIF stripping' : 'Unavailable'
    });

    // 2. WebP encoding
    const webpUrl = has2d ? canvas.toDataURL('image/webp') : '';
    const hasWebp = webpUrl.startsWith('data:image/webp');
    probes.push({
      name: 'Browser WebP Encoding',
      supported: hasWebp,
      detail: hasWebp ? 'Native WebP encoder available locally' : 'Fallback to PNG/JPG required in this browser'
    });

    // 3. AVIF encoding
    const avifUrl = has2d ? canvas.toDataURL('image/avif') : '';
    const hasAvif = avifUrl.startsWith('data:image/avif');
    probes.push({
      name: 'Browser AVIF Encoding',
      supported: hasAvif,
      detail: hasAvif
        ? 'Native AVIF encoder available locally'
        : 'Native AVIF encoding unavailable; Optimization Studio transparently uses WebP fallback'
    });

    // 4. WebAssembly
    const hasWasm = typeof WebAssembly === 'object';
    probes.push({
      name: 'WebAssembly (WASM)',
      supported: hasWasm,
      detail: hasWasm ? 'Ready for local PDF rendering & Tesseract OCR workers' : 'Disabled in browser'
    });

    // 5. ImageDecoder API (animated GIF extraction)
    const hasImageDecoder = 'ImageDecoder' in window;
    probes.push({
      name: 'ImageDecoder API (Multi-Frame GIF)',
      supported: hasImageDecoder,
      detail: hasImageDecoder
        ? 'Multi-frame animated GIF decoding supported'
        : 'Not exposed in this browser; GIF Compressor processes static/single frame cleanly'
    });

    // 6. Web Workers
    const hasWorkers = typeof Worker !== 'undefined';
    probes.push({
      name: 'Web Workers',
      supported: hasWorkers,
      detail: hasWorkers ? 'Background thread execution enabled for OCR' : 'Blocked by environment'
    });

    setCapabilities(probes);
  }, []);

  const buildDiagnosticReport = () => {
    const capsText = capabilities.map((c) => `- ${c.name}: ${c.supported ? 'OK' : 'Limited'} (${c.detail})`).join('\n');
    return `Mimage Bug / Feedback Report\nCategory: ${toolArea}\nSubject: ${subject}\nMessage: ${message || '(none)'}\nUser Agent: ${navigator.userAgent}\n\nBrowser Capabilities:\n${capsText}`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(buildDiagnosticReport());
    setCopiedDiag(true);
    setTimeout(() => setCopiedDiag(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>

        <button
          onClick={onNavigatePrivacyCenter}
          className="text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Open Privacy Center</span>
        </button>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Testing Methodology, Browser Diagnostics &amp; Feedback
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Mimage does not fabricate user ratings, review averages, or generic testimonial carousels. Instead, inspect live capability probes from your own browser and review how each file utility is tested and verified.
        </p>
      </header>

      {/* Live Browser Capability Diagnostics */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-blue-600 dark:text-sky-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Live Browser Engine Diagnostics
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Real feature checks run locally inside your active browser session right now:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {capabilities.map((cap) => (
            <div
              key={cap.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start gap-3"
            >
              {cap.supported ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{cap.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cap.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Standards */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">How Mimage Tools Are Verified</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Binary Magic-Byte Checks</h3>
            <p>
              Files are inspected by binary header signatures rather than trusting extension strings alone, alerting you before misnamed assets cause downstream errors.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Honest Output Accounting</h3>
            <p>
              Target byte compressors report exact output size vs target, and optimization workflows never claim savings unless generated blobs are smaller than originals.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Explicit Limitation Labels</h3>
            <p>
              Bicubic upscaling, e-signature graphic placement, OCR dictionary fetches, and public Website Image Audit network constraints are documented clearly on every tool page.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Bug Report & Feedback Form */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit Tool Feedback or Bug Report</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Notice a browser quirk, unsupported file edge case, or missing conversion workflow? Prepare a diagnostic report to email directly to{' '}
          <a href="mailto:support@mimage.netlify.app" className="text-blue-600 dark:text-sky-400 underline font-semibold">
            support@mimage.netlify.app
          </a>
          .
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedNote(true);
            const mailtoUrl = `mailto:support@mimage.netlify.app?subject=${encodeURIComponent(
              `[Mimage Feedback] ${subject}`
            )}&body=${encodeURIComponent(buildDiagnosticReport())}`;
            window.location.href = mailtoUrl;
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Tool Category</label>
              <select
                value={toolArea}
                onChange={(e) => setToolArea(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white"
              >
                <option value="Image Tools">Image Tools</option>
                <option value="PDF Tools">PDF Tools</option>
                <option value="File Converters">File Converters</option>
                <option value="GIF & Video Tools">GIF &amp; Video Tools</option>
                <option value="Privacy Tools">Privacy Tools</option>
                <option value="Design Tools">Design Tools</option>
                <option value="Developer Tools">Developer Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Topic</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Details</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the file format, expected behavior, and what happened in your browser..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Email Report</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {copiedDiag ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDiag ? 'Diagnostic Report Copied' : 'Copy Diagnostic Report'}</span>
            </button>
          </div>

          {submittedNote && (
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Email composer triggered. If your system does not open a mail client automatically, click &quot;Copy Diagnostic Report&quot; and email Afzal460@gmail.com or support@mimage.netlify.app.
            </div>
          )}
        </form>
      </section>
    </div>
  );
};
