import React from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolDefinition } from '../types';
import { ShieldCheck, Heart, Terminal } from 'lucide-react';

interface FooterProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectLang: (code: string) => void;
  currentLang: string;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool, onSelectLang, currentLang }) => {
  const popularTools = TOOLS_DATA.slice(0, 8);
  const moreTools = TOOLS_DATA.slice(8, 16);

  return (
    <footer className="border-t border-[#00ff66]/15 bg-[#040906] text-[#82a392] pt-14 pb-12 px-4 sm:px-6 lg:px-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand & Guarantee */}
        <div className="col-span-2 lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
            <span className="text-[#00ff66] text-glow">⚡</span>
            <span>MatrixConvert</span>
          </div>
          <p className="text-[11px] text-[#719383] leading-relaxed">
            Free high-performance image & document converter inspired by Sejda with falling Matrix code rain.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[#00ff66] text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side Private</span>
          </div>
        </div>

        {/* Col 2: Popular Converters */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Popular Tools
          </h4>
          <ul className="space-y-2">
            {popularTools.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onSelectTool(t)}
                  className="hover:text-[#00ff66] transition-colors text-left truncate max-w-full block cursor-pointer"
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: More Tools */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            More Tools
          </h4>
          <ul className="space-y-2">
            {moreTools.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onSelectTool(t)}
                  className="hover:text-[#00ff66] transition-colors text-left truncate max-w-full block cursor-pointer"
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Extensive Languages (Inspired by Sejda's 20+ Language List) */}
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Languages
          </h4>
          <ul className="space-y-1.5 grid grid-cols-2 gap-x-2">
            {SUPPORTED_LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => onSelectLang(l.code)}
                  className={`hover:text-[#00ff66] transition-colors text-left flex items-center gap-1 cursor-pointer ${
                    currentLang === l.code ? 'text-[#00ff66] font-bold' : ''
                  }`}
                >
                  <span>{l.nativeName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 5: Security & Architecture */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
            Security & Netlify
          </h4>
          <p className="text-[11px] text-[#719383] leading-relaxed mb-3">
            Pure client-side static compilation. Deployable on Netlify with zero server dependencies.
          </p>
          <div className="p-3 rounded-lg bg-[#07140c] border border-[#00ff66]/15 text-[10px] space-y-1">
            <div className="text-white font-semibold">Privacy Pledge:</div>
            <div>• Zero files uploaded</div>
            <div>• No cloud storage</div>
            <div>• Instant local memory cleanup</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#00ff66]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#608071]">
        <div>
          © {new Date().getFullYear()} MatrixConvert. Fully free for everyone.
        </div>
        <div className="flex items-center gap-4">
          <span>HTML5 Canvas & WebAssembly</span>
          <span>•</span>
          <span>Ready for Netlify Deploy</span>
        </div>
      </div>
    </footer>
  );
};
