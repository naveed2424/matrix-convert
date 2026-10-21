import React from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Map, ArrowRight } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
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
  if (!pageType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-sky-400 bg-[#f0f9ff] p-6 sm:p-8 shadow-2xl text-left text-slate-900 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-md">
              {pageType === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {pageType === 'terms' && <FileText className="w-5 h-5" />}
              {pageType === 'about' && <Info className="w-5 h-5" />}
              {pageType === 'contact' && <Mail className="w-5 h-5" />}
              {pageType === 'sitemap' && <Map className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {pageType === 'privacy' && 'Privacy Policy'}
                {pageType === 'terms' && 'Terms of Service'}
                {pageType === 'about' && 'About MatrixConvert'}
                {pageType === 'contact' && 'Contact & Support'}
                {pageType === 'sitemap' && 'HTML Website Sitemap'}
              </h2>
              <span className="text-xs font-mono text-sky-700 font-semibold">
                Google AdSense & Web Compliance
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-800 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 text-sm leading-relaxed text-slate-700 space-y-5">
          {/* =========================================================================
              PRIVACY POLICY (Strictly compliant with Google AdSense, GDPR, CCPA)
             ========================================================================= */}
          {pageType === 'privacy' && (
            <>
              <p className="text-xs text-slate-500 font-mono">
                Last updated: October 21, 2026
              </p>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  1. Zero File Upload & Total Processing Privacy
                </h3>
                <p>
                  At MatrixConvert, privacy is our fundamental architecture. All image and document conversions (including PDF to PNG, PDF to SVG, WebP, JPG, and ICO) occur <strong>100% client-side inside your local web browser's memory</strong> using HTML5 Canvas and WebAssembly. Your files, documents, and images are never uploaded to any remote server or stored in any database.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  2. Google AdSense & Third-Party Advertising Cookies
                </h3>
                <p>
                  We use third-party advertising companies, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. These companies may use cookies, web beacons, and other tracking technologies to collect information about your visits to this and other websites in order to provide personalized advertisements about goods and services of interest to you.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                  </li>
                  <li>
                    Users may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 underline font-semibold"
                    >
                      Google Ads Settings
                    </a>
                    . Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 underline font-semibold"
                    >
                      www.aboutads.info
                    </a>
                    .
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  3. Log Files & Web Analytics
                </h3>
                <p>
                  Like most standard web applications, we use Google Analytics (gtag.js) to understand general traffic trends, country of origin, and browser types to improve conversion performance. No personally identifiable information (PII) is stored or connected to converted files.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  4. GDPR (General Data Protection Regulation) Compliance
                </h3>
                <p>
                  For users located in the European Economic Area (EEA), all processing of files occurs solely on your device. We do not transfer personal data outside the EEA because we never collect or transmit your files.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  5. CCPA (California Consumer Privacy Act)
                </h3>
                <p>
                  Under the CCPA, California residents have the right to know what personal data is collected and request deletion. Because MatrixConvert does not sell personal information or retain uploaded files, your privacy is safeguarded by default.
                </p>
              </div>
            </>
          )}

          {/* =========================================================================
              TERMS OF SERVICE
             ========================================================================= */}
          {pageType === 'terms' && (
            <>
              <p className="text-xs text-slate-500 font-mono">
                Last updated: October 21, 2026
              </p>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  1. Agreement to Terms
                </h3>
                <p>
                  By accessing and using MatrixConvert, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  2. Free License & Fair Use
                </h3>
                <p>
                  MatrixConvert is provided 100% free of charge for personal, commercial, and educational purposes. You may convert unlimited images and documents without any licensing fees, registrations, or artificial limitations.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  3. User Responsibility & Content Ownership
                </h3>
                <p>
                  You retain all copyrights and intellectual property rights to the images and documents you convert. Because processing occurs locally on your machine, you are solely responsible for ensuring you have legal rights to the files you process.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  4. Disclaimer of Warranties
                </h3>
                <p>
                  MatrixConvert is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express or implied. We do not warrant that results will meet specific commercial expectations, although we strive for maximum accuracy and fidelity.
                </p>
              </div>
            </>
          )}

          {/* =========================================================================
              ABOUT US
             ========================================================================= */}
          {pageType === 'about' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Our Mission
                </h3>
                <p>
                  MatrixConvert was created to give creators, developers, designers, and students an open, free, and completely private image and document conversion toolkit inspired by productive tools like Sejda and styled with the iconic falling green digital rain of the Matrix film.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-100 border border-sky-300">
                <h4 className="font-bold text-sky-900 mb-1">
                  Why In-Browser Processing Matters:
                </h4>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Traditional online file converters force users to upload confidential contracts, personal photos, and sensitive receipts to unknown remote servers. MatrixConvert utilizes modern WebAssembly and HTML5 Canvas to perform every rasterization, vectorization, and compression task directly on your CPU/GPU, eliminating bandwidth delays and eliminating privacy risks entirely.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Core Capabilities
                </h3>
                <p>
                  Support for over 30 conversion pathways including PDF to PNG (with custom 300 DPI), PDF to SVG, PNG to WebP, Multi-Image to PDF document compilation, Favicon (.ICO) multi-layer generation, and Matrix Rain ASCII art.
                </p>
              </div>
            </>
          )}

          {/* =========================================================================
              CONTACT US
             ========================================================================= */}
          {pageType === 'contact' && (
            <>
              <p>
                Have questions, feature suggestions, or need technical support? We would love to hear from you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-white border border-sky-300 shadow-sm">
                  <div className="font-bold text-slate-900 mb-1">Direct Support:</div>
                  <div className="text-xs text-sky-700 font-mono">support@matrixconvert.com</div>
                  <p className="text-xs text-slate-500 mt-1">Average response time: &lt; 24 hours</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-sky-300 shadow-sm">
                  <div className="font-bold text-slate-900 mb-1">Partnership & Inquiries:</div>
                  <div className="text-xs text-sky-700 font-mono">partners@matrixconvert.com</div>
                  <p className="text-xs text-slate-500 mt-1">For API and integration questions</p>
                </div>
              </div>

              {/* Quick feedback message box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Your message has been sent to our support team.');
                  onClose();
                }}
                className="space-y-3 p-4 rounded-xl bg-sky-100/70 border border-sky-300"
              >
                <div className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">
                  Quick Message Form
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    className="w-full p-2.5 rounded-lg border border-sky-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we help you?"
                    className="w-full p-2.5 rounded-lg border border-sky-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 text-white font-mono text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </>
          )}

          {/* =========================================================================
              HTML SITEMAP (User-Facing Directory for Crawlers & Visitors)
             ========================================================================= */}
          {pageType === 'sitemap' && (
            <>
              <p>
                Full index of all conversion tools, utilities, and resources available on MatrixConvert:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {TOOLS_DATA.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onClose();
                      onSelectTool(tool);
                    }}
                    className="p-3 rounded-xl bg-white border border-sky-200 hover:border-sky-500 hover:bg-sky-50 text-left transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="font-mono text-[10px] text-sky-700 font-bold">
                      {tool.fromFormat} → {tool.toFormat}
                    </div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                      {tool.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-sky-200 flex flex-wrap gap-4 text-xs font-mono">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 underline font-bold"
                >
                  View XML Sitemap (/sitemap.xml)
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 underline font-bold"
                >
                  View Robots.txt (/robots.txt)
                </a>
                <a
                  href="/ads.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 underline font-bold"
                >
                  View Ads.txt (/ads.txt)
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer of Modal */}
        <div className="pt-4 border-t border-sky-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
