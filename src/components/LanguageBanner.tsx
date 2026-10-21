import React, { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/languages';

interface LanguageBannerProps {
  currentLang: string;
  onSelectLang: (code: string) => void;
}

export const LanguageBanner: React.FC<LanguageBannerProps> = ({ currentLang, onSelectLang }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Find a suggested alternate language based on locale or common international users
  const suggestedLang = currentLang === 'en' ? 'fr' : 'en';
  const suggestedObj = SUPPORTED_LANGUAGES.find((l) => l.code === suggestedLang)!;

  const message =
    suggestedLang === 'fr'
      ? 'MatrixConvert est disponible en français.'
      : 'MatrixConvert is also available in English.';

  const actionText = suggestedLang === 'fr' ? 'Changer de langue ?' : 'Switch to English?';

  return (
    <div className="bg-[#00ff66]/10 border-b border-[#00ff66]/20 px-4 py-2 text-xs text-[#b8dbca]">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Globe className="w-3.5 h-3.5 text-[#00ff66]" />
          <span>{message}</span>
          <button
            onClick={() => onSelectLang(suggestedLang)}
            className="text-[#00ff66] underline hover:text-white font-medium ml-1 transition-colors cursor-pointer"
          >
            {actionText}
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#789d8c] hover:text-white p-1 transition-colors hidden sm:block cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
