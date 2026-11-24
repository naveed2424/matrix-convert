import React from 'react';
import {
  SUPPORTED_LANGUAGES,
  getNavTranslation,
  normalizeUiLangCode
} from '../data/languages';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolDefinition } from '../types';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { CompanyPageType } from './CompanyPages';

interface FooterProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectLang: (code: string) => void;
  onNavigateCompanyPage: (type: CompanyPageType) => void;
  onNavigateBlog: () => void;
  onNavigateMethodology: () => void;
  currentLang: string;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTool,
  onSelectLang,
  onNavigateCompanyPage,
  onNavigateBlog,
  onNavigateMethodology,
  currentLang
}) => {
  const normLang = normalizeUiLangCode(currentLang);
  const navT = getNavTranslation(normLang);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-14 pb-12 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand */}
        <div className="col-span-2 lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white notranslate" translate="no">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono text-xs font-extrabold flex items-center justify-center">
              M
            </span>
            <span>Mimage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed notranslate" translate="no">
            {navT.footerTagline}
          </p>
          <div className="pt-1 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium notranslate" translate="no">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{navT.browserLocal}</span>
          </div>
          <div className="pt-1">
            <a
              href="https://fixpdf.org/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-sky-400 font-semibold hover:underline"
            >
              <span>fixpdf.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Col 2: Signature & Creator Tools */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-3 uppercase tracking-wider text-[11px] notranslate" translate="no">
            {navT.signatureHeading}
          </h4>
          <ul className="space-y-2">
            {[
              { id: 'smart-assistant', name: 'Smart File Assistant' },
              { id: 'optimization-studio', name: 'Image Optimization Studio' },
              { id: 'website-image-audit', name: 'Website Image Audit' },
              { id: 'compress-image-to-100kb', name: 'Compress Image to 100 KB' },
              { id: 'resize-image-for-instagram', name: 'Social Media Resizer' },
              { id: 'remove-image-metadata', name: 'EXIF Viewer & Remover' }
            ].map((item) => {
              const found = TOOLS_DATA.find((t) => t.slug === item.id || t.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => found && onSelectTool(found)}
                    className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors text-left cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Col 3: PDF & Converters */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-3 uppercase tracking-wider text-[11px] notranslate" translate="no">
            {navT.pdfConvertersHeading}
          </h4>
          <ul className="space-y-2">
            {[
              { id: 'merge-pdf', name: 'Merge PDF' },
              { id: 'pdf-organizer', name: 'PDF Organizer' },
              { id: 'pdf-compress', name: 'PDF Compressor' },
              { id: 'pdf-to-png', name: 'PDF to PNG / JPG' },
              { id: 'image-to-pdf', name: 'Image to PDF' },
              { id: 'ocr-extract-text', name: 'OCR Text Extraction' }
            ].map((item) => {
              const found = TOOLS_DATA.find((t) => t.slug === item.id || t.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => found && onSelectTool(found)}
                    className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors text-left cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Col 4: Trust & Policies */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-3 uppercase tracking-wider text-[11px] notranslate" translate="no">
            {navT.trustPolicies}
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigateCompanyPage('privacy-center')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left font-semibold text-emerald-700 dark:text-emerald-400"
              >
                Privacy Center
              </button>
            </li>
            <li>
              <button
                onClick={onNavigateMethodology}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Diagnostics &amp; Methodology
              </button>
            </li>
            <li>
              <button
                onClick={onNavigateBlog}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Guides &amp; Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('about')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                About Mimage
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('portfolio')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Founder Portfolio
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('privacy')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('cookies')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Cookie Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('terms')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('contact')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Contact Support
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateCompanyPage('sitemap')}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                HTML Sitemap
              </button>
            </li>
          </ul>
        </div>

        {/* Col 5: Global Languages */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-slate-900 dark:text-white font-bold mb-3 uppercase tracking-wider text-[11px] notranslate" translate="no">
            {navT.languages}
          </h4>
          <ul className="space-y-1.5 grid grid-cols-2 gap-x-2">
            {SUPPORTED_LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => onSelectLang(l.code)}
                  className={`hover:text-blue-600 dark:hover:text-sky-400 transition-colors text-left cursor-pointer notranslate ${
                    normLang === l.code ? 'text-blue-600 dark:text-sky-400 font-bold' : ''
                  }`}
                  translate="no"
                >
                  {l.nativeName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} Mimage (fixpdf.org). Free Online File &amp; Image Tools.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onNavigateCompanyPage('privacy-center')}
            className="hover:text-blue-600 dark:hover:text-sky-400 underline cursor-pointer"
          >
            Privacy Center
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigateCompanyPage('terms')}
            className="hover:text-blue-600 dark:hover:text-sky-400 underline cursor-pointer"
          >
            Terms
          </button>
          <span>·</span>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-sky-400 underline">
            XML Sitemap
          </a>
          <span>·</span>
          <a href="/ads.txt" target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-sky-400 underline">
            ads.txt
          </a>
        </div>
      </div>
    </footer>
  );
};
