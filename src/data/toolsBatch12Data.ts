import { ToolDefinition, MimageCategoryId } from '../types';

const CATEGORY_LABELS: Record<MimageCategoryId, string> = {
  'image-tools': 'Image Tools',
  'pdf-tools': 'PDF Tools',
  'file-converters': 'File Converters',
  'gif-video-tools': 'GIF & Video Tools',
  'privacy-tools': 'Privacy Tools',
  'design-tools': 'Design Tools',
  'developer-tools': 'Developer Tools'
};

interface Batch12ToolConfig {
  id: string;
  name: string;
  category: MimageCategoryId;
  fromFormat: string;
  toFormat: string;
  badge: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  shortDescription: string;
  longDescription: string;
  acceptedFileTypes: string[];
  whoCanUse: { persona: string; useCase: string }[];
  whereToUse: { scenario: string; benefit: string }[];
  steps: { title: string; description: string }[];
  formatComparison: { feature: string; fromVal: string; toVal: string }[];
  shortTail: string[];
  longTail: string[];
  faq: { question: string; answer: string }[];
  limitations: string[];
  troubleshooting: { issue: string; fix: string }[];
  options?: ToolDefinition['options'];
}

function createBatch12Tool(cfg: Batch12ToolConfig): ToolDefinition {
  return {
    id: cfg.id,
    name: cfg.name,
    slug: cfg.id,
    category: cfg.category,
    categoryName: CATEGORY_LABELS[cfg.category],
    fromFormat: cfg.fromFormat,
    toFormat: cfg.toFormat,
    badge: cfg.badge,
    isPopular: cfg.isPopular ?? false,
    isRecentlyAdded: true,
    isRecommended: cfg.isRecommended ?? false,
    processingMode: 'browser-local',
    maxRecommendedSizeMb: 60,
    shortDescription: cfg.shortDescription,
    longDescription: cfg.longDescription,
    acceptedFileTypes: cfg.acceptedFileTypes,
    limitations: cfg.limitations,
    troubleshooting: cfg.troubleshooting,
    whoCanUse: cfg.whoCanUse,
    whereToUse: cfg.whereToUse,
    steps: cfg.steps.map((s, idx) => ({
      step: idx + 1,
      title: s.title,
      description: s.description
    })),
    formatComparison: cfg.formatComparison,
    seoKeywords: {
      shortTail: cfg.shortTail,
      longTail: cfg.longTail
    },
    faq: cfg.faq,
    options: cfg.options ?? {}
  };
}

export const BATCH12_CONVERTER_TOOLS: ToolDefinition[] = [
  // 1. PNG to JPG Converter (resolves direct-to-tool link in ToolsGrid!)
  createBatch12Tool({
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    category: 'file-converters',
    fromFormat: 'PNG',
    toFormat: 'JPG',
    badge: 'Fast Size Reduction',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Convert heavy lossless PNG graphics into compact, universally shareable JPG photos with automatic background flattening.',
    longDescription: 'Shrink oversized PNG screenshots, camera exports, and digital artwork into lightweight JPEG photographs right in your browser. Choose your JPEG quality slider (30%–100%) and fill transparent PNG margins cleanly with white or deep dark canvas before downloading.',
    acceptedFileTypes: ['.png', 'image/png'],
    whoCanUse: [
      { persona: 'E-Commerce Sellers', useCase: 'Convert product screenshots from heavy multi-megabyte PNGs into fast-loading JPGs for Amazon, Shopify, and Etsy.' },
      { persona: 'Content Creators & Bloggers', useCase: 'Shrink macOS and Windows PNG retina screenshots by up to 80% for email newsletters and CMS uploads.' }
    ],
    whereToUse: [
      { scenario: 'Upload Portal Size Limits', benefit: 'Instantly pass strict 1 MB or 2 MB image upload restrictions on government or job application forms.' },
      { scenario: 'Transparent PNG Background Flattening', benefit: 'Automatically replaces alpha transparency with crisp solid white rather than black artifacts.' }
    ],
    steps: [
      { title: 'Drop Your PNG Files', description: 'Select one or more PNG screenshots or transparent logos.' },
      { title: 'Adjust JPEG Quality', description: 'Pick quality (85–90% is ideal for photography) and choose white or black backdrop canvas.' },
      { title: 'Download Compact JPGs', description: 'Save individual files or download all converted JPGs together inside a single ZIP.' }
    ],
    formatComparison: [
      { feature: 'Compression Engine', fromVal: 'Lossless DEFLATE (Large photos)', toVal: 'Discrete Cosine Transform JPEG (Compact)' },
      { feature: 'Transparency', fromVal: 'Full 8-bit alpha channel', toVal: 'Solid matte canvas (White / Dark)' },
      { feature: 'Typical Photo File Size', fromVal: '3 MB – 12 MB screenshots', toVal: '200 KB – 900 KB fast sharing' }
    ],
    shortTail: ['png to jpg', 'convert png to jpg', 'png to jpeg online', 'transparent png to jpg'],
    longTail: ['convert png to jpg without losing quality free browser', 'batch convert transparent png to white background jpg'],
    faq: [
      { question: 'What happens to transparent areas when converting PNG to JPG?', answer: 'Because JPEG does not support alpha transparency, Mimage automatically paints a clean white (or selectable dark) canvas underneath before encoding so dark lines remain legible.' },
      { question: 'Does my PNG leave my computer?', answer: 'Never. Decoding and JPEG re-encoding happen strictly inside your browser Canvas memory.' }
    ],
    limitations: ['JPEG is a flat raster format and permanently drops alpha transparency channels.'],
    troubleshooting: [
      { issue: 'Text looks slightly blurry', fix: 'Increase the Quality slider to 95% when converting crisp UI screenshots or typography.' }
    ],
    options: { supportsQuality: true, supportsBackground: true }
  }),

  // 2. WebP to AVIF Converter
  createBatch12Tool({
    id: 'webp-to-avif',
    name: 'WebP to AVIF Converter',
    category: 'file-converters',
    fromFormat: 'WEBP',
    toFormat: 'AVIF',
    badge: 'Next-Gen Compression',
    isPopular: true,
    shortDescription: 'Upgrade WebP assets to ultra-compact AV1 AVIF format for maximum Google Lighthouse & Core Web Vitals speed.',
    longDescription: 'Convert existing WebP images into the royalty-free AVIF (AV1 Image File Format) natively inside Chromium and modern desktop browsers. Typically achieves 20%–35% smaller payloads than WebP at matched visual quality.',
    acceptedFileTypes: ['.webp', 'image/webp'],
    whoCanUse: [
      { persona: 'Performance Engineers', useCase: 'Upgrade LCP hero banners from WebP to AVIF to shave crucial milliseconds off Largest Contentful Paint.' },
      { persona: 'CDN & Cloud Architects', useCase: 'Pre-generate compact AVIF `<picture>` sources locally without paying per-image cloud transformation fees.' }
    ],
    whereToUse: [
      { scenario: 'Core Web Vitals Audits', benefit: 'Resolve Lighthouse "Serve images in next-gen formats" hints with high-efficiency AV1 bitstreams.' }
    ],
    steps: [
      { title: 'Add WebP Images', description: 'Drop WebP photographs, banners, or UI assets.' },
      { title: 'Set AVIF Quality Target', description: 'Choose compression quality (75–85% delivers sharp results at minimal bytes).' },
      { title: 'Encode & Save AVIF', description: 'Download compliant `.avif` files locally.' }
    ],
    formatComparison: [
      { feature: 'Codec Lineage', fromVal: 'VP8 / VP8L (2010)', toVal: 'AV1 Intra-Frame (Modern HDR-capable)' },
      { feature: 'File Size Efficiency', fromVal: 'Baseline next-gen web', toVal: '20%–35% smaller than WebP' }
    ],
    shortTail: ['webp to avif', 'convert webp to avif', 'avif encoder online'],
    longTail: ['convert webp images to avif for faster core web vitals'],
    faq: [
      { question: 'Which browsers support client-side AVIF encoding?', answer: 'Chrome, Edge, Opera, and modern desktop Firefox support native `canvas.toBlob("image/avif")`. Older Safari versions can decode AVIF but may not encode it natively; Mimage alerts you clearly if your browser lacks the encoder.' }
    ],
    limitations: ['Client-side AVIF encoding relies on the host browser Canvas AVIF codec (supported in modern Chrome/Edge/Firefox).'],
    troubleshooting: [
      { issue: 'Browser says AVIF encoding unsupported', fix: 'Switch to desktop Chrome or Edge, or target WebP instead.' }
    ],
    options: { supportsQuality: true }
  }),

  // 3. AVIF to WebP Converter
  createBatch12Tool({
    id: 'avif-to-webp',
    name: 'AVIF to WebP Converter',
    category: 'file-converters',
    fromFormat: 'AVIF',
    toFormat: 'WEBP',
    badge: 'Universal Web Support',
    shortDescription: 'Convert AVIF images to widely supported WebP while preserving alpha transparency and small file footprint.',
    longDescription: 'Bridge compatibility gaps when older CMS plugins, Shopify themes, or social tools reject `.avif` uploads. Re-encode AVIF assets locally into high-efficiency `.webp` with instant browser speed.',
    acceptedFileTypes: ['.avif', 'image/avif'],
    whoCanUse: [
      { persona: 'WordPress & CMS Editors', useCase: 'Convert modern AVIF downloads into WebP so legacy media libraries import them smoothly.' },
      { persona: 'Email & Social Marketers', useCase: 'Keep near-identical compression while ensuring reliable rendering on every mobile client.' }
    ],
    whereToUse: [
      { scenario: 'CMS & SaaS Import Pipelines', benefit: 'Fix "unsupported .avif format" errors without reverting all the way back to bloated PNGs.' }
    ],
    steps: [
      { title: 'Drop AVIF Files', description: 'Load single or batch `.avif` files.' },
      { title: 'Adjust WebP Quality', description: 'Select 80–95% quality.' },
      { title: 'Download WebP', description: 'Save universally supported `.webp` graphics.' }
    ],
    formatComparison: [
      { feature: 'CMS Support', fromVal: 'Newer browsers & CDNs only', toVal: '97%+ browser & CMS adoption' },
      { feature: 'Transparency', fromVal: 'Supported', toVal: 'Preserved natively' }
    ],
    shortTail: ['avif to webp', 'convert avif to webp', 'avif converter'],
    longTail: ['convert avif to webp keeping transparency browser local'],
    faq: [
      { question: 'Does converting AVIF to WebP preserve transparent pixels?', answer: 'Yes, transparent alpha regions remain fully transparent inside the resulting WebP file.' }
    ],
    limitations: ['Decoding AVIF requires a browser build with AVIF decode support (Chrome 85+, Firefox 93+, Safari 16+).'],
    troubleshooting: [
      { issue: 'Image fails to load', fix: 'Update your browser if running an outdated OS build older than 2022.' }
    ],
    options: { supportsQuality: true }
  }),

  // 4. JPG to SVG Vectorizer
  createBatch12Tool({
    id: 'jpg-to-svg',
    name: 'JPG to SVG Vectorizer',
    category: 'design-tools',
    fromFormat: 'JPG',
    toFormat: 'SVG',
    badge: 'Color Vector Trace',
    isPopular: true,
    shortDescription: 'Trace JPG logos, badges, and illustrations into real quantized XML SVG vector paths inside your browser.',
    longDescription: 'Transform raster JPG sketches, logos, and geometric artwork into true XML vector `<path>` layers grouped by quantized color. Great for scalable web badges, laser-cutter references, and stylized poster graphics.',
    acceptedFileTypes: ['.jpg', '.jpeg', 'image/jpeg'],
    whoCanUse: [
      { persona: 'Logo & Print Designers', useCase: 'Quickly vectorize flat JPG client logos into resolution-independent SVG paths.' },
      { persona: 'Front-End Developers', useCase: 'Inspect crisp quantized SVG markup for stylized hero shapes and icons.' }
    ],
    whereToUse: [
      { scenario: 'Legacy Raster Brand Logos', benefit: 'Convert low-res `.jpg` stamps into scalable `<svg>` code without Adobe Illustrator.' }
    ],
    steps: [
      { title: 'Select JPG Artwork', description: 'Drop a high-contrast JPG logo, badge, or graphic.' },
      { title: 'Choose Color Precision', description: 'Higher Quality keeps finer palette shades; lower Quality merges flat brand colors.' },
      { title: 'Download XML SVG', description: 'Save the vectorized `.svg` or copy its XML path markup directly.' }
    ],
    formatComparison: [
      { feature: 'Output Geometry', fromVal: 'Fixed JPEG pixel grid', toVal: 'Run-length SVG XML <path> layers' },
      { feature: 'Infinite Zoom', fromVal: 'Blurs & exhibits JPEG ringing', toVal: 'Sharp vector paths at any scale' }
    ],
    shortTail: ['jpg to svg', 'convert jpg to svg', 'jpg vectorizer free', 'image to vector'],
    longTail: ['convert jpg logo to svg vector paths free online no sign up'],
    faq: [
      { question: 'Does this emit real vector paths instead of wrapping a JPG inside SVG?', answer: 'Yes! Mimage quantizes your image palette and merges adjacent pixels into genuine run-length `<path>` XML instructions.' }
    ],
    limitations: ['Detailed photographs produce mosaic-style quantized SVG geometry; crisp logos and illustrations yield the cleanest vector results.'],
    troubleshooting: [
      { issue: 'Too many color layers on noisy photos', fix: 'Lower the Quality slider below 80% before clicking Convert to group similar shades.' }
    ],
    options: { supportsQuality: true }
  }),

  // 5. GIF to PNG Frame Converter
  createBatch12Tool({
    id: 'gif-to-png',
    name: 'GIF to PNG Frame Converter',
    category: 'gif-video-tools',
    fromFormat: 'GIF',
    toFormat: 'PNG',
    badge: 'Truecolor Alpha Upgrade',
    shortDescription: 'Convert legacy 256-color GIF stickers and sprites into crisp 32-bit lossless PNG graphics with transparency.',
    longDescription: 'Extract clean static frames from `.gif` icons, pixel sprites, or animated stickers as 32-bit RGBA `.png` images. Perfect for upgrading 8-bit palette graphics before editing in Figma, Canva, or game engines.',
    acceptedFileTypes: ['.gif', 'image/gif'],
    whoCanUse: [
      { persona: 'Indie Game Developers', useCase: 'Upgrade legacy 8-bit `.gif` tilesets and sprites into crisp RGBA `.png` textures.' },
      { persona: 'UI & Document Editors', useCase: 'Convert static GIF badges into universally printable PNG assets for PDFs and slides.' }
    ],
    whereToUse: [
      { scenario: 'Document & PDF Reports', benefit: 'Replace animated GIF loops with a clean crisp static frame ready for print.' }
    ],
    steps: [
      { title: 'Drop GIF Files', description: 'Select `.gif` stickers, icons, or pixel sprites.' },
      { title: 'Keep Alpha or Add Matte', description: 'Preserve transparent cutouts or flatten onto solid white.' },
      { title: 'Download PNG', description: 'Save your upgraded 32-bit PNG immediately.' }
    ],
    formatComparison: [
      { feature: 'Color Depth', fromVal: 'Max 256 indexed palette colors', toVal: '16.7M truecolor RGB + 8-bit alpha' },
      { feature: 'Motion', fromVal: 'Multi-frame LZW loop', toVal: 'Static high-clarity keyframe' }
    ],
    shortTail: ['gif to png', 'convert gif to png', 'gif frame to png'],
    longTail: ['convert transparent gif to lossless png online free'],
    faq: [
      { question: 'Does GIF to PNG preserve transparent backgrounds?', answer: 'Yes. Select Transparent canvas mode to retain clean cutout pixels from the source GIF frame.' }
    ],
    limitations: ['Extracts the primary rendered frame as a static PNG rather than multi-frame ZIP layers.'],
    troubleshooting: [
      { issue: 'Need multi-frame animation editing', fix: 'Use Mimage GIF Maker & Compressor tools for frame-sequence workflows.' }
    ],
    options: { supportsBackground: true }
  }),

  // 6. Circle Avatar & Rounded Corner PNG Maker
  createBatch12Tool({
    id: 'image-round-corners',
    name: 'Rounded Corner & Avatar PNG Maker',
    category: 'design-tools',
    fromFormat: 'IMG',
    toFormat: 'PNG',
    badge: 'Transparent Alpha Corners',
    isPopular: true,
    shortDescription: 'Round sharp rectangle corners with true 8-bit alpha transparency for UI cards, app screenshots, and SaaS badges.',
    longDescription: 'Give screenshots, profile photos, and marketing cards smooth architectural rounded corners with invisible transparent outer edges. Export crisp lossless PNG files ready to overlay onto dark or colored presentations.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [
      { persona: 'SaaS Founders & Marketers', useCase: 'Round sharp dashboard screenshots before embedding inside landing pages or docs.' },
      { persona: 'App Designers', useCase: 'Prep rounded avatar cards and testimonials with seamless alpha corners.' }
    ],
    whereToUse: [
      { scenario: 'Presentations & README Files', benefit: 'Stop screenshots from showing harsh white 90-degree corners against dark UI slides.' }
    ],
    steps: [
      { title: 'Upload Image or Screenshot', description: 'Drop any JPG, PNG, or WebP picture.' },
      { title: 'Automatic Curve Masking', description: 'Precision anti-aliased Bezier corners clip outer edges cleanly to alpha 0.' },
      { title: 'Download Transparent PNG', description: 'Ready to drag into Keynote, Notion, or Figma.' }
    ],
    formatComparison: [
      { feature: 'Corner Geometry', fromVal: 'Hard 90-degree sharp corners', toVal: 'Smooth curved anti-aliased alpha corners' },
      { feature: 'Background Bleed', fromVal: 'Requires CSS border-radius everywhere', toVal: 'Baked directly into PNG transparency' }
    ],
    shortTail: ['round corners image online', 'rounded image maker', 'rounded corners png free'],
    longTail: ['add rounded corners to screenshot transparent png free online'],
    faq: [
      { question: 'Are the outer corner pixels truly transparent?', answer: 'Yes, exported as 32-bit RGBA PNG so any underlying page background shows cleanly behind the curves.' }
    ],
    limitations: ['Outputs PNG format exclusively because JPG cannot store transparent corner cutouts.'],
    troubleshooting: [
      { issue: 'Corners look opaque white', fix: 'View the PNG against a non-white canvas or dark editor; some file previews fill transparency with white.' }
    ],
    options: {}
  }),

  // 7. Photo Grid & Collage Sheet Maker
  createBatch12Tool({
    id: 'image-collage-grid',
    name: 'Photo Grid & Contact Sheet Maker',
    category: 'design-tools',
    fromFormat: 'IMG',
    toFormat: 'PNG',
    badge: 'Batch Layout Matrix',
    isRecommended: true,
    shortDescription: 'Merge 2 to 24+ photos cleanly into a balanced high-resolution PNG photo grid or visual comparison sheet.',
    longDescription: 'Arrange multiple product shots, before/after UX comparisons, moodboards, or sprite tiles into an organized, proportional grid image in one click. Zero design software needed—everything renders natively onto a single high-resolution PNG sheet.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [
      { persona: 'UI/UX Designers & QA Teams', useCase: 'Bundle multiple screen states into one clean visual comparison sheet for bug reports or case studies.' },
      { persona: 'Photographers & Sellers', useCase: 'Generate clean client contact sheets and multi-angle product showcases.' }
    ],
    whereToUse: [
      { scenario: 'Documentation & GitHub PRs', benefit: 'Compare multiple screenshots side by side in a single crisp PNG attachment.' }
    ],
    steps: [
      { title: 'Drop Multiple Images', description: 'Select 2 or more JPG, PNG, or WebP images at once.' },
      { title: 'Pick Grid Backdrop', description: 'Choose Transparent, Dark, or White spacing canvas.' },
      { title: 'Download Contact Grid PNG', description: 'All photos neatly packed without distortion or cropping.' }
    ],
    formatComparison: [
      { feature: 'Distribution', fromVal: 'Dozens of separate attachment files', toVal: 'Single organized contact sheet PNG' },
      { feature: 'Aspect Safety', fromVal: 'Manual resizing in Figma/Canva', toVal: 'Automatic aspect-locked proportional fit' }
    ],
    shortTail: ['photo collage grid maker', 'combine photos side by side', 'image contact sheet online'],
    longTail: ['combine multiple screenshots into one grid image free no watermark'],
    faq: [
      { question: 'Does the grid crop off the edges of portrait vs landscape photos?', answer: 'No—each cell uses aspect-preserving containment padding so zero visual details are cut off.' }
    ],
    limitations: ['Very large batches (30+ images) may produce tall high-pixel PNG sheets requiring extra browser RAM.'],
    troubleshooting: [
      { issue: 'Only 1 image appeared', fix: 'Select multiple files together using Ctrl/Cmd-click in the file picker or drag a batch folder.' }
    ],
    options: { supportsBackground: true }
  }),

  // 8. PDF Blank Page Auto-Remover
  createBatch12Tool({
    id: 'pdf-blank-page-remover',
    name: 'PDF Blank Page Auto-Remover',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'PDF',
    badge: 'Smart Scan Cleanup',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Automatically scan every PDF page in your browser, detect empty white duplex scanner pages, and strip them out.',
    longDescription: 'Eliminate accidental blank back-side scanner sheets and empty spacer pages inside multi-page contracts or books automatically. Mimage renders each page locally, measures non-white ink density pixel-by-pixel, and rebuilds a clean, contiguous PDF without empty gaps.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Office & Legal Teams', useCase: 'Clean duplex-scanned binders full of alternating blank verso sheets before filing or e-signing.' },
      { persona: 'Students & Researchers', useCase: 'Trim empty separator pages from course packets and scanned textbook PDFs.' }
    ],
    whereToUse: [
      { scenario: 'Duplex ADF Scanner Cleanup', benefit: 'Fixes double-sided feeder scans instantly without scrolling manually through 100 pages.' }
    ],
    steps: [
      { title: 'Upload Multi-Page PDF', description: 'Drop your scanned or exported PDF file locally.' },
      { title: 'Pixel-Level Blank Analysis', description: 'Mimage inspects every page bitmap for visible text, lines, or graphics.' },
      { title: 'Download Clean PDF', description: 'Receive a trim PDF plus a clear summary listing which blank pages were removed.' }
    ],
    formatComparison: [
      { feature: 'Scanner Workflow', fromVal: 'Manual page-by-page deletion', toVal: 'Automated pixel variance filtering' },
      { feature: 'Privacy', fromVal: 'Cloud PDF scrubbers upload confidential scans', toVal: '100% browser-local PDF reconstruction' }
    ],
    shortTail: ['remove blank pages from pdf', 'delete empty pages pdf auto', 'pdf blank page remover'],
    longTail: ['automatically remove blank scanned pages from pdf online free private'],
    faq: [
      { question: 'What if every page in a PDF is blank?', answer: 'Mimage never produces an invalid zero-page document; if zero non-blank pages are found, it preserves page 1 and displays a clear notice.' },
      { question: 'Are light gray punch-hole specks ignored?', answer: 'Pages with tiny sub-0.2% speckles are treated as blank, while pages containing real text or signatures are safely preserved.' }
    ],
    limitations: ['Cannot read password-locked encrypted PDFs without unlocking first.'],
    troubleshooting: [
      { issue: 'Faint pencil scan was removed', fix: 'Use Mimage PDF Organizer to review thumbnails manually if your scan uses extremely light contrast.' }
    ],
    options: {}
  }),

  // 9. Markdown to Clean HTML5 Converter
  createBatch12Tool({
    id: 'markdown-to-html',
    name: 'Markdown to Clean HTML5 Converter',
    category: 'developer-tools',
    fromFormat: 'MD',
    toFormat: 'HTML',
    badge: 'GFM Tables & Code',
    shortDescription: 'Compile Markdown (.md) notes, READMEs, and LLM outputs into clean, standalone styled HTML5 webpages.',
    longDescription: 'Turn Markdown documentation, GitHub READMEs, or ChatGPT/Claude answers into semantic HTML5 documents with headings, GFM tables, blockquotes, lists, and syntax-escaped code blocks. Copy the HTML preview or download an instant offline webpage.',
    acceptedFileTypes: ['.md', '.markdown', '.txt', 'text/markdown', 'text/plain'],
    whoCanUse: [
      { persona: 'Technical Writers & Developers', useCase: 'Convert README files and release notes into styled standalone HTML reports.' },
      { persona: 'AI Workflow Users', useCase: 'Turn long LLM Markdown responses into clean readable HTML pages.' }
    ],
    whereToUse: [
      { scenario: 'Static Documentation & Emails', benefit: 'Produce clean semantic HTML5 with zero external CSS/JS dependencies.' }
    ],
    steps: [
      { title: 'Drop `.md` or `.txt` File', description: 'Select your Markdown file from disk.' },
      { title: 'Compile Semantic HTML5', description: 'Automatically parses headings, lists, links, fenced code, and tables.' },
      { title: 'Copy Code or Download `.html`', description: 'Preview the generated markup inline and save.' }
    ],
    formatComparison: [
      { feature: 'Rendering Portability', fromVal: 'Requires Markdown viewer/IDE', toVal: 'Opens in every browser on Earth' },
      { feature: 'Security', fromVal: 'Raw links', toVal: 'Strips javascript: URI links and escapes HTML inside code' }
    ],
    shortTail: ['markdown to html', 'md to html converter', 'convert markdown to html online'],
    longTail: ['convert github markdown readme to standalone html5 webpage free'],
    faq: [
      { question: 'Does it support Markdown tables and fenced code blocks?', answer: 'Yes! GitHub-Flavored Markdown tables (`| col |`) and triple-backtick code fences are converted cleanly into semantic `<table>` and `<pre><code>` tags.' }
    ],
    limitations: ['Uses pure deterministic Markdown syntax rules (custom MDX/React JSX components are treated as text).'],
    troubleshooting: [
      { issue: 'Table columns did not parse', fix: 'Make sure the second line of your Markdown table uses dashes like `| --- | --- |`.' }
    ],
    options: {}
  }),

  // 10. XML to JSON Parser & Converter
  createBatch12Tool({
    id: 'xml-to-json',
    name: 'XML to JSON Parser & Converter',
    category: 'developer-tools',
    fromFormat: 'XML',
    toFormat: 'JSON',
    badge: 'Attributes + Schema Safe',
    isPopular: true,
    shortDescription: 'Parse SOAP payloads, RSS/Atom feeds, SVG/sitemap XML trees into clean, indented JSON preserving attributes.',
    longDescription: 'Transform legacy XML config files, Maven `pom.xml`, SVG trees, RSS feeds, or API responses into crisp JavaScript-ready JSON using native browser `DOMParser`. Automatically groups repeated sibling XML elements into JSON arrays and preserves `@attributes` and `#text`.',
    acceptedFileTypes: ['.xml', '.rss', '.svg', '.xsd', 'application/xml', 'text/xml'],
    whoCanUse: [
      { persona: 'Backend & API Developers', useCase: 'Migrate legacy SOAP/XML API fixtures into modern JSON mocks or TypeScript types.' },
      { persona: 'SEO & Data Engineers', useCase: 'Inspect large XML sitemaps and product feeds inside structured JSON.' }
    ],
    whereToUse: [
      { scenario: 'API Integration & Debugging', benefit: 'Avoid pasting sensitive enterprise XML payloads onto third-party server websites.' }
    ],
    steps: [
      { title: 'Drop XML Document', description: 'Select `.xml`, `.rss`, or `.xsd` files.' },
      { title: 'Validate & Parse Tree', description: 'Detects malformed tags immediately with clear syntax hints.' },
      { title: 'Copy or Download `.json`', description: 'Inspect formatted JSON inline and download.' }
    ],
    formatComparison: [
      { feature: 'Structure Model', fromVal: 'Verbose opening/closing XML tags', toVal: 'Compact native JS key/value JSON' },
      { feature: 'Repeated Tags', fromVal: 'Multiple sibling elements', toVal: 'Automatically grouped into JSON arrays' }
    ],
    shortTail: ['xml to json', 'convert xml to json', 'xml parser online free'],
    longTail: ['private client side xml to json converter preserving attributes'],
    faq: [
      { question: 'How are XML element attributes preserved in JSON?', answer: 'Element attributes are cleanly nested under an `@attributes` object, and mixed inner text is preserved under `#text`.' }
    ],
    limitations: ['XML files with fatal syntax errors (unclosed tags or unescaped `&`) will report the parser error location instead of guessing.'],
    troubleshooting: [
      { issue: 'Parser reports invalid entity', fix: 'Ensure bare ampersands in XML text are escaped as `&amp;`.' }
    ],
    options: {}
  }),

  // 11. JSON to XML Generator
  createBatch12Tool({
    id: 'json-to-xml',
    name: 'JSON to XML Generator',
    category: 'developer-tools',
    fromFormat: 'JSON',
    toFormat: 'XML',
    badge: 'Well-Formed UTF-8 XML',
    shortDescription: 'Convert JSON objects, arrays, and API responses into cleanly indented, entity-escaped UTF-8 XML documents.',
    longDescription: 'Turn structured JSON configs, REST payloads, or dataset exports into standards-compliant XML for enterprise ERP imports, RSS builders, and legacy SOAP gateways—processed 100% locally in memory.',
    acceptedFileTypes: ['.json', 'application/json'],
    whoCanUse: [
      { persona: 'Full-Stack & Integration Devs', useCase: 'Generate clean XML feeds or ERP batch imports directly from JSON API dumps.' }
    ],
    whereToUse: [
      { scenario: 'B2B ERP & SOAP Integrations', benefit: 'Quickly convert JSON fixtures into valid `<root>` XML schemas with safe character escaping.' }
    ],
    steps: [
      { title: 'Drop JSON File', description: 'Select a `.json` object or array.' },
      { title: 'Escape & Indent Tree', description: 'Synthesizes sanitized tag names and safe XML entities.' },
      { title: 'Copy or Download `.xml`', description: 'Review the formatted XML output and save.' }
    ],
    formatComparison: [
      { feature: 'Syntax Safety', fromVal: 'JSON keys with spaces/digits', toVal: 'Sanitized legal XML element names + escaped entities' },
      { feature: 'Array Mapping', fromVal: 'JSON `[...]` arrays', toVal: 'Repeated structured XML elements' }
    ],
    shortTail: ['json to xml', 'convert json to xml', 'json xml converter'],
    longTail: ['convert json array to valid xml file client side free'],
    faq: [
      { question: 'Does JSON to XML handle special characters like &, <, and quotes?', answer: 'Yes. Every string value passes through strict XML entity escaping (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`) so the output validates cleanly.' }
    ],
    limitations: ['JSON keys starting with numbers are prefixed cleanly with `n_` to satisfy strict XML element naming specs.'],
    troubleshooting: [
      { issue: 'Invalid JSON syntax alert', fix: 'Remove trailing commas or single quotes from your JSON before uploading.' }
    ],
    options: {}
  }),

  // 12. SVG to CSS Data URI Optimizer
  createBatch12Tool({
    id: 'svg-to-css-uri',
    name: 'SVG to CSS Data URI Optimizer',
    category: 'developer-tools',
    fromFormat: 'SVG',
    toFormat: 'CSS',
    badge: 'Zero-Request Inline CSS',
    isRecommended: true,
    shortDescription: 'Minify SVG icons, strip `<script>` risks, and generate lightweight URL-encoded CSS `background-image` snippets.',
    longDescription: 'Eliminate extra HTTP requests for small UI icons, checkmarks, and wave dividers by converting SVG files into compact UTF-8 URL-encoded CSS Data URIs (`url("data:image/svg+xml,...")`)—typically 20%–35% smaller than Base64.',
    acceptedFileTypes: ['.svg', 'image/svg+xml'],
    whoCanUse: [
      { persona: 'Front-End & CSS Engineers', useCase: 'Embed tiny UI icons and custom select arrows straight into stylesheets for instant first paint.' }
    ],
    whereToUse: [
      { scenario: 'Zero-HTTP-Request Iconography', benefit: 'Produces ready-to-paste `.css` classes that load synchronously with your stylesheet.' }
    ],
    steps: [
      { title: 'Drop SVG Icon(s)', description: 'Select one or multiple `.svg` vector icons.' },
      { title: 'Minify & Encode URI', description: 'Strips comments/whitespace and encodes compact CSS Data URI.' },
      { title: 'Copy CSS or Download `.css`', description: 'Paste straight into Tailwind utilities or global CSS.' }
    ],
    formatComparison: [
      { feature: 'Payload Overhead', fromVal: 'Base64 adds ~33% bloat', toVal: 'URL-encoded UTF-8 SVG (~25% smaller)' },
      { feature: 'Network Latency', fromVal: 'External `.svg` asset request', toVal: 'Inline zero-request CSS background' }
    ],
    shortTail: ['svg to css', 'svg data uri generator', 'svg to css background image'],
    longTail: ['convert svg icon to minified css data uri without base64'],
    faq: [
      { question: 'Why is URL-encoded SVG better than Base64 for CSS icons?', answer: 'Base64 inflates ASCII SVG markup by ~33%, whereas selective UTF-8 percent-encoding keeps text tags readable and gzip-friendly.' }
    ],
    limitations: ['Best for icons and badges under 20 KB; huge vector illustrations belong in external cached `.svg` files.'],
    troubleshooting: [
      { issue: 'Icon did not appear inside CSS box', fix: 'Make sure your target HTML element has explicit `width` and `height` CSS dimensions.' }
    ],
    options: {}
  })
];
