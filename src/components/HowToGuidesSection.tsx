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
        'Select transparent margins or solid white background.',
        'Click Convert and download individual PNG pages or the complete ZIP bundle.'
      ]
    },
    {
      title: 'How to convert PDF to scalable SVG',
      slug: 'pdf-to-svg',
      steps: [
        'Upload your PDF schematic, logo, or document into the PDF to SVG converter.',
        'Preserve scalable layout proportions across pages.',
        'Export standard SVG files ready for Illustrator, Figma, or Webflow.',
        'Inspect vector results before deploying on production web pages.'
      ]
    },
    {
      title: 'How to compress images to an exact KB target',
      slug: 'compress-image-to-100kb',
      steps: [
        'Drop your JPG, PNG, or WebP photo into the Exact Size Image Compressor.',
        'Select 100 KB, 200 KB, 500 KB, or enter any custom KB target.',
        'Allow adaptive quality search and optional dimension downscaling if needed.',
        'Inspect the before/after visual comparison slider before downloading.'
      ]
    },
    {
      title: 'How to place a signature graphic on a PDF',
      slug: 'fill-and-sign-pdf',
      steps: [
        'Open your PDF document inside the Fill & Sign PDF workspace.',
        'Type, draw, or upload a signature graphic and place an optional date line.',
        'Drag and resize the placement box onto your chosen signature field.',
        'Export the stamped PDF locally in your browser (graphic placement only; not a legal certificate).'
      ]
    },
    {
      title: 'How to strip hidden EXIF & GPS camera metadata',
      slug: 'remove-image-metadata',
      steps: [
        'Upload any JPEG or PNG photo to inspect embedded camera model and GPS tags.',
        'Click Strip Metadata & Clean to re-encode pixels into a clean container.',
        'Confirm zero EXIF markers remain in the verified post-clean audit.',
        'Download the cleaned file for safer public sharing.'
      ]
    },
    {
      title: 'How to combine multiple images into one PDF',
      slug: 'image-to-pdf',
      steps: [
        'Select your collection of JPG, PNG, or WebP photos.',
        'Check file order inside your browser conversion queue.',
        'Compile pages cleanly into a single paginated PDF document.',
        'Download the merged PDF file immediately.'
      ]
    }
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-blue-600 dark:text-sky-400 mb-2 uppercase tracking-wider font-bold">
          <BookOpen className="w-4 h-4" />
          <span>Educational Workflows &amp; Guides</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('howToTitle')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mt-2">
          {t('howToSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-xs flex flex-col justify-between text-slate-800 dark:text-slate-200"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {guide.title}
              </h3>
              <ol className="space-y-3 mb-6">
                {guide.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => onSelectToolBySlug(guide.slug)}
              className="text-xs font-mono text-blue-600 dark:text-sky-400 font-semibold flex items-center gap-1.5 hover:underline cursor-pointer group pt-3 border-t border-slate-100 dark:border-slate-800"
            >
              <span>{t('openTool')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
