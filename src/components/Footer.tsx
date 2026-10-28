import React from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolDefinition } from '../types';
import { ShieldCheck, FileText, Info, Mail, Map, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { LegalPageType } from './LegalPagesModal';

interface FooterProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectLang: (code: string) => void;
  onOpenLegalPage: (type: LegalPageType) => void;
  onNavigateBlog?: () => void;
  onNavigateStudio?: () => void;
  currentLang: string;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTool,
  onSelectLang,
  onOpenLegalPage,
  onNavigateBlog,
  onNavigateStudio,
  currentLang
}) => {
  const popularTools = TOOLS_DATA.slice(0, 6);
  const moreTools = TOOLS_DATA.slice(6, 12);

  return (
    <footer className="border-t border-sky-400/25 bg-[#030908] text-slate-400 pt-14 pb-12 px-4 sm:px-6 lg:px-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand, Guarantee & Live Link */}
        <div className="col-span-2 lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
            <span className="text-sky-400 text-glow">⚡</span>
            <span>MatrixConvert</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Free high-performance image & document converter inspired by Sejda with falling Matrix digital code rain.
          </p>
          <div className="pt-1 flex items-center gap-2 text-sky-400 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side Private</span>
          </div>
          <div className="pt-2">
            <a
              href="https://mimage.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-300 font-bold hover:underline"
            >
              <span>Production: mimage.netlify.app</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Col 2: PDF & Document Suite */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px] text-sky-400">
            PDF Suite (Sejda-Grade)
          </h4>
          <ul className="space-y-2">
            {[
              { id: 'fill-and-sign-pdf', name: 'Fill & Sign PDF' },
              { id: 'crop-pdf-margins', name: 'Crop PDF Margins' },
              { id: 'merge-pdf', name: 'Merge PDF Files' },
              { id: 'split-pdf', name: 'Split & Extract Pages' },
              { id: 'delete-pdf-pages', name: 'Delete PDF Pages' },
              { id: 'rotate-pdf', name: 'Rotate PDF Pages' }
            ].map((item) => {
              const found = TOOLS_DATA.find((t) => t.slug === item.id || t.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => found && onSelectTool(found)}
                    className="hover:text-sky-300 transition-colors text-left truncate max-w-full block cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Col 3: Popular Converters */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Image & Vector Tools
          </h4>
          <ul className="space-y-2">
            {[
              { id: 'pdf-to-png', name: 'PDF to PNG Converter' },
              { id: 'pdf-to-svg', name: 'PDF to SVG Vector' },
              { id: 'image-to-pdf', name: 'Images to PDF' },
              { id: 'png-to-webp', name: 'PNG to WebP' },
              { id: 'png-to-ico', name: 'PNG to ICO Favicon' },
              { id: 'pdf-to-text', name: 'PDF to Text Extractor' }
            ].map((item) => {
              const found = TOOLS_DATA.find((t) => t.slug === item.id || t.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => found && onSelectTool(found)}
                    className="hover:text-sky-400 transition-colors text-left truncate max-w-full block cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Col 4: AdSense & Legal Compliance */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Legal & Compliance
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onOpenLegalPage('about')}
                className="hover:text-sky-400 transition-colors cursor-pointer text-left font-semibold text-white"
              >
                About MatrixConvert
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegalPage('privacy')}
                className="hover:text-sky-400 transition-colors cursor-pointer text-left text-sky-300 font-semibold"
              >
                Privacy Policy (GDPR/CCPA)
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegalPage('terms')}
                className="hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegalPage('contact')}
                className="hover:text-sky-400 transition-colors cursor-pointer text-left"
              >
                Contact & Support
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegalPage('sitemap')}
                className="hover:text-sky-400 transition-colors cursor-pointer text-left font-bold text-sky-400"
              >
                HTML Sitemap
              </button>
            </li>
            <li className="pt-1">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
              >
                XML Sitemap (/sitemap.xml)
              </a>
            </li>
            <li>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
              >
                Ads.txt (/ads.txt)
              </a>
            </li>
          </ul>
        </div>

        {/* Col 5: Global Languages */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Languages
          </h4>
          <ul className="space-y-1.5 grid grid-cols-2 gap-x-2">
            {SUPPORTED_LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => onSelectLang(l.code)}
                  className={`hover:text-sky-400 transition-colors text-left flex items-center gap-1 cursor-pointer ${
                    currentLang === l.code ? 'text-sky-400 font-bold' : ''
                  }`}
                >
                  <span>{l.nativeName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-sky-400/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} MatrixConvert. 100% Client-Side In-Browser. Google AdSense & SEO compliant.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenLegalPage('privacy')}
            className="hover:text-sky-400 underline cursor-pointer"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegalPage('terms')}
            className="hover:text-sky-400 underline cursor-pointer"
          >
            Terms
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegalPage('sitemap')}
            className="hover:text-sky-400 underline cursor-pointer font-bold text-sky-400"
          >
            Sitemap
          </button>
          <span>•</span>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-400 underline"
          >
            Robots.txt
          </a>
        </div>
      </div>
    </footer>
  );
};
