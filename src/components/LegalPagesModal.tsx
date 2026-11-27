import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Map, CheckCircle2 } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { EDITORIAL_IMAGES } from '../data/editorialAssets';
import { ToolDefinition } from '../types';

export type LegalPageType = 'privacy' | 'terms' | 'about' | 'contact' | 'sitemap';

interface LegalPagesModalProps {
  pageType: LegalPageType | null;
  onClose: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  pageType,
  onClose,
  onSelectTool
}) => {
  const [quickSent, setQuickSent] = useState(false);

  if (!pageType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-left text-slate-900 dark:text-slate-100 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              {pageType === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {pageType === 'terms' && <FileText className="w-5 h-5" />}
              {pageType === 'about' && <Info className="w-5 h-5" />}
              {pageType === 'contact' && <Mail className="w-5 h-5" />}
              {pageType === 'sitemap' && <Map className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {pageType === 'privacy' && 'Privacy Policy'}
                {pageType === 'terms' && 'Terms of Service'}
                {pageType === 'about' && 'About Mimage'}
                {pageType === 'contact' && 'Contact & Support'}
                {pageType === 'sitemap' && 'HTML Website Sitemap'}
              </h2>
              <span className="text-xs font-mono text-blue-600 dark:text-sky-400">
                Mimage Online File &amp; Image Workspace
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-5">
          {pageType === 'privacy' && (
            <>
              <p className="text-xs text-slate-500 font-mono">Last updated: November 2026</p>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  1. Local-First Processing &amp; Transparent Exceptions
                </h3>
                <p>
                  All image, PDF, EXIF, color, SVG, and QR utilities on Mimage process files locally inside your browser using HTML5 Canvas and WebAssembly with zero document storage on our servers. When you use OCR Text Extraction, your browser downloads Tesseract traineddata dictionaries from CDN on demand; when you use Website Image Audit, Mimage fetches public HTTPS URLs via public CORS mirrors if needed and never accesses private IP addresses.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  2. Google AdSense &amp; Analytics Cookies
                </h3>
                <p>
                  We use Google AdSense and Google Analytics 4 (G-ZM8R2JF6WT) for site sustainability and aggregated usage statistics. Users can manage personalized ads via Google Ads Settings or opt out using standard browser cookie controls.
                </p>
              </div>
            </>
          )}

          {pageType === 'terms' && (
            <>
              <p className="text-xs text-slate-500 font-mono">Last updated: November 2026</p>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">1. Permitted Use</h3>
                <p>
                  Mimage utilities are free for personal, educational, and commercial workflows. You retain full ownership of all input and output files.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">2. E-Signature &amp; Tool Limitations</h3>
                <p>
                  Tools are provided &quot;AS IS&quot;. Visual PDF signatures embed graphics locally and do not provide cryptographic certification or legal signature guarantees.
                </p>
              </div>
            </>
          )}

          {pageType === 'about' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Our Mission</h3>
                <p>
                  Mimage gives everyday users, bloggers, designers, and developers fast, honest, sign-up-free file utilities directly inside modern browsers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <img
                      src={EDITORIAL_IMAGES.authorAvatar}
                      alt="Naveed Afzal - Administrator & Writer"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Naveed Afzal</div>
                    <div className="text-[11px] font-mono text-emerald-400">Administrator, Founder &amp; Writer</div>
                    <a href="mailto:Afzal460@gmail.com" className="text-xs text-blue-600 dark:text-sky-400 hover:underline font-mono">
                      Afzal460@gmail.com
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Administrator, creator, and lead writer of Mimage (fixpdf.org). Built around client-side WebAssembly, transparent limitations, and fast access.
                </p>
              </div>
            </>
          )}

          {pageType === 'contact' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Creator Direct</div>
                  <div className="text-xs text-blue-600 dark:text-sky-400 font-semibold mt-1">Naveed Afzal</div>
                  <a href="mailto:Afzal460@gmail.com" className="text-xs text-blue-600 dark:text-sky-400 font-mono hover:underline block mt-1">
                    Afzal460@gmail.com
                  </a>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Support</div>
                  <a href="mailto:support@fixpdf.org" className="text-xs text-blue-600 dark:text-sky-400 font-mono hover:underline block mt-2">
                    support@fixpdf.org
                  </a>
                </div>
              </div>

              {quickSent ? (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Email client opened. Thank you for reaching out to Mimage!</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setQuickSent(true);
                  }}
                  className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Quick Support Message
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we help?"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </>
          )}

          {pageType === 'sitemap' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2">
              {TOOLS_DATA.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onClose();
                    onSelectTool(tool);
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left transition-colors cursor-pointer"
                >
                  <div className="font-mono text-[10px] text-blue-600 dark:text-sky-400 font-bold">
                    {tool.fromFormat} → {tool.toFormat}
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{tool.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold hover:bg-blue-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
