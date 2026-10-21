import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getTranslation } from '../data/languages';

interface HowToGuidesSectionProps {
  onSelectToolBySlug: (slug: string) => void;
  currentLang: string;
}

export const HowToGuidesSection: React.FC<HowToGuidesSectionProps> = ({
  onSelectToolBySlug,
  currentLang
}) => {
  const t = (k: string) => getTranslation(currentLang, k);

  const guides = [
    {
      title: 'How to convert PDF to high-resolution PNG',
      slug: 'pdf-to-png',
      steps: [
        'Open your document with the PDF to PNG converter.',
        'Choose your desired resolution: 72 DPI for web, 150 DPI for screens, or 300 DPI for print.',
        'Select transparent margins or clean solid white background.',
        'Click Convert and download individual PNG pages or the complete ZIP bundle.'
      ]
    },
    {
      title: 'How to convert PDF to scalable vector SVG',
      slug: 'pdf-to-svg',
      steps: [
        'Upload your PDF schematic, logo, or document into the PDF to SVG engine.',
        'The vectorizer preserves mathematical path curves and layout geometry.',
        'Export standard SVG 1.1/2.0 files ready for Illustrator, Figma, or Webflow.',
        'Scale infinitely without experiencing pixelation or blurry edges.'
      ]
    },
    {
      title: 'How to convert PNG to next-gen WebP',
      slug: 'png-to-webp',
      steps: [
        'Drop your PNG images with or without transparent backgrounds.',
        'Select compression quality (recommended: 85-90% for maximum savings).',
        'Cut file payload by 25% to 75% compared to original PNGs.',
        'Pass Google Core Web Vitals (LCP) with ultra-fast loading speeds.'
      ]
    },
    {
      title: 'How to combine multiple images into one PDF',
      slug: 'image-to-pdf',
      steps: [
        'Select your collection of JPG, PNG, or WebP photos.',
        'Drag and drop to arrange pages in your preferred sequential order.',
        'Standardize on clean A4 or US Letter paper dimensions with margins.',
        'Download your merged, paginated PDF document instantly.'
      ]
    }
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-sky-400/20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-sky-400 mb-2 uppercase tracking-wider font-bold">
          <BookOpen className="w-4 h-4" />
          <span>Practical Tutorials & Guides</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('howToTitle')}
        </h2>
        <p className="text-sm text-sky-100 max-w-xl mx-auto mt-2">
          {t('howToSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border-2 border-sky-300 bg-[#f0f9ff] shadow-xl flex flex-col justify-between text-slate-800"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>{guide.title}</span>
              </h3>
              <ol className="space-y-3 mb-6">
                {guide.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed font-medium">
                    <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => onSelectToolBySlug(guide.slug)}
              className="text-xs font-mono text-sky-700 font-bold flex items-center gap-1.5 hover:text-sky-900 transition-colors cursor-pointer group pt-3 border-t border-sky-200"
            >
              <span>{t('openTool')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
